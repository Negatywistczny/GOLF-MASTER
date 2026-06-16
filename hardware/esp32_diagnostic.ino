#include <WiFi.h>
#include <ArduinoOTA.h>
#include "BluetoothSerial.h"
#include "driver/twai.h"

// --- DANE WIFI ---
const char *ssid = "Krytyczny_Sukces_5G";
const char *password = "resocjalizacja123";

// --- PINY ---
const int TJA_ERR = 18;
const int TJA_STB = 19;
const int TJA_EN = 21;
const int RELAY_ACC = 27;
const int RELAY_ILL = 26;
const int RELAY_BACK = 25;
const int TWAI_TX_PIN = 23;
const int TWAI_RX_PIN = 22;

BluetoothSerial SerialBT;

// Zmienne stanu przekaźników
bool accState = false;
bool illState = false;
bool backState = false;

unsigned long lastHeartbeat = 0;
bool isTwaiRunning = false;

void setup() {
  Serial.begin(115200);
  SerialBT.begin("VAG_DIAGNOSTYKA_BT");

  // Inicjalizacja pinów
  pinMode(TJA_ERR, INPUT_PULLUP);
  pinMode(TJA_STB, OUTPUT);
  pinMode(TJA_EN, OUTPUT);
  pinMode(RELAY_ACC, OUTPUT);
  pinMode(RELAY_ILL, OUTPUT);
  pinMode(RELAY_BACK, OUTPUT);

  // Domyślny stan (Wyłączone - dla logiki Active LOW dajemy HIGH)
  digitalWrite(RELAY_ACC, HIGH);
  digitalWrite(RELAY_ILL, HIGH);
  digitalWrite(RELAY_BACK, HIGH);

  // Wybudzenie TJA1055
  digitalWrite(TJA_STB, HIGH);
  digitalWrite(TJA_EN, HIGH);

  // WiFi i OTA
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  unsigned long startWifi = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startWifi < 8000) {
    delay(500);
  }
  if (WiFi.status() == WL_CONNECTED) {
    ArduinoOTA.setHostname("VAG-Diag-OTA");
    ArduinoOTA.begin();
  }

  // Inicjalizacja TWAI (CAN)
  twai_general_config_t gConfig = TWAI_GENERAL_CONFIG_DEFAULT((gpio_num_t)TWAI_TX_PIN, (gpio_num_t)TWAI_RX_PIN, TWAI_MODE_NORMAL);
  twai_timing_config_t tConfig = TWAI_TIMING_CONFIG_100KBITS();
  twai_filter_config_t fConfig = TWAI_FILTER_CONFIG_ACCEPT_ALL();

  if (twai_driver_install(&gConfig, &tConfig, &fConfig) == ESP_OK && twai_start() == ESP_OK) {
    isTwaiRunning = true;
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    ArduinoOTA.handle();
  }

  // POBRANIE STATUSU CAN NA ŻYWO Z PROCESORA
  twai_status_info_t twaiStatus;
  bool isStatusOk = (twai_get_status_info(&twaiStatus) == ESP_OK);

  // 1. BICIE SERCA (Heartbeat) - teraz z licznikem błędów!
  if (millis() - lastHeartbeat > 5000) {
    lastHeartbeat = millis();
    if (SerialBT.hasClient()) {
      SerialBT.println("--- DIAGNOSTYKA AKTYWNA ---");
      SerialBT.print("WiFi: "); SerialBT.println(WiFi.status() == WL_CONNECTED ? "OK" : "BRAK");
      
      if (isStatusOk) {
        SerialBT.print("CAN Status: ");
        if (twaiStatus.state == TWAI_STATE_RUNNING) SerialBT.println("RUNNING (Nasluchuje...)");
        else if (twaiStatus.state == TWAI_STATE_BUS_OFF) SerialBT.println("BUS_OFF (Krytyczny Blad - odciecie!)");
        else SerialBT.println("INNY STAN");
        
        // OTO LINJKI, KTÓRE BĘDĄ LICZYĆ BŁĘDY TRANSMISJI:
        SerialBT.print("Liczniki BLEDOW -> RX: "); 
        SerialBT.print(twaiStatus.rx_error_counter);
        SerialBT.print(" | TX: "); 
        SerialBT.println(twaiStatus.tx_error_counter);
      } else {
        SerialBT.println("CAN: BRAK KOMUNIKACJI Z KONTROLEREM");
      }
      
      SerialBT.println("Slij: '1'(ACC), '2'(ILL), '3'(BACK), 'E'(TJA Blad)");
      SerialBT.println("---------------------------");
    }
  }

  // 2. ODBIÓR KOMEND Z KLAWIATURY TELEFONU
  if (SerialBT.available()) {
    char cmd = SerialBT.read();
    if (cmd == '1') { accState = !accState; digitalWrite(RELAY_ACC, accState ? LOW : HIGH); SerialBT.print("ACC: "); SerialBT.println(accState ? "ON" : "OFF"); } 
    else if (cmd == '2') { illState = !illState; digitalWrite(RELAY_ILL, illState ? LOW : HIGH); SerialBT.print("ILL: "); SerialBT.println(illState ? "ON" : "OFF"); } 
    else if (cmd == '3') { backState = !backState; digitalWrite(RELAY_BACK, backState ? LOW : HIGH); SerialBT.print("BACK: "); SerialBT.println(backState ? "ON" : "OFF"); } 
    else if (cmd == 'E' || cmd == 'e') {
      int errStatus = digitalRead(TJA_ERR);
      SerialBT.print("Status TJA_ERR (Pin 18): "); SerialBT.println(errStatus == LOW ? "AWARIA" : "OK");
    }
  }

  // 3. NASŁUCHIWANIE MAGISTRALI CAN
  if (isTwaiRunning && isStatusOk && twaiStatus.state == TWAI_STATE_RUNNING) {
    twai_message_t rxMsg;
    if (twai_receive(&rxMsg, 1) == ESP_OK) {
      if (!(rxMsg.flags & TWAI_MSG_FLAG_RTR)) {
        SerialBT.print("CAN RX -> ID: 0x");
        SerialBT.print(rxMsg.identifier, HEX);
        SerialBT.print(" DLC: ");
        SerialBT.print(rxMsg.data_length_code);
        SerialBT.print(" Data: ");
        for (int i = 0; i < rxMsg.data_length_code; i++) {
          if (rxMsg.data[i] < 0x10) SerialBT.print("0");
          SerialBT.print(rxMsg.data[i], HEX);
          SerialBT.print(" ");
        }
        SerialBT.println();
      }
    }
  }
}