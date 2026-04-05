#include <SPI.h>
#include <mcp_can.h>

const int SPI_CS_PIN = 10;
const int CAN_INT_PIN = 2;
const int TJA_ERR = 4;
const int TJA_STB = 5;
const int TJA_EN  = 6;

MCP_CAN CAN0(SPI_CS_PIN);

// --- LOGIKA DELTA (Zredukowana dla stabilności) ---
#define MAX_TRACKED_IDS 40 
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
  pinMode(CAN_INT_PIN, INPUT);
  pinMode(TJA_ERR, INPUT_PULLUP);
  pinMode(TJA_STB, OUTPUT);
  pinMode(TJA_EN, OUTPUT);
  digitalWrite(TJA_STB, HIGH);
  digitalWrite(TJA_EN, HIGH);
  delay(100); 

  // Próba startu MCP2515
  if (CAN0.begin(MCP_ANY, CAN_100KBPS, MCP_8MHZ) == CAN_OK) {
    CAN0.setMode(MCP_NORMAL);
    // Logujemy udany start jako informację systemową
    Serial.println(F("SYS:HW:READY")); 
  } else {
    // Błąd krytyczny inicjalizacji
    Serial.println(F("ERR:HW:INIT_FAIL"));
    while (1);
  }
}

// --- POPRAWIONA OBSŁUGA BŁĘDÓW ---
void checkHardwareErrors() {
  byte err = CAN0.checkError(); 
  if (err != 0) {
    // Wysyłamy błąd w formacie: ERR:HW:0x[KOD]
    Serial.print(F("ERR:HW:0x")); 
    if (err < 0x10) Serial.print(F("0"));
    Serial.println(err, HEX);
    
    // Jeśli Bus-Off (bit 5 / 0x20), próbujemy przywrócić tryb Normal
    if (err & 0x20) {
      CAN0.setMode(MCP_NORMAL);
    }
  }
  // Resetowanie flag rejestru EFLG (0x2D), aby nie wysyłać błędu w pętli jeśli ustąpił
  CAN0.mcp2515_modifyRegister(0x2D, 0xFF, 0x00);
}

void loop() {
  long unsigned int rxId;
  unsigned char len = 0;
  unsigned char rxBuf[8];

  // --- CZYTANIE RAMEK ---
  if (!digitalRead(CAN_INT_PIN)) {
    if (CAN0.readMsgBuf(&rxId, &len, rxBuf) == CAN_OK) {
      if (!carIsAwake) carIsAwake = true;

      // Filtrujemy ramki, których nie chcemy w delcie (np. te które sami nadajemy)
      if (rxId != 0x531 && rxId != 0x661 && rxId != 0x461) {
        if (isDelta(rxId, len, rxBuf)) {
          // Standardowy format danych: ID:DATA
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

  // --- NADAWANIE (VAG Heartbeat / Network Management) ---
  if (carIsAwake) {
    static unsigned long lastHB = 0;
    if (millis() - lastHB >= 100) {
      lastHB = millis();
      
      // Sprawdzamy błędy MCP2515 raz na 100ms
      checkHardwareErrors(); 
      
      unsigned char st[8] = {0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
      unsigned char nm[8] = {0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
      CAN0.sendMsgBuf(0x661, 0, 8, st);
      CAN0.sendMsgBuf(0x461, 0, 8, nm);
    }
  }
  
  delay(1); // Minimalne opóźnienie dla stabilności Serial
}
