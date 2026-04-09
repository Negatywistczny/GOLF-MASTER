#include <SPI.h>
#include <mcp_can.h>

// --- KONFIGURACJA PINÓW ---
const int SPI_CS_PIN = 10;
const int CAN_INT_PIN = 2;
const int TJA_ERR = 4;
const int TJA_STB = 5;
const int TJA_EN  = 6;

// --- DEFINICJE Z DOKUMENTACJI PQ35 ---
const long NM_GATEWAY_ID = 0x42B;
const long NM_ARDUINO_ID = 0x40B;  // Własny ID Arduino (Node 0x0B)
const int NEXT_NODE_ID = 0x2B;     // Przekazanie tokenu z powrotem do Gatewaya

MCP_CAN CAN0(SPI_CS_PIN);

// --- ZMIENNE DIAGNOSTYCZNE ---
unsigned long rxCount = 0;           
unsigned long lastReportTime = 0;
unsigned long lastMessageTime = 0;

byte last42B[8] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF}; 
bool first42B = true;

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
  Serial.println(F(" FAZA 1: ŚCISŁA ZGODNOŚĆ Z DOKUMENTACJĄ (0x40B)   "));
  Serial.println(F("=================================================="));

  if (CAN0.begin(MCP_ANY, CAN_100KBPS, MCP_8MHZ) == CAN_OK) {
    CAN0.mcp2515_setRegister(0x2A, 0x03); 
    CAN0.mcp2515_setRegister(0x29, 0xE8); 
    CAN0.mcp2515_setRegister(0x28, 0x01); 
    CAN0.mcp2515_modifyRegister(0x0F, 0x08, 0x08); // One-Shot
    CAN0.setMode(MCP_NORMAL); 
    Serial.println(F("SYS: GOTOWY. Opieram się na algorytmie z dokumentacji..."));
    Serial.println(F("--------------------------------------------------"));
  } else {
    Serial.println(F("ERR: Błąd inicjalizacji MCP2515!"));
    while (1);
  }
}

void loop() {
  long unsigned int rxId;
  unsigned char len = 0;
  unsigned char rxBuf[8];

  CAN0.mcp2515_modifyRegister(0x2D, 0xFF, 0x00);

  if (!digitalRead(CAN_INT_PIN)) {
    while (CAN0.checkReceive() == CAN_MSGAVAIL) {
      CAN0.readMsgBuf(&rxId, &len, rxBuf);
      rxCount++;
      lastMessageTime = millis();

      // ========================================================
      // OBSŁUGA NM DOKŁADNIE WEDŁUG DOKUMENTACJI "Arduino CAN VW"
      // ========================================================
      if (rxId == NM_GATEWAY_ID) {
        
        // Sprawdź czy token jest kierowany do nas (Bajt 0 == 0x0B)
        if (rxBuf[0] == 0x0B) {
            unsigned char txBuf[6] = {0}; // DLC to ściśle 6 bajtów
            txBuf[0] = NEXT_NODE_ID;      // Przekaż do Gateway
            
            // Analiza kodu operacji (Bajt 1)
            if (rxBuf[1] & 0x04) {        // Wykryto Limp Home
                txBuf[1] = 0x01;          // Odpowiedz Alive
            } else {
                txBuf[1] = 0x02;          // Standardowy Ring Message
            }
            
            // Wysyłanie odpowiedzi NM
            CAN0.sendMsgBuf(NM_ARDUINO_ID, 0, 6, txBuf);
        }

        // --- REAL-TIME LOGOWANIE (Sniffer) ---
        bool frameChanged = false;
        for (int i = 0; i < len; i++) {
          if (rxBuf[i] != last42B[i]) {
            frameChanged = true;
            last42B[i] = rxBuf[i]; 
          }
        }

        if (frameChanged || first42B) {
          first42B = false;
          
          bool gwRing     = (rxBuf[1] & 0x01); 
          bool gwAlive    = (rxBuf[1] & 0x02); 
          bool gwLimpHome = (rxBuf[1] & 0x04);
          bool gwSleepInd = (rxBuf[1] & 0x10); 
          bool gwZaplonKl15 = (rxBuf[3] & 0x40);

          Serial.print(F("[")); Serial.print(millis()); Serial.print(F(" ms] 0x42B: "));
          for (int i = 0; i < len; i++) {
            if (rxBuf[i] < 0x10) Serial.print(F("0"));
            Serial.print(rxBuf[i], HEX); Serial.print(F(" "));
          }
          Serial.print(F(" | FLAGI: "));
          if (gwSleepInd) Serial.print(F("[SLEEP_IND] "));
          if (gwLimpHome) Serial.print(F("[LIMP_HOME!] "));
          if (gwZaplonKl15) Serial.print(F("[ZAPŁON] "));
          if (gwRing) Serial.print(F("[RING] "));
          if (gwAlive) Serial.print(F("[ALIVE] "));
          Serial.println();
        }
      }
    }
  }

  // --- CICHY DASHBOARD ---
  if (millis() - lastReportTime >= 1000) {
    lastReportTime = millis();
    unsigned long timeSinceLastMsg = millis() - lastMessageTime;
    
    Serial.print(F("  -> Tętno: ")); Serial.print(rxCount); 
    Serial.print(F(" | Cisza: ")); Serial.print(timeSinceLastMsg); Serial.println(F(" ms"));
    rxCount = 0;
  }
}