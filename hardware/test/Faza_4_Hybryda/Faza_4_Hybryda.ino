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
// Dolny nibble bajtu 1 = typ OSEK (Ring 0x01 / Alive 0x02); Ring NIE niesie tej samej semantyki bajtu 2 co Alive.
const uint8_t NM_CMD_RING = 0x01;
const uint8_t NM_CMD_ALIVE = 0x02;

MCP_CAN CAN0(SPI_CS_PIN);

unsigned long rxCount = 0;
unsigned long lastReportTime = 0;
unsigned long lastSendTime = 0;
unsigned long lastMessageTime = 0;

byte lastBajt1 = 0xFF;
byte lastBajt2Log = 0xFF; // ostatnia wartość Bajtu 2 *tej ramki* — tylko do logu / isDelta wizualnego
// Tylko z Alive do 0x0B — Ring ma zwykle bajt2=0; NIE wolno nim nadpisywać okna (błąd „CICHY OBSERWATOR” co pół cyklu).
byte lastAliveB2 = 0x00;
bool currentlyActive = false; 

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
        uint8_t cmdLo = rxBuf[1] & 0x0F;

        if (rxBuf[0] == 0x0B && cmdLo == NM_CMD_ALIVE) {
          lastAliveB2 = rxBuf[2];
        }

        bool stateChanged = false;
        if (rxBuf[1] != lastBajt1 || rxBuf[2] != lastBajt2Log) {
            stateChanged = true;
            lastBajt1 = rxBuf[1];
            lastBajt2Log = rxBuf[2];
        }

        // Okno Infotainment: wyłącznie z ostatniego Alive (nie z Ring).
        bool windowFromAlive = (lastAliveB2 & 0x80) != 0;

        if (stateChanged) {
            Serial.print(F("\n[")); Serial.print(millis()); Serial.print(F(" ms] GATEWAY 0x42B: "));
            for (int i=0; i<len; i++) {
                if(rxBuf[i] < 0x10) Serial.print("0");
                Serial.print(rxBuf[i], HEX); Serial.print(" ");
            }

            Serial.print(F(" | Flaga: 0x")); Serial.print(rxBuf[1], HEX);
            if (rxBuf[1] & 0x10) Serial.print(F(" [SLEEP_IND]"));
            if (rxBuf[1] & 0x04) Serial.print(F(" [LIMP_HOME]"));
            if (cmdLo == NM_CMD_RING) Serial.print(F(" [RING]"));
            else if (cmdLo == NM_CMD_ALIVE) Serial.print(F(" [ALIVE]"));
            else Serial.print(F(" [INNY_CMD]"));

            Serial.print(F(" | Ta ramka bajt2: 0x")); Serial.print(rxBuf[2], HEX);
            if (cmdLo == NM_CMD_RING) {
              Serial.print(F(" (Ring — ignoruj dla okna)"));
            }
            Serial.print(F(" | Okno z ostatniego Alive bajt2: 0x")); Serial.print(lastAliveB2, HEX);
            if (windowFromAlive) Serial.print(F(" [0x80=OKNO OTWARTE]"));
            else Serial.print(F(" [BRAK OKNA]"));
            Serial.println();

            if (windowFromAlive != currentlyActive) {
                currentlyActive = windowFromAlive;
                Serial.println(F("=================================================="));
                if (currentlyActive) {
                    Serial.println(F(">>> AUTO ŻYJE -> TRYB: SZTUCZNE PODTRZYMANIE (0x40B + 0x661) <<<"));
                } else {
                    Serial.println(F(">>> ZANIK OKNA (0x80 w Alive) -> TRYB: CICHY OBSERWATOR <<<"));
                }
                Serial.println(F("==================================================\n"));
            }
        }

        // 0x40B: gdy ostatnie Alive trzymało 0x80 — odpowiadaj na Ring i Alive (Ring ma bajt2=0, to normalne).
        if (rxBuf[0] == 0x0B && (lastAliveB2 & 0x80) && (cmdLo == NM_CMD_ALIVE || cmdLo == NM_CMD_RING)) {
            unsigned char txBuf[6] = {NEXT_NODE_ID, NM_CMD_ALIVE, 0, 0, 0, 0};
            if (rxBuf[1] & 0x04) txBuf[1] = NM_CMD_RING;
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
  if ((lastAliveB2 & 0x80) && (millis() - lastSendTime >= 150)) {
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