/*
 * hardware v4.1 — hard sleep silence:
 * po SleepInd brak odpowiedzi NM (0x40B), bez wyjątków na SleepAck.
 * Snapshot aktualnego hardware/hardware.ino do testu A (sleep gate).
 */
#include <SPI.h>
#include <mcp_can.h>

// --- KONFIGURACJA SPRZĘTOWA ---
const int SPI_CS_PIN = 10;
const int CAN_INT_PIN = 2;
const int TJA_STB = 5;
const int TJA_EN  = 6;
const int TJA_ERR = 4;

// --- WIELKOŚĆ BUFORA SERIAL ---
#define SERIAL_BUF_SIZE 64

// --- DEFINICJE VAG PQ35 (LOGIKA NIETYKALNA) ---
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

// Maszyna stanów sieci (bez „zagadywania” po WAKE_END — patrz plan NM / uśpienie).
enum NetState : uint8_t {
  NET_SLEEP = 0,       // brak pompy 0x661; NM tylko gdy Gateway nadal adresuje 0x0B
  NET_ACTIVE,          // pełna komunikacja (wake potwierdzony)
  NET_GRACE,           // po WAKE_END: krótka synchronizacja, bez pompy radia
  NET_SLEEP_READY      // po SleepInd lub końcówce Grace — tylko niezbędny NM, bez 0x661
};

const unsigned long GRACE_AFTER_WAKE_END_MS = 2000;
const unsigned long SLEEP_READY_TO_SLEEP_MS = 12000;
const unsigned long AUTO_SLEEP_PREP_REPLY_MS = 600;

const unsigned long INTERVAL_RADIO_PUMP = 150;
const unsigned long INTERVAL_HANG_CHECK = 2000;
const unsigned long INTERVAL_TJA_ERR_LOG = 5000;

// Ograniczenie czasu w pętli INT — nie blokuj aktualizacji stanu / timerów.
const uint8_t MAX_FRAMES_PER_INT_LOOP = 48;

const long CAN_ID_RADIO_STATUS = 0x661;
const long CAN_ID_SNIFFER_IGNORE_A = 0x531;

MCP_CAN CAN0(SPI_CS_PIN);

// --- ZMIENNE STANU I TIMERY ---
// Domyślnie: brak powodu wybudzenia — bez nadawania NM (0x40B), bez 0x661.
unsigned long lastSendTime = 0;
// Ostatni czas ramki Gateway NM do nas (0x42B→0x0B) — tylko to liczy się do ERR:CAN:HANG i kasowania latcha.
unsigned long lastGwSelfNmMs = 0;
// Ostatni bajt 2 z ramki Alive 0x42B→0x0B (nie aktualizowany przy Ring), pomocniczo do diagnostyki.
byte lastWakeCauseByte = 0x00;
bool isHanging = false;
// Flaga tylko dla watchdoga HANG: true po SLEEP_IND, false po Alive.
bool isSleepIndicated = true;
// Przyczyna wybudzenia (bajty 2–4 Alive z 0x42B→0x0B): !=0 ⇒ logiczne „bus wybudzony”.
bool isBusActive = false;

NetState netState = NET_SLEEP;
unsigned long graceStartMs = 0;
unsigned long sleepReadyStartMs = 0;
bool hadWakeEndForGrace = false;
bool sleepAckSeen = false;

enum AutoNmState : uint8_t {
  AUTO_ACTIVE = 0,
  AUTO_SLEEP_PREP,
  AUTO_SILENT_LISTEN
};

AutoNmState autoNmState = AUTO_SILENT_LISTEN;

void setAutoNmState(AutoNmState next) {
  if (autoNmState == next) return;
  autoNmState = next;
  if (next == AUTO_ACTIVE) {
    Serial.println(F("SYS:CAN:NM_AUTO_ACTIVE"));
  } else if (next == AUTO_SLEEP_PREP) {
    Serial.println(F("SYS:CAN:NM_AUTO_PREP"));
  } else {
    Serial.println(F("SYS:CAN:NM_AUTO_SILENT"));
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

// Przejścia czasowe Grace / SleepReady → Sleep (wywołuj z loop).
void updateNetStateMachine() {
  unsigned long now = millis();
  if (netState == NET_GRACE) {
    if ((now - graceStartMs) >= GRACE_AFTER_WAKE_END_MS) {
      netState = NET_SLEEP_READY;
      sleepReadyStartMs = now;
    }
  }
  if (netState == NET_SLEEP_READY) {
    if ((now - sleepReadyStartMs) >= SLEEP_READY_TO_SLEEP_MS) {
      netState = NET_SLEEP;
    }
  }
  if (autoNmState == AUTO_SLEEP_PREP
      && ((now - graceStartMs) >= AUTO_SLEEP_PREP_REPLY_MS || sleepAckSeen)) {
    setAutoNmState(AUTO_SILENT_LISTEN);
  }
}

void handleGatewayNm(uint32_t id, uint8_t *buf, uint8_t len) {
  if (id != (uint32_t)NM_GATEWAY_ID || len < 4) return;

  uint8_t b1 = buf[1];
  // Ring / Alive / LimpHome — dowolna z tych flag w bajcie 1 (id_ramek, bity 8–10).
  bool gwNmCmd = (b1 & (NM_CMD_RING | NM_CMD_ALIVE | NM_MASK_CMD_LIMP)) != 0;

  // Tryb snu / watchdog HANG — wyłącznie z Gateway NM do 0x0B (nie z innych ID).
  if (buf[0] == NM_NODE_SELF && len >= 2) {
    lastGwSelfNmMs = millis();
    isHanging = false;

    static bool prevGwSleepBit = false;
    bool sleepNow = (b1 & NM_MASK_SLEEP) != 0;
    sleepAckSeen = (b1 & NM_MASK_SLEEP_ACK) != 0;
    if (sleepNow && !prevGwSleepBit) {
      Serial.println(F("SYS:CAN:SLEEP_IND"));
      netState = NET_SLEEP_READY;
      sleepReadyStartMs = millis();
      // Twarda reguła: po wejściu w sleep natychmiast przechodzimy do ciszy NM.
      setAutoNmState(AUTO_SILENT_LISTEN);
    }
    prevGwSleepBit = sleepNow;
    if (sleepNow) {
      isSleepIndicated = true;
    } else if ((b1 & NM_CMD_ALIVE) != 0) {
      isSleepIndicated = false;
    }
  }

  if (buf[0] == NM_NODE_SELF && (b1 & NM_CMD_ALIVE) != 0) {
    lastWakeCauseByte = buf[2];

    if (len >= 5) {
      uint32_t wakeCombo = (uint32_t)buf[2] | ((uint32_t)buf[3] << 8) | ((uint32_t)buf[4] << 16);
      static uint32_t prevWakeCombo = 0;
      if (prevWakeCombo == 0 && wakeCombo != 0) {
        Serial.println(F("SYS:CAN:WAKE_START"));
        isBusActive = true;
        netState = NET_ACTIVE;
        hadWakeEndForGrace = false;
        sleepAckSeen = false;
        setAutoNmState(AUTO_ACTIVE);
      } else if (prevWakeCombo != 0 && wakeCombo == 0) {
        Serial.println(F("SYS:CAN:WAKE_END"));
        isBusActive = false;
        netState = NET_GRACE;
        graceStartMs = millis();
        hadWakeEndForGrace = true;
        setAutoNmState(AUTO_SLEEP_PREP);
      }
      prevWakeCombo = wakeCombo;
    }
  }

  bool tokenToSelf = (buf[0] == NM_NODE_SELF && gwNmCmd);
  // Twarda reguła sleep-first: odpowiadamy NM tylko w aktywnej fazie, nigdy po SleepInd.
  bool shouldReplyNm = tokenToSelf && (autoNmState == AUTO_ACTIVE) && !isSleepIndicated;

  if (shouldReplyNm) {
    uint8_t txB1 = NM_CMD_ALIVE;
    if (b1 & NM_MASK_CMD_LIMP) {
      txB1 = NM_CMD_RING;
    }
    if (b1 & NM_MASK_SLEEP) {
      txB1 |= NM_MASK_SLEEP;
    }
    if (b1 & NM_MASK_SLEEP_ACK) {
      txB1 |= NM_MASK_SLEEP_ACK;
    }
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
  long unsigned int rxId;
  unsigned char len = 0;
  unsigned char rxBuf[8];

  processSerial();

  updateNetStateMachine();

  uint8_t intFrames = 0;
  while (!digitalRead(CAN_INT_PIN) && intFrames < MAX_FRAMES_PER_INT_LOOP) {
    if (CAN0.readMsgBuf(&rxId, &len, rxBuf) != CAN_OK) {
      break;
    }
    intFrames++;
    handleGatewayNm((uint32_t)rxId, rxBuf, len);

    if (rxId != CAN_ID_SNIFFER_IGNORE_A && rxId != CAN_ID_RADIO_STATUS && rxId != NM_ARDUINO_ID
        && (isDiagFrame(rxId) || isDelta(rxId, len, rxBuf))) {
      Serial.print(F("0x")); Serial.print(rxId, HEX); Serial.print(F(":"));
      for (int i = 0; i < len; i++) {
        if (rxBuf[i] < 0x10) Serial.print(F("0"));
        Serial.print(rxBuf[i], HEX); if (i < len - 1) Serial.print(F(" "));
      }
      Serial.println();
    }
    CAN0.mcp2515_modifyRegister(0x2D, 0xFF, 0x00);
  }

  // Brak ruchu jest dopuszczalny tylko przy pełnym śnie magistrali.
  // Pełny sen: stan NET_SLEEP + AUTO_SILENT_LISTEN + SleepInd + brak aktywnego wake.
  bool fullSleepConfirmed = (netState == NET_SLEEP)
                            && (autoNmState == AUTO_SILENT_LISTEN)
                            && isSleepIndicated
                            && !isBusActive;
  bool hangSuppressed = fullSleepConfirmed;

  if (!hangSuppressed && !isHanging && !isSleepIndicated && lastGwSelfNmMs != 0
      && (millis() - lastGwSelfNmMs > INTERVAL_HANG_CHECK)) {
    Serial.println(F("ERR:CAN:HANG"));
    isHanging = true;
  }

  // 0x661 tylko w NET_ACTIVE — po WAKE_END (Grace / SleepReady / Sleep) nie podtrzymujemy „radia”.
  if (netState == NET_ACTIVE && (millis() - lastSendTime >= INTERVAL_RADIO_PUMP)) {
    lastSendTime = millis();
    unsigned char stRadio[8] = {0x01, 0x01, 0x10, 0, 0, 0, 0, 0};
    CAN0.sendMsgBuf(CAN_ID_RADIO_STATUS, 0, 8, stRadio);
  }

  static unsigned long lastErrCheck = 0;
  if (millis() - lastErrCheck > 1000) {
    lastErrCheck = millis();
    checkHardwareErrors();
  }
}
