#include <SPI.h>
#include <mcp_can.h>

const int SPI_CS_PIN = 10;
const int CAN_INT_PIN = 2;
const int TJA_ERR = 4;
const int TJA_STB = 5;
const int TJA_EN  = 6;

MCP_CAN CAN0(SPI_CS_PIN);

// --- LOGIKA DELTA ---
#define MAX_TRACKED_IDS 50 
struct CANFrame { uint32_t id; uint8_t len; uint8_t data[8]; };
CANFrame trackedFrames[MAX_TRACKED_IDS];
uint8_t trackedCount = 0;

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

bool carIsAwake = false;

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(10);
  pinMode(CAN_INT_PIN, INPUT);
  pinMode(TJA_ERR, INPUT_PULLUP);
  pinMode(TJA_STB, OUTPUT);
  pinMode(TJA_EN, OUTPUT);
  
  digitalWrite(TJA_STB, HIGH);
  digitalWrite(TJA_EN, HIGH);
  delay(100); 

  // Standardowy, poprawny start bez ingerencji w timingi CAN
  if (CAN0.begin(MCP_ANY, CAN_100KBPS, MCP_8MHZ) == CAN_OK) {
    CAN0.setMode(MCP_NORMAL);
    Serial.println(F("SYS:HW:READY")); 
  } else {
    Serial.println(F("ERR:HW:INIT_FAIL"));
    while (1);
  }
}

// --- STANDARDOWA OBSŁUGA BŁĘDÓW ---
void checkHardwareErrors() {
  byte err = CAN0.checkError(); 
  if (err != 0) {
    Serial.print(F("ERR:HW:0x")); 
    if (err < 0x10) Serial.print(F("0"));
    Serial.println(err, HEX);
    
    // Tylko przywracamy tryb przy całkowitym wyrzuceniu z magistrali
    if (err & 0x20) {
      CAN0.setMode(MCP_NORMAL);
    }
  }
  // Czyścimy flagi błędów układu (nie ingerujemy w bufory nadawcze!)
  CAN0.mcp2515_modifyRegister(0x2D, 0xFF, 0x00);
}

// --- ODBIERANIE KOMEND Z PORTU SZEREGOWEGO (TX Z LAPTOPA) ---
void processSerial() {
  if (Serial.available() > 0) {
    String data = Serial.readStringUntil('\n');
    data.trim();
    
    // Sprawdzamy czy przyszła komenda do wysłania (format TX:ID:LEN:DATA)
    // Przykład: TX:200:7:15 C0 00 10 00 03 01
    if (data.startsWith("TX:")) {
      int idx1 = data.indexOf(':', 3);       // Szuka dwukropka po ID (np. za "200")
      int idx2 = data.indexOf(':', idx1 + 1); // Szuka dwukropka po długości (np. za "7")
      
      if (idx1 > 0 && idx2 > 0) {
        String idStr = data.substring(3, idx1);
        String lenStr = data.substring(idx1 + 1, idx2);
        String payloadStr = data.substring(idx2 + 1);
        
        // Konwersja tekstowego ID na liczbę HEX
        long txId = strtol(idStr.c_str(), NULL, 16);
        // Konwersja długości na liczbę
        int txLen = lenStr.toInt();
        byte txBuf[8] = {0};
        
        // Pętla tnąca payload (np. "15 C0 00...") na poszczególne bajty Hex
        int charIndex = 0;
        for (int i = 0; i < txLen; i++) {
          String byteStr = payloadStr.substring(charIndex, charIndex + 2);
          txBuf[i] = (byte)strtol(byteStr.c_str(), NULL, 16);
          charIndex += 3; // Skok do następnego bajtu (2 znaki HEX + 1 spacja)
        }
        
        // Nadawanie poskładanej ramki na magistralę CAN!
        CAN0.sendMsgBuf(txId, 0, txLen, txBuf);
      }
    }
  }
}

void loop() {
  long unsigned int rxId;
  unsigned char len = 0;
  unsigned char rxBuf[8];
  
  // --- ODBIERANIE Z KOMPUTERA I WYSYŁANIE NA CAN ---
  processSerial();

  // --- CZYTANIE RAMEK ---
  if (!digitalRead(CAN_INT_PIN)) {
    if (CAN0.readMsgBuf(&rxId, &len, rxBuf) == CAN_OK) {
      if (!carIsAwake) carIsAwake = true;

      if (rxId != 0x531 && rxId != 0x661 && rxId != 0x461) {
        if (isDelta(rxId, len, rxBuf)) {
          Serial.print(rxId, HEX); Serial.print(F(":"));
          for (int i = 0; i < len; i++) {
            if (rxBuf[i] < 0x10) Serial.print(F("0"));
            Serial.print(rxBuf[i], HEX); if (i < len - 1) Serial.print(F(" "));
          }
          Serial.println();
        }
      }
    }
  }

  // --- NADAWANIE ---
  if (carIsAwake) {
    static unsigned long lastHB = 0;
    if (millis() - lastHB >= 100) {
      lastHB = millis();
      
      // Sprawdzamy błędy SPI tylko w momencie nadawania (bezpieczne dla wydajności)
      checkHardwareErrors(); 
      
      unsigned char st[8] = {0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
      unsigned char nm[8] = {0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
      
      CAN0.sendMsgBuf(0x661, 0, 8, st);
      CAN0.sendMsgBuf(0x461, 0, 8, nm);
    }
  }
  
  delay(1);
}