#include <SPI.h>
#include <mcp_can.h>

// --- SPRZĘT ---
const int SPI_CS_PIN = 10;
const int CAN_INT_PIN = 2;
const int TJA_STB = 5;
const int TJA_EN  = 6;
const int TJA_ERR = 4;

// --- SERIAL ---
#define SERIAL_BUF_SIZE 64

// --- NM / CAN (PQ35) ---
const long NM_GATEWAY_ID = 0x42B;
const long NM_ARDUINO_ID = 0x40B;
const int NEXT_NODE_ID = 0x2B;

// NM — bajt 1 wg id_ramek.txt (mNM_Gateway_I): CmdRing bit8, CmdAlive bit9, CmdLimpHome bit10,
// SleepInd bit12, SleepAck bit13 → maski w bajcie 1:
const uint8_t NM_CMD_RING = 0x01;
const uint8_t NM_CMD_ALIVE = 0x02;
const uint8_t NM_MASK_CMD_LIMP = 0x04;
const uint8_t NM_MASK_SLEEP = 0x10;
const uint8_t NM_MASK_SLEEP_ACK = 0x20;
const uint8_t NM_NODE_SELF = 0x0B;

// Odpowiedź NM węzła 0x40B (Node 0x0B): układ bitów bajtu 1 jak w id_ramek_tylko_radio.txt → NWM_Radio
// (CmdRing 8, CmdAlive 9, CmdLimpHome 10, SleepInd 12, SleepAck 13) — ten sam układ co mNM_Gateway_I 0x42B.

// --- INTERWAŁY ---
const unsigned long INTERVAL_RADIO_PUMP = 150;
const unsigned long INTERVAL_HANG_CHECK = 2000;
const unsigned long INTERVAL_TJA_ERR_LOG = 5000;

// Ograniczenie czasu w pętli INT — nie blokuj aktualizacji stanu / timerów.
const uint8_t MAX_FRAMES_PER_INT_LOOP = 48;

const long CAN_ID_RADIO_STATUS = 0x661;
const long CAN_ID_SNIFFER_IGNORE_A = 0x531;

MCP_CAN CAN0(SPI_CS_PIN);

// --- STAN (NM / watchdog / wake) ---
// Domyślnie: brak powodu wybudzenia — bez nadawania NM (0x40B), bez 0x661.
unsigned long lastSendTime = 0;
// Ostatni czas ramki Gateway NM do nas (0x42B→0x0B) — tylko to liczy się do ERR:CAN:HANG i kasowania latcha.
unsigned long lastGwSelfNmMs = 0;
bool isHanging = false;
// Jedna flaga stanu snu: używana równocześnie przez watchdog i politykę NM.
bool busSleep = true;
// Przyczyna wybudzenia (bajty 2–4 Alive z 0x42B→0x0B): !=0 ⇒ logiczne „bus wybudzony”.
bool isBusActive = false;
unsigned long lastErrCheckMs = 0;

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

// --- HELPERS ---
inline uint32_t decodeWakeCombo(const uint8_t *buf) {
  return (uint32_t)buf[2] | ((uint32_t)buf[3] << 8) | ((uint32_t)buf[4] << 16);
}

void setAutoNmState(AutoNmState next) {
  if (autoNmState == next) return;
  autoNmState = next;
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
  for (uint8_t i = 0; i < trackedCount; i++) {
    if (trackedFrames[i].id == id) {
      for (uint8_t j = 0; j < len; j++) {
        if (trackedFrames[i].data[j] != data[j]) {
          memcpy(trackedFrames[i].data, data, len);
          trackedFrames[i].len = len;
          return true;
        }
      }
      return false;
    }
  }
  if (trackedCount < MAX_TRACKED_IDS) {
    trackedFrames[trackedCount].id = id;
    trackedFrames[trackedCount].len = len;
    memcpy(trackedFrames[trackedCount].data, data, len);
    trackedCount++;
  }
  return true;
}

inline bool isNmCommandFrame(uint8_t b1) {
  return (b1 & (NM_CMD_RING | NM_CMD_ALIVE | NM_MASK_CMD_LIMP)) != 0;
}

void updateSleepSignalsFromGateway(uint8_t b1, const uint8_t *buf, uint8_t len) {
  if (buf[0] != NM_NODE_SELF) return;

  lastGwSelfNmMs = millis();
  isHanging = false;

  static bool prevGwSleepBit = false;
  bool sleepNow = (b1 & NM_MASK_SLEEP) != 0;
  if (sleepNow && !prevGwSleepBit) {
    Serial.println(F("SYS:CAN:SLEEP_IND"));
    busSleep = true;
    setAutoNmState(AUTO_SILENT_LISTEN);
  }
  prevGwSleepBit = sleepNow;
  if (sleepNow) {
    busSleep = true;
  } else if ((b1 & NM_CMD_ALIVE) != 0) {
    // Po wejściu w sleep ignorujemy tylko Alive bez przyczyn wake (wakeCombo==0),
    // ale NIE blokujemy ścieżki WAKE_START.
    bool ignoreIdleAlive = false;
    if (busSleep && !isBusActive && len >= 5) {
      ignoreIdleAlive = (decodeWakeCombo(buf) == 0);
    }
    if (!ignoreIdleAlive) {
      busSleep = false;
      setAutoNmState(isBusActive ? AUTO_ACTIVE : AUTO_SLEEP_PREP);
    }
  }
}

void updateWakeStateFromAlive(uint8_t b1, const uint8_t *buf, uint8_t len) {
  if (buf[0] != NM_NODE_SELF || (b1 & NM_CMD_ALIVE) == 0 || len < 5) return;

  uint32_t wakeCombo = decodeWakeCombo(buf);
  static uint32_t prevWakeCombo = 0;
  if (prevWakeCombo == 0 && wakeCombo != 0) {
    busSleep = false;
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
  uint8_t txB1 = 0;
  if (gatewayByte1 & NM_MASK_CMD_LIMP) {
    txB1 |= NM_CMD_ALIVE;
  } else if (gatewayByte1 & NM_CMD_RING) {
    txB1 |= NM_CMD_RING;
  } else {
    txB1 |= NM_CMD_ALIVE;
  }

  bool announceSleepReady = (autoNmState == AUTO_SLEEP_PREP) || (gatewayByte1 & NM_MASK_SLEEP);
  if (announceSleepReady) {
    txB1 |= NM_MASK_SLEEP;
  }
  if ((gatewayByte1 & NM_MASK_SLEEP_ACK) && (gatewayByte1 & NM_MASK_SLEEP)) {
    txB1 |= NM_MASK_SLEEP_ACK;
  }

  return txB1;
}

void handleGatewayNm(uint32_t id, uint8_t *buf, uint8_t len) {
  if (id != (uint32_t)NM_GATEWAY_ID || len < 2) return;

  uint8_t b1 = buf[1];
  // Ring / Alive / LimpHome — dowolna z tych flag w bajcie 1 (id_ramek, bity 8–10).
  bool gwNmCmd = isNmCommandFrame(b1);
  bool tokenToSelf = (buf[0] == NM_NODE_SELF && gwNmCmd);
  updateSleepSignalsFromGateway(b1, buf, len);
  updateWakeStateFromAlive(b1, buf, len);

  bool shouldReplyNm = tokenToSelf && !busSleep;

  if (shouldReplyNm) {
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
  Serial.print(F("0x")); Serial.print(rxId, HEX); Serial.print(F(":"));
  for (int i = 0; i < len; i++) {
    if (rxBuf[i] < 0x10) Serial.print(F("0"));
    Serial.print(rxBuf[i], HEX); if (i < len - 1) Serial.print(F(" "));
  }
  Serial.println();
}

void processCanRxLoop() {
  long unsigned int rxId;
  unsigned char len = 0;
  unsigned char rxBuf[8];

  uint8_t intFrames = 0;
  while (!digitalRead(CAN_INT_PIN) && intFrames < MAX_FRAMES_PER_INT_LOOP) {
    if (CAN0.readMsgBuf(&rxId, &len, rxBuf) != CAN_OK) {
      break;
    }
    intFrames++;
    handleGatewayNm((uint32_t)rxId, rxBuf, len);

    if (shouldPrintIncomingFrame(rxId, len, rxBuf)) {
      printIncomingFrame(rxId, len, rxBuf);
    }
    CAN0.mcp2515_modifyRegister(0x2D, 0xFF, 0x00);
  }
}

void runHealthChecks() {
  // Watchdog komunikacji: sprawdzany w każdej iteracji pętli.
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
  Serial.begin(115200);
  Serial.setTimeout(10);
  pinMode(CAN_INT_PIN, INPUT);
  pinMode(TJA_ERR, INPUT_PULLUP);
  pinMode(TJA_STB, OUTPUT);
  pinMode(TJA_EN, OUTPUT);
  digitalWrite(TJA_STB, HIGH);
  digitalWrite(TJA_EN, HIGH);

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
