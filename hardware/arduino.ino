#include <SPI.h>
#include <mcp_can.h>

// --- SPRZĘT ---
const int SPI_CS_PIN = 10;
const int CAN_INT_PIN = 2;
const int TJA_STB = 5;
const int TJA_EN  = 6;
const int TJA_ERR = 4;
const int RELAY_ACC_PIN = 7;
const int RELAY_ILL_PIN = 8;
const int RELAY_BACK_PIN = 9;

// --- SERIAL ---
#define SERIAL_BUF_SIZE 64

// --- NM / CAN (PQ35) ---
const long NM_GATEWAY_ID = 0x42B;
const long NM_ARDUINO_ID = 0x40B;
const int NEXT_NODE_ID = 0x2B;

// NM — bajt 1 wg id_ramek.txt (mNM_Gateway_I): CmdRing bit8, CmdAlive bit9, CmdLimpHome bit10,
// SleepInd bit12, SleepAck bit13 → maski w bajcie 1 (SleepAck tylko w naszym TX, gateway go nie wysyła).
const uint8_t NM_CMD_RING = 0x01;
const uint8_t NM_CMD_ALIVE = 0x02;
const uint8_t NM_MASK_CMD_LIMP = 0x04;
const uint8_t NM_MASK_SLEEP = 0x10;
// Bit SleepAck w odpowiedzi 0x40B (nigdy nie interpretujemy go w ramkach z gateway).
const uint8_t NM_TX_SLEEP_ACK = 0x20;
const uint8_t NM_NODE_SELF = 0x0B;

// Odpowiedź NM węzła 0x40B (Node 0x0B): układ bitów bajtu 1 jak w id_ramek_tylko_radio.txt → NWM_Radio
// (CmdRing 8, CmdAlive 9, CmdLimpHome 10, SleepInd 12, SleepAck 13) — ten sam układ co mNM_Gateway_I 0x42B.

// --- INTERWAŁY ---
const unsigned long INTERVAL_RADIO_PUMP = 150;
const unsigned long INTERVAL_HANG_CHECK = 2000;
const unsigned long INTERVAL_TJA_ERR_LOG = 5000;
const unsigned long INTERVAL_RELAY_SILENCE_OFF = 300000;

// Ograniczenie czasu w pętli INT — nie blokuj aktualizacji stanu / timerów.
const uint8_t MAX_FRAMES_PER_INT_LOOP = 48;

const long CAN_ID_RADIO_STATUS = 0x661;
const long CAN_ID_SNIFFER_IGNORE_A = 0x531;
const long CAN_ID_IGNITION_STATUS = 0x2C3;
const long CAN_ID_DIMMING = 0x635;
const long CAN_ID_LIGHT_STATUS = 0x531;
const uint8_t CAN_MAX_DLEN = 8;
const uint32_t CAN_ID_MASK = 0x1FFFFFFF;

MCP_CAN CAN0(SPI_CS_PIN);

// --- STAN (NM / watchdog / wake) ---
// Domyślnie: brak powodu wybudzenia — bez nadawania NM (0x40B), bez 0x661.
unsigned long lastSendTime = 0;
// Ostatni czas ramki Gateway NM do nas (0x42B→0x0B) — tylko to liczy się do ERR:CAN:HANG i kasowania latcha.
unsigned long lastGwSelfNmMs = 0;
bool isHanging = false;
// Tylko watchdog ERR:CAN:HANG (runHealthChecks) — nigdzie indziej nie czytaj; komunikacja zawsze gotowa.
bool busSleep = true;
// Przyczyna wybudzenia (bajty 2–4 Alive z 0x42B→0x0B): !=0 ⇒ logiczne „bus wybudzony”.
bool isBusActive = false;
unsigned long lastErrCheckMs = 0;
unsigned long lastAnyCanActivityMs = 0;
bool relayForcedOffBySilence = false;

bool relayAccOn = false;
bool relayIllOn = false;
bool relayBackOn = false;

enum AutoNmState : uint8_t {
  AUTO_ACTIVE = 0,
  AUTO_SLEEP_PREP,
  AUTO_SILENT_LISTEN
};

AutoNmState autoNmState = AUTO_SILENT_LISTEN;

// --- FORWARD DECLARATIONS ---
void setAutoNmState(AutoNmState next);
void handleGatewayNm(uint32_t id, uint8_t *buf, uint8_t len);
void checkHardwareErrors();
void processSerial();
void updateRelaySignalsFromFrame(uint32_t id, const uint8_t *buf, uint8_t len);
void applyRelayOutputs();

// --- HELPERS ---
inline uint32_t decodeWakeCombo(const uint8_t *buf) {
  return (uint32_t)buf[2] | ((uint32_t)buf[3] << 8) | ((uint32_t)buf[4] << 16);
}

inline uint32_t normalizeCanId(uint32_t rawId) {
  return rawId & CAN_ID_MASK;
}

inline uint8_t normalizeCanLen(uint8_t rawLen) {
  return (rawLen > CAN_MAX_DLEN) ? CAN_MAX_DLEN : rawLen;
}

void setAutoNmState(AutoNmState next) {
  if (autoNmState == next) return;
  autoNmState = next;
}

void applyRelayOutputs() {
  digitalWrite(RELAY_ACC_PIN, relayAccOn ? LOW : HIGH);
  digitalWrite(RELAY_ILL_PIN, relayIllOn ? LOW : HIGH);
  digitalWrite(RELAY_BACK_PIN, relayBackOn ? LOW : HIGH);
}

void updateRelaySignalsFromFrame(uint32_t id, const uint8_t *buf, uint8_t len) {
  if (len < 1) return;

  if (id == (uint32_t)CAN_ID_IGNITION_STATUS) {
    relayAccOn = (buf[0] & 0x02) != 0; // ZS1_ZAS_Kl_15
    applyRelayOutputs();
    return;
  }

  if (id == (uint32_t)CAN_ID_DIMMING) {
    uint8_t displayPercent = buf[0] & 0x7F; // DI1_Display (0..100)
    bool displayFault = (buf[0] & 0x80) != 0; // DI1_Display_def
    relayIllOn = (!displayFault && displayPercent > 0);
    applyRelayOutputs();
    return;
  }

  if (id == (uint32_t)CAN_ID_LIGHT_STATUS) {
    relayBackOn = (buf[0] & 0x20) != 0; // LIA_Rueckfahrlicht
    applyRelayOutputs();
  }
}

// --- LOGIKA DELTA ---
#define MAX_TRACKED_IDS 60
struct CANFrame { uint32_t id; uint8_t len; uint8_t data[8]; };
CANFrame trackedFrames[MAX_TRACKED_IDS];
uint8_t trackedCount = 0;

// --- FILTRY ---
bool isDiagFrame(uint32_t id) {
  if (id >= 0x200 && id <= 0x27F) return true; // TP 2.0 Setup
  if (id == 0x300) return true;                // TP 2.0 RX
  if (id >= 0x700 && id <= 0x7FF) return true; // UDS/KWP
  return false;
}

bool isDelta(uint32_t id, uint8_t len, uint8_t *data) {
  uint8_t safeLen = normalizeCanLen(len);
  for (uint8_t i = 0; i < trackedCount; i++) {
    if (trackedFrames[i].id == id) {
      for (uint8_t j = 0; j < safeLen; j++) {
        if (trackedFrames[i].data[j] != data[j]) {
          memcpy(trackedFrames[i].data, data, safeLen);
          trackedFrames[i].len = safeLen;
          return true;
        }
      }
      return false;
    }
  }
  if (trackedCount < MAX_TRACKED_IDS) {
    trackedFrames[trackedCount].id = id;
    trackedFrames[trackedCount].len = safeLen;
    memcpy(trackedFrames[trackedCount].data, data, safeLen);
    trackedCount++;
  }
  return true;
}

inline bool isNmCommandFrame(uint8_t b1) {
  return (b1 & (NM_CMD_RING | NM_CMD_ALIVE | NM_MASK_CMD_LIMP)) != 0;
}

// Odbiór gateway NM: timer HANG, latch isHanging, stan auto-NM; busSleep wyłącznie pod watchdog HANG.
void updateSleepSignalsFromGateway(uint8_t b1, const uint8_t *buf, uint8_t len) {
  if (buf[0] != NM_NODE_SELF) return;

  lastGwSelfNmMs = millis();
  isHanging = false;

  if ((b1 & NM_MASK_SLEEP) != 0) {
    Serial.println(F("SYS:CAN:SLEEP_IND"));
    busSleep = true;
    setAutoNmState(AUTO_SILENT_LISTEN);
    return;
  }

  if ((b1 & NM_CMD_ALIVE) != 0) {
    busSleep = false;
    setAutoNmState(isBusActive ? AUTO_ACTIVE : AUTO_SLEEP_PREP);
  }
}

void updateWakeStateFromAlive(uint8_t b1, const uint8_t *buf, uint8_t len) {
  if (buf[0] != NM_NODE_SELF || (b1 & NM_CMD_ALIVE) == 0 || len < 5) return;
  if ((b1 & NM_MASK_SLEEP) != 0) return;

  uint32_t wakeCombo = decodeWakeCombo(buf);
  static uint32_t prevWakeCombo = 0;
  if (prevWakeCombo == 0 && wakeCombo != 0) {
    isBusActive = true;
    setAutoNmState(AUTO_ACTIVE);
  } else if (prevWakeCombo != 0 && wakeCombo == 0) {
    isBusActive = false;
    // Po WAKE_END utrzymujemy odpowiedzi NM, ale deklarujemy gotowość snu.
    setAutoNmState(AUTO_SLEEP_PREP);
  }
  prevWakeCombo = wakeCombo;
}

uint8_t buildNmReplyByte1(uint8_t gatewayByte1) {
  if ((gatewayByte1 & NM_MASK_SLEEP) != 0) {
    return NM_CMD_RING | NM_TX_SLEEP_ACK;
  }

  if (gatewayByte1 & NM_MASK_CMD_LIMP) {
    return NM_CMD_ALIVE;
  }
  if (gatewayByte1 & NM_CMD_RING) {
    return NM_CMD_RING;
  }
  return NM_CMD_ALIVE;
}

void handleGatewayNm(uint32_t id, uint8_t *buf, uint8_t len) {
  if (id != (uint32_t)NM_GATEWAY_ID || len < 2) return;

  uint8_t b1 = buf[1];
  updateSleepSignalsFromGateway(b1, buf, len);
  updateWakeStateFromAlive(b1, buf, len);

  if (buf[0] == NM_NODE_SELF && isNmCommandFrame(b1)) {
    uint8_t txB1 = buildNmReplyByte1(b1);
    unsigned char txBuf[6] = {(unsigned char)NEXT_NODE_ID, txB1, 0, 0, 0, 0};
    CAN0.sendMsgBuf(NM_ARDUINO_ID, 0, 6, txBuf);
  }
}

// --- DIAGNOSTYKA BŁĘDÓW HW ---
void checkHardwareErrors() {
  byte err = CAN0.checkError();
  if (err != 0) {
    Serial.print(F("ERR:HW:MCP:0x"));
    if (err < 0x10) Serial.print(F("0"));
    Serial.println(err, HEX);
    if (err & 0x1D) {
      CAN0.mcp2515_modifyRegister(0x30, 0x08, 0x00); // MCP_TXB0CTRL
      CAN0.mcp2515_modifyRegister(0x40, 0x08, 0x00); // MCP_TXB1CTRL
      CAN0.mcp2515_modifyRegister(0x50, 0x08, 0x00); // MCP_TXB2CTRL
      CAN0.mcp2515_modifyRegister(0x2D, 0xFF, 0x00); // MCP_EFLG
    }
    if (err & 0x20) CAN0.setMode(MCP_NORMAL);
  }

  static unsigned long lastTjaErrLog = 0;
  if (digitalRead(TJA_ERR) == LOW) {
    unsigned long now = millis();
    if (now - lastTjaErrLog >= INTERVAL_TJA_ERR_LOG) {
      lastTjaErrLog = now;
      Serial.println(F("ERR:HW:TJA"));
    }
  }
}

// --- ODBIERANIE Z SERIALA (TX na CAN) ---
void processSerial() {
  if (Serial.available() > 0) {
    char buf[SERIAL_BUF_SIZE];
    size_t len = Serial.readBytesUntil('\n', buf, SERIAL_BUF_SIZE - 1);
    buf[len] = '\0';
    while (len > 0 && (buf[len - 1] == '\r' || buf[len - 1] == ' ')) {
      buf[--len] = '\0';
    }

    if (strncmp(buf, "TX:", 3) == 0) {
      char* ptr;
      long txId = strtol(buf + 3, &ptr, 16);

      if (*ptr == ':') {
        ptr++;
        int txLen = strtol(ptr, &ptr, 10);
        if (txLen < 0) txLen = 0;
        if (txLen > 8) txLen = 8;

        if (*ptr == ':') {
          ptr++;
          byte txBuf[8] = {0};
          for (int i = 0; i < txLen && i < 8; i++) {
            txBuf[i] = (byte)strtol(ptr, &ptr, 16);
          }
          CAN0.sendMsgBuf(txId, 0, txLen, txBuf);
        }
      }
    }
  }
}

inline bool shouldPrintIncomingFrame(uint32_t rxId, uint8_t len, uint8_t *rxBuf) {
  if (rxId == CAN_ID_SNIFFER_IGNORE_A || rxId == CAN_ID_RADIO_STATUS || rxId == NM_ARDUINO_ID) {
    return false;
  }
  return isDiagFrame(rxId) || isDelta(rxId, len, rxBuf);
}

void printIncomingFrame(uint32_t rxId, uint8_t len, uint8_t *rxBuf) {
  uint8_t safeLen = normalizeCanLen(len);
  Serial.print(F("0x")); Serial.print(rxId, HEX); Serial.print(F(":"));
  for (uint8_t i = 0; i < safeLen; i++) {
    if (rxBuf[i] < 0x10) Serial.print(F("0"));
    Serial.print(rxBuf[i], HEX); if (i < safeLen - 1) Serial.print(F(" "));
  }
  Serial.println();
}

void processCanRxLoop() {
  long unsigned int rawRxId;
  unsigned char len = 0;
  unsigned char rxBuf[8];

  uint8_t intFrames = 0;
  while (!digitalRead(CAN_INT_PIN) && intFrames < MAX_FRAMES_PER_INT_LOOP) {
    if (CAN0.readMsgBuf(&rawRxId, &len, rxBuf) != CAN_OK) {
      break;
    }
    lastAnyCanActivityMs = millis();
    relayForcedOffBySilence = false;
    uint32_t rxId = normalizeCanId((uint32_t)rawRxId);
    len = normalizeCanLen(len);
    intFrames++;
    updateRelaySignalsFromFrame(rxId, rxBuf, len);
    handleGatewayNm(rxId, rxBuf, len);

    if (shouldPrintIncomingFrame(rxId, len, rxBuf)) {
      printIncomingFrame(rxId, len, rxBuf);
    }
    CAN0.mcp2515_modifyRegister(0x2D, 0xFF, 0x00);
  }
}

void runHealthChecks() {
  if (!relayForcedOffBySilence && lastAnyCanActivityMs != 0
      && (millis() - lastAnyCanActivityMs > INTERVAL_RELAY_SILENCE_OFF)) {
    relayAccOn = false;
    relayIllOn = false;
    relayBackOn = false;
    applyRelayOutputs();
    relayForcedOffBySilence = true;
    Serial.println(F("SYS:RELAYS:FORCED_OFF_BY_SILENCE"));
  }

  // Watchdog komunikacji (busSleep tylko tutaj — wyciszenie po SleepInd z gateway).
  if (!isHanging && !busSleep && lastGwSelfNmMs != 0
      && (millis() - lastGwSelfNmMs > INTERVAL_HANG_CHECK)) {
    Serial.println(F("ERR:CAN:HANG"));
    isHanging = true;
  }

  // Kontrola błędów HW ograniczona czasowo.
  if (millis() - lastErrCheckMs > 1000) {
    lastErrCheckMs = millis();
    checkHardwareErrors();
  }
}

void pumpRadioIfActive() {
  // 0x661 tylko w fazie aktywnej — po WAKE_END nie podtrzymujemy „radia”.
  if (autoNmState == AUTO_ACTIVE && (millis() - lastSendTime >= INTERVAL_RADIO_PUMP)) {
    lastSendTime = millis();
    unsigned char stRadio[8] = {0x01, 0x01, 0x10, 0, 0, 0, 0, 0};
    CAN0.sendMsgBuf(CAN_ID_RADIO_STATUS, 0, 8, stRadio);
  }
}

void setup() {
  Serial.begin(230400);
  Serial.setTimeout(10);
  pinMode(CAN_INT_PIN, INPUT);
  pinMode(TJA_ERR, INPUT_PULLUP);
  pinMode(TJA_STB, OUTPUT);
  pinMode(TJA_EN, OUTPUT);
  pinMode(RELAY_ACC_PIN, OUTPUT);
  pinMode(RELAY_ILL_PIN, OUTPUT);
  pinMode(RELAY_BACK_PIN, OUTPUT);
  digitalWrite(TJA_STB, HIGH);
  digitalWrite(TJA_EN, HIGH);
  applyRelayOutputs();
  lastAnyCanActivityMs = millis();

  if (CAN0.begin(MCP_ANY, CAN_100KBPS, MCP_8MHZ) == CAN_OK) {
    CAN0.mcp2515_modifyRegister(0x0F, 0x08, 0x08); // MCP_CANCTRL (One-Shot)
    CAN0.setMode(MCP_NORMAL);
    Serial.println(F("SYS:HW:READY"));
    Serial.println(F("SYS:CAN:NM_MODE_AUTO"));
    setAutoNmState(AUTO_SILENT_LISTEN);
  } else {
    Serial.println(F("ERR:HW:INIT_FAIL"));
    while (1);
  }
}

void loop() {
  processSerial();
  processCanRxLoop();
  runHealthChecks();
  pumpRadioIfActive();
}
