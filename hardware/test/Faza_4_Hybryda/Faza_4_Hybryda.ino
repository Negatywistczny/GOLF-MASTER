#include <SPI.h>
#include <mcp_can.h>

const int SPI_CS_PIN = 10;
const int CAN_INT_PIN = 2;
const int TJA_ERR = 4;
const int TJA_STB = 5;
const int TJA_EN  = 6;

const long NM_GATEWAY_ID = 0x42B;
const long NM_ARDUINO_ID = 0x40B; 
const int NEXT_NODE_ID = 0x2B;

MCP_CAN CAN0(SPI_CS_PIN);

unsigned long rxCount = 0;
unsigned long lastReportTime = 0;
unsigned long lastSendTime = 0;
unsigned long lastMessageTime = 0;

byte lastBajt1 = 0xFF;
byte lastBajt2Log = 0xFF; // ostatnia wartość Bajtu 2 do wykrywania zmian w logu
byte lastBajt2 = 0x00;    // jak w hardware.ino — ostatni Bajt 2 z Gateway (okno aktywności / pompka)
bool currentlyActive = true; 

// --- LOGIKA DELTA ---
#define MAX_TRACKED_IDS 100 
struct CANFrame { uint32_t id; uint8_t len; uint8_t data[8]; };
CANFrame trackedFrames[MAX_TRACKED_IDS];
uint8_t trackedCount = 0;

bool isDiagFrame(uint32_t id) {
  if (id >= 0x200 && id <= 0x27F) return true;
  if (id == 0x300) return true;               
  if (id >= 0x700 && id <= 0x7FF) return true; 
  return false;
}

bool isDelta(uint32_t id, uint8_t len, uint8_t *data) {
  for (uint8_t i = 0; i < trackedCount; i++) {
    if (trackedFrames[i].id == id) {
      bool changed = false;
      for (uint8_t j = 0; j < len; j++) {
        if (trackedFrames[i].data[j] != data[j]) {
          changed = true;
          break;
        }
      }
      if (changed) {
        memcpy(trackedFrames[i].data, data, len); 
        return true;
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

void checkHardwareErrors() {
  byte err = CAN0.checkError(); 
  if (err != 0) {
    Serial.print(F("ERR:HW:0x")); 
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
}

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
  
  pinMode(CAN_INT_PIN, INPUT);
  pinMode(TJA_ERR, INPUT_PULLUP);
  pinMode(TJA_STB, OUTPUT);
  pinMode(TJA_EN, OUTPUT);
  
  digitalWrite(TJA_STB, HIGH);
  digitalWrite(TJA_EN, HIGH);
  delay(100); 

  Serial.println(F("=================================================="));
  Serial.println(F(" FAZA 4 + MONITOROWANIE DECYZJI GATEWAYA (0x42B)  "));
  Serial.println(F("=================================================="));

  if (CAN0.begin(MCP_ANY, CAN_100KBPS, MCP_8MHZ) == CAN_OK) {
    CAN0.mcp2515_modifyRegister(0x0F, 0x08, 0x08); 
    CAN0.setMode(MCP_NORMAL); 
  } else {
    Serial.println(F("ERR:HW:INIT_FAIL"));
    while (1);
  }
}

void loop() {
  long unsigned int rxId;
  unsigned char len = 0;
  unsigned char rxBuf[8];

  CAN0.mcp2515_modifyRegister(0x2D, 0xFF, 0x00);
  processSerial();

  if (!digitalRead(CAN_INT_PIN)) {
    while (CAN0.checkReceive() == CAN_MSGAVAIL) {
      CAN0.readMsgBuf(&rxId, &len, rxBuf);
      rxCount++;
      lastMessageTime = millis();

      // ========================================================
      // SZCZEGÓŁOWY FILTR GATEWAYA (0x42B)
      // ========================================================
      if (rxId == NM_GATEWAY_ID && len >= 4) {
        lastBajt2 = rxBuf[2];

        bool stateChanged = false;
        // Reagujemy na każdą zmianę w Bajcie 1 (flagi NM) lub Bajcie 2 (m.in. bit 0x80 = okno aktywności)
        if (rxBuf[1] != lastBajt1 || rxBuf[2] != lastBajt2Log) {
            stateChanged = true;
            lastBajt1 = rxBuf[1];
            lastBajt2Log = rxBuf[2];
        }

        bool isBusActive = (rxBuf[2] & 0x80) != 0;

        // RAPORTOWANIE ZMIAN Z GATEWAYA
        if (stateChanged) {
            Serial.print(F("\n[")); Serial.print(millis()); Serial.print(F(" ms] GATEWAY 0x42B: "));
            for (int i=0; i<len; i++) {
                if(rxBuf[i] < 0x10) Serial.print("0");
                Serial.print(rxBuf[i], HEX); Serial.print(" ");
            }
            
            // Dekodowanie Bajtu 1 (OSEK FLAGI)
            Serial.print(F(" | Flaga: 0x")); Serial.print(rxBuf[1], HEX);
            if (rxBuf[1] & 0x10) Serial.print(F(" [*** SLEEP_IND (ZASYPIAMY) ***]"));
            else if (rxBuf[1] & 0x04) Serial.print(F(" [LIMP_HOME (BŁĄD)]"));
            else if (rxBuf[1] & 0x01) Serial.print(F(" [RING]"));
            else if (rxBuf[1] & 0x02) Serial.print(F(" [ALIVE]"));
            
            // Dekodowanie Bajtu 2 (bit 0x80 = oficjalne okno aktywności Gateway / ALIVE)
            Serial.print(F(" | Bajt2: 0x")); Serial.print(rxBuf[2], HEX);
            if (rxBuf[2] & 0x80) Serial.print(F(" [BIT 0x80 AKTYWNY -> MAGISTRALA W OKNIE]"));
            else Serial.print(F(" [BEZ 0x80 -> BRAK OKNA AKTYWNOŚCI]"));
            Serial.println();

            // ZMIANA TRYBU FAZY 4
            if (isBusActive != currentlyActive) {
                currentlyActive = isBusActive;
                Serial.println(F("=================================================="));
                if (currentlyActive) {
                    Serial.println(F(">>> AUTO ŻYJE -> TRYB: SZTUCZNE PODTRZYMANIE (0x40B + 0x661) <<<"));
                } else {
                    Serial.println(F(">>> ZANIK POWODÓW -> TRYB: CICHY OBSERWATOR (Znikamy) <<<"));
                }
                Serial.println(F("==================================================\n"));
            }
        }

        // LOGIKA WYSYŁANIA OSEK 0x40B — tylko gdy Gateway utrzymuje bit 0x80 w Bajcie 2
        if (rxBuf[0] == 0x0B && (rxBuf[2] & 0x80)) {
            unsigned char txBuf[6] = {NEXT_NODE_ID, 0x02, 0, 0, 0, 0};
            if (rxBuf[1] & 0x04) txBuf[1] = 0x01; // Limp Home -> Alive
            CAN0.sendMsgBuf(NM_ARDUINO_ID, 0, 6, txBuf);
        }
      }

      // ========================================================
      // SNIFFER DELTA (RESZTA MAGISTRALI)
      // ========================================================
      if (rxId != 0x531 && rxId != 0x661 && rxId != NM_ARDUINO_ID && rxId != NM_GATEWAY_ID) {
        if (isDiagFrame(rxId) || isDelta(rxId, len, rxBuf)) {
          Serial.print(F("[")); Serial.print(millis()); Serial.print(F(" ms] 0x")); 
          Serial.print(rxId, HEX); Serial.print(F(": "));
          for (int i = 0; i < len; i++) {
            if (rxBuf[i] < 0x10) Serial.print(F("0"));
            Serial.print(rxBuf[i], HEX); if (i < len - 1) Serial.print(F(" "));
          }
          Serial.println();
        }
      }
    }
  }

  // ========================================================
  // WYSYŁANIE STATUSU RADIA (0x661) (TYLKO W TRYBIE AKTYWNYM)
  // ========================================================
  if ((lastBajt2 & 0x80) && (millis() - lastSendTime >= 150)) {
    lastSendTime = millis();
    unsigned char stRadio[8] = {0x01, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00};
    CAN0.sendMsgBuf(0x661, 0, 8, stRadio);
  }

  // --- DASHBOARD ---
  if (millis() - lastReportTime >= 2000) {
    lastReportTime = millis();
    checkHardwareErrors();
    unsigned long timeSinceLastMsg = millis() - lastMessageTime;
    
    Serial.print(F("Tętno: ")); Serial.print(rxCount); 
    Serial.print(F(" | Aktualny Tryb: ")); Serial.print(currentlyActive ? F("SZTUCZNE PODTRZYMANIE") : F("CICHY OBSERWATOR"));
    Serial.print(F(" | Cisza od: ")); Serial.print(timeSinceLastMsg); Serial.println(F(" ms"));
    rxCount = 0;
  }
}