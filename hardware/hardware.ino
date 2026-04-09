#include <SPI.h>
#include <mcp_can.h>

// --- KONFIGURACJA SPRZĘTOWA ---
const int SPI_CS_PIN = 10;
const int CAN_INT_PIN = 2;
const int TJA_STB = 5;
const int TJA_EN  = 6;
const int TJA_ERR = 4;

// --- DEFINICJE VAG PQ35 (LOGIKA NIETYKALNA) ---
const long NM_GATEWAY_ID = 0x42B;
const long NM_ARDUINO_ID = 0x40B; 
const int NEXT_NODE_ID = 0x2B;

MCP_CAN CAN0(SPI_CS_PIN);

// --- ZMIENNE STANU I TIMERY ---
unsigned long lastRxTime = 0;
unsigned long lastSendTime = 0; 
byte lastBajt3 = 0x00;
bool isHanging = false;
bool isSleepIndicated = false;

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

// --- DIAGNOSTYKA BŁĘDÓW HW ---
void checkHardwareErrors() {
  // 1. Błędy układu MCP2515 (kontroler)
  byte err = CAN0.checkError(); 
  if (err != 0) {
    Serial.print(F("ERR:HW:MCP:0x")); 
    if (err < 0x10) Serial.print(F("0"));
    Serial.println(err, HEX);
    if (err & 0x1D) {
      CAN0.mcp2515_modifyRegister(0x30, 0x08, 0x00);
      CAN0.mcp2515_modifyRegister(0x40, 0x08, 0x00);
      CAN0.mcp2515_modifyRegister(0x50, 0x08, 0x00);
      CAN0.mcp2515_modifyRegister(0x2D, 0xFF, 0x00); 
    }
    if (err & 0x20) CAN0.setMode(MCP_NORMAL);
  }

  // 2. Błędy układu TJA1055T (transiwer / zwarcie kabli)
  if (digitalRead(TJA_ERR) == LOW) Serial.println(F("ERR:HW:TJA"));
}

// --- ODBIERANIE Z SERIALA (TX na CAN) ---
void processSerial() {
  if (Serial.available() > 0) {
    String data = Serial.readStringUntil('\n');
    data.trim();
    if (data.startsWith("TX:")) {
      int idx1 = data.indexOf(':', 3);
      int idx2 = data.indexOf(':', idx1 + 1);
      if (idx1 > 0 && idx2 > 0) {
        long txId = strtol(data.substring(3, idx1).c_str(), NULL, 16);
        int txLen = data.substring(idx1 + 1, idx2).toInt();
        String payloadStr = data.substring(idx2 + 1);
        byte txBuf[8] = {0};
        int charIndex = 0;
        for (int i = 0; i < txLen; i++) {
          txBuf[i] = (byte)strtol(payloadStr.substring(charIndex, charIndex + 2).c_str(), NULL, 16);
          charIndex += 3;
        }
        CAN0.sendMsgBuf(txId, 0, txLen, txBuf);
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
    CAN0.mcp2515_modifyRegister(0x0F, 0x08, 0x08); // One-Shot
    CAN0.setMode(MCP_NORMAL); 
    Serial.println(F("SYS:HW:READY")); 
    lastRxTime = millis();
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
  CAN0.mcp2515_modifyRegister(0x2D, 0xFF, 0x00);

  // --- ODBIÓR DANYCH ---
  if (!digitalRead(CAN_INT_PIN)) {
    if (CAN0.readMsgBuf(&rxId, &len, rxBuf) == CAN_OK) {
      lastRxTime = millis();
      isHanging = false; // Każda ramka resetuje błąd zawieszenia

      // 1. LOGIKA NM I USYPIANIA
      if (rxId == NM_GATEWAY_ID) {
        lastBajt3 = rxBuf[3]; 

        if (rxBuf[0] == 0x0B) {
            
            // Rejestrujemy, czy Gateway oficjalnie uśpił sieć
            if (rxBuf[1] & 0x10) {
                if (!isSleepIndicated) {
                    isSleepIndicated = true;
                    Serial.println(F("SYS:CAN:SLEEP_IND"));
                }
            } else {
                isSleepIndicated = false; // Powrót do aktywności
            }

            if ((rxBuf[3] & 0xFB) != 0) { // Zapłon lub Komfort
                unsigned char txBuf[6] = {NEXT_NODE_ID, 0x02, 0, 0, 0, 0};
                if (rxBuf[1] & 0x04) txBuf[1] = 0x01; 
                CAN0.sendMsgBuf(NM_ARDUINO_ID, 0, 6, txBuf);
            }
        }
      }

      // 2. SNIFFER Z FILTRAMI
      if (rxId != 0x531 && rxId != 0x661 && rxId != NM_ARDUINO_ID) {
        if (isDiagFrame(rxId) || isDelta(rxId, len, rxBuf)) {
          Serial.print(F("0x")); Serial.print(rxId, HEX); Serial.print(F(":"));
          for (int i = 0; i < len; i++) {
            if (rxBuf[i] < 0x10) Serial.print(F("0"));
            Serial.print(rxBuf[i], HEX); if (i < len - 1) Serial.print(F(" "));
          }
          Serial.println();
        }
      }
    }
  }

  // --- 3. WATCHDOG ZAWIESZENIA ---
  // Jeśli od >2s jest cisza, A Gateway NIE wysłał flagi uśpienia -> błąd!
  if (!isHanging && !isSleepIndicated && (millis() - lastRxTime > 2000)) {
    Serial.println(F("ERR:CAN:HANG"));
    isHanging = true;
  }

  // --- 4. PODTRZYMANIE HARDWARE ---
  if (((lastBajt3 & 0xFB) != 0) && (millis() - lastSendTime >= 150)) {
    lastSendTime = millis();
    unsigned char stRadio[8] = {0x01, 0x01, 0x10, 0, 0, 0, 0, 0};
    CAN0.sendMsgBuf(0x661, 0, 8, stRadio);
  }

  // Okresowa diagnostyka HW
  static unsigned long lastErrCheck = 0;
  if (millis() - lastErrCheck > 1000) {
    lastErrCheck = millis();
    checkHardwareErrors();
  }
}