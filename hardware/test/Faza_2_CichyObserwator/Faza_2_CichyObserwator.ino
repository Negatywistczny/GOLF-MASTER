#include <SPI.h>
#include <mcp_can.h>

const int SPI_CS_PIN = 10;
const int CAN_INT_PIN = 2;
const int TJA_ERR = 4;
const int TJA_STB = 5;
const int TJA_EN  = 6;

MCP_CAN CAN0(SPI_CS_PIN);

unsigned long rxCount = 0;
unsigned long lastReportTime = 0;
unsigned long lastMessageTime = 0;

// --- ZAAWANSOWANA LOGIKA DELTA (Śledzimy 100 ramek) ---
#define MAX_TRACKED_IDS 100 
struct CANFrame { 
  uint32_t id; 
  uint8_t len; 
  uint8_t data[8]; 
};
CANFrame trackedFrames[MAX_TRACKED_IDS];
uint8_t trackedCount = 0;

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
        memcpy(trackedFrames[i].data, data, len); // Aktualizuj stan
        return true;
      }
      return false; // Nic się nie zmieniło
    }
  }
  // Nowe ID, dodajemy do bazy
  if (trackedCount < MAX_TRACKED_IDS) {
    trackedFrames[trackedCount].id = id;
    trackedFrames[trackedCount].len = len;
    memcpy(trackedFrames[trackedCount].data, data, len);
    trackedCount++;
  }
  return true; // Nowa ramka to też zmiana
}

void setup() {
  Serial.begin(115200);
  
  pinMode(CAN_INT_PIN, INPUT);
  pinMode(TJA_ERR, INPUT_PULLUP);
  pinMode(TJA_STB, OUTPUT);
  pinMode(TJA_EN, OUTPUT);
  
  // Włączamy TJA, żeby móc fizycznie słuchać kabli
  digitalWrite(TJA_STB, HIGH);
  digitalWrite(TJA_EN, HIGH);
  delay(100); 

  Serial.println(F("=================================================="));
  Serial.println(F("   CICHY OBSERWATOR - POSZUKIWANIE MAGICZNEJ RAMKI  "));
  Serial.println(F("=================================================="));

  if (CAN0.begin(MCP_ANY, CAN_100KBPS, MCP_8MHZ) == CAN_OK) {
    // Tryb NORMAL, ale bez użycia komendy wysyłania
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

  if (!digitalRead(CAN_INT_PIN)) {
    while (CAN0.checkReceive() == CAN_MSGAVAIL) {
      CAN0.readMsgBuf(&rxId, &len, rxBuf);
      rxCount++;
      lastMessageTime = millis();

      // Przepuszczamy przez filtr Delta
      if (isDelta(rxId, len, rxBuf)) {
        Serial.print(F("[")); 
        Serial.print(millis()); 
        Serial.print(F(" ms] 0x")); 
        Serial.print(rxId, HEX); 
        Serial.print(F(": "));
        
        for (int i = 0; i < len; i++) {
          if (rxBuf[i] < 0x10) Serial.print(F("0"));
          Serial.print(rxBuf[i], HEX); 
          if (i < len - 1) Serial.print(F(" "));
        }
        
        // Dodajmy małą pomoc wizualną dla znanych ramek z Twoich plików
        if (rxId == 0x42B) Serial.print(F("  <-- [Gateway OSEK]"));
        if (rxId == 0x2C1 || rxId == 0x2C3) Serial.print(F("  <-- [Kolumna/Kluczyk]"));
        if (rxId == 0x571 || rxId == 0x575) Serial.print(F("  <-- [Zasilanie/Aku]"));
        if (rxId == 0x351 || rxId == 0x359 || rxId == 0x35B) Serial.print(F("  <-- [Gateway Info]"));
        
        Serial.println();
      }
    }
  }

  // --- Raport o tętnie i błędach ---
  if (millis() - lastReportTime >= 2000) {
    lastReportTime = millis();
    
    // Sprawdzanie błędów HW na wypadek, gdyby Gateway odciął prąd
    byte err = CAN0.checkError(); 
    if (err != 0) {
      Serial.print(F("ERR:HW:0x")); 
      if (err < 0x10) Serial.print(F("0"));
      Serial.println(err, HEX);
      // Reset buforów, by odzyskać podgląd jeśli to możliwe
      if (err & 0x1D) {
        CAN0.mcp2515_modifyRegister(0x30, 0x08, 0x00);
        CAN0.mcp2515_modifyRegister(0x40, 0x08, 0x00);
        CAN0.mcp2515_modifyRegister(0x50, 0x08, 0x00);
        CAN0.mcp2515_modifyRegister(0x2D, 0xFF, 0x00); 
      }
      if (err & 0x20) CAN0.setMode(MCP_NORMAL);
    }

    unsigned long timeSinceLastMsg = millis() - lastMessageTime;
    Serial.print(F("=== TĘTNO: ")); Serial.print(rxCount); 
    Serial.print(F(" | OSTATNIA RAMKA: ")); Serial.print(timeSinceLastMsg); Serial.println(F(" ms temu ==="));
    rxCount = 0;
  }
}