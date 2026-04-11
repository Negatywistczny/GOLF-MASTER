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
bool sleepAckSeen = false;
bool busSleepConfirmed = true;
bool sleepLockActive = false;
bool pumpStateLoggedActive = false;
unsigned long pumpTxCount = 0;

enum AutoNmState : uint8_t {
  AUTO_ACTIVE = 0,
  AUTO_SLEEP_PREP,
  AUTO_SILENT_LISTEN
};

AutoNmState autoNmState = AUTO_SILENT_LISTEN;

void setAutoNmState(AutoNmState next);

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

void handleGatewayNm(uint32_t id, uint8_t *buf, uint8_t len) {
  if (id != (uint32_t)NM_GATEWAY_ID || len < 2) return;

  uint8_t b1 = buf[1];
  // Ring / Alive / LimpHome — dowolna z tych flag w bajcie 1 (id_ramek, bity 8–10).
  bool gwNmCmd = (b1 & (NM_CMD_RING | NM_CMD_ALIVE | NM_MASK_CMD_LIMP)) != 0;
  bool tokenToSelf = (buf[0] == NM_NODE_SELF && gwNmCmd);

  // Tryb snu / watchdog HANG — wyłącznie z Gateway NM do 0x0B (nie z innych ID).
  if (buf[0] == NM_NODE_SELF) {
    lastGwSelfNmMs = millis();
    isHanging = false;

    static bool prevGwSleepBit = false;
    bool sleepNow = (b1 & NM_MASK_SLEEP) != 0;
    sleepAckSeen = (b1 & NM_MASK_SLEEP_ACK) != 0;
    if (sleepNow && !prevGwSleepBit) {
      Serial.println(F("SYS:CAN:SLEEP_IND"));
      sleepLockActive = true;
      setAutoNmState(AUTO_SILENT_LISTEN);
      busSleepConfirmed = true;
    }
    prevGwSleepBit = sleepNow;
    if (sleepNow) {
      isSleepIndicated = true;
    } else if ((b1 & NM_CMD_ALIVE) != 0) {
      // Po wejściu w sleep lock ignorujemy tylko Alive bez przyczyn wake (wakeCombo==0),
      // ale NIE blokujemy ścieżki WAKE_START.
      bool ignoreIdleAlive = false;
      if (sleepLockActive && !isBusActive && len >= 5) {
        uint32_t wakeComboPeek = (uint32_t)buf[2] | ((uint32_t)buf[3] << 8) | ((uint32_t)buf[4] << 16);
        ignoreIdleAlive = (wakeComboPeek == 0);
      }
      if (ignoreIdleAlive) {
        // pozostajemy w sleep lock bez restartu PREP
      } else {
        isSleepIndicated = false;
        busSleepConfirmed = false;
        if (isBusActive) {
          setAutoNmState(AUTO_ACTIVE);
        } else {
          setAutoNmState(AUTO_SLEEP_PREP);
        }
      }
    }
  }

  if (buf[0] == NM_NODE_SELF && (b1 & NM_CMD_ALIVE) != 0 && len >= 5) {
    lastWakeCauseByte = buf[2];

    uint32_t wakeCombo = (uint32_t)buf[2] | ((uint32_t)buf[3] << 8) | ((uint32_t)buf[4] << 16);
    static uint32_t prevWakeCombo = 0;
    if (prevWakeCombo == 0 && wakeCombo != 0) {
      Serial.println(F("SYS:CAN:WAKE_START"));
      sleepLockActive = false;
      isBusActive = true;
      busSleepConfirmed = false;
      sleepAckSeen = false;
      isSleepIndicated = false;
      setAutoNmState(AUTO_ACTIVE);
    } else if (prevWakeCombo != 0 && wakeCombo == 0) {
      Serial.println(F("SYS:CAN:WAKE_END"));
      isBusActive = false;
      // Po WAKE_END utrzymujemy odpowiedzi NM, ale deklarujemy gotowość snu.
      setAutoNmState(AUTO_SLEEP_PREP);
    }
    prevWakeCombo = wakeCombo;
  }

  bool shouldReplyNm = tokenToSelf && !busSleepConfirmed && !sleepLockActive;

  if (shouldReplyNm) {
    uint8_t txB1 = 0;
    if (b1 & NM_MASK_CMD_LIMP) {
      txB1 |= NM_CMD_ALIVE;
    } else if (b1 & NM_CMD_RING) {
      txB1 |= NM_CMD_RING;
    } else {
      txB1 |= NM_CMD_ALIVE;
    }

    bool announceSleepReady = (autoNmState == AUTO_SLEEP_PREP) || (b1 & NM_MASK_SLEEP);
    if (announceSleepReady) {
      txB1 |= NM_MASK_SLEEP;
    }
    if ((b1 & NM_MASK_SLEEP_ACK) && (b1 & NM_MASK_SLEEP)) {
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

  if (!isHanging && !busSleepConfirmed && !isSleepIndicated && lastGwSelfNmMs != 0
      && (millis() - lastGwSelfNmMs > INTERVAL_HANG_CHECK)) {
    Serial.println(F("ERR:CAN:HANG"));
    isHanging = true;
  }

  // Diagnostyka Test C: jawny marker wejścia/wyjścia pompy 0x661.
  if (autoNmState == AUTO_ACTIVE && !pumpStateLoggedActive) {
    pumpStateLoggedActive = true;
    pumpTxCount = 0;
    Serial.println(F("SYS:CAN:PUMP_ON"));
  } else if (autoNmState != AUTO_ACTIVE && pumpStateLoggedActive) {
    pumpStateLoggedActive = false;
    Serial.print(F("SYS:CAN:PUMP_OFF TX_COUNT="));
    Serial.println(pumpTxCount);
  }

  // 0x661 tylko w fazie aktywnej — po WAKE_END nie podtrzymujemy „radia”.
  if (autoNmState == AUTO_ACTIVE && (millis() - lastSendTime >= INTERVAL_RADIO_PUMP)) {
    lastSendTime = millis();
    unsigned char stRadio[8] = {0x01, 0x01, 0x10, 0, 0, 0, 0, 0};
    CAN0.sendMsgBuf(CAN_ID_RADIO_STATUS, 0, 8, stRadio);
    pumpTxCount++;
    if ((pumpTxCount % 20) == 0) {
      Serial.print(F("SYS:CAN:PUMP_TX_661 count="));
      Serial.println(pumpTxCount);
    }
  }

  static unsigned long lastErrCheck = 0;
  if (millis() - lastErrCheck > 1000) {
    lastErrCheck = millis();
    checkHardwareErrors();
  }
}
