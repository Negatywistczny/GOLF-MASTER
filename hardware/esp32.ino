#include <WiFi.h>
#include <ESPmDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include "BluetoothSerial.h"
#include "driver/twai.h"
#include "esp_sleep.h"

// --- UZUPEŁNIJ DANE SWOJEGO WIFI (LUB HOTSPOTU Z TELEFONU) ---
const char *ssid = "Krytyczny_Sukces_5G";
const char *password = "resocjalizacja123";

// --- SPRZĘT (ESP32) ---
const int TJA_ERR = 18;
const int TJA_STB = 19;
const int TJA_EN = 21;
const int RELAY_ACC_PIN = 27;
const int RELAY_ILL_PIN = 26;
const int RELAY_BACK_PIN = 25;
const int TWAI_TX_PIN = 23;
const int TWAI_RX_PIN = 22;

// --- TERMINAL / BT ---
#define SERIAL_BUF_SIZE 64

// --- NM / CAN (PQ35) ---
const uint32_t NM_GATEWAY_ID = 0x42B;
const uint32_t NM_ESP32_ID = 0x40B;
const uint8_t NEXT_NODE_ID = 0x2B;

const uint8_t NM_CMD_RING = 0x01;
const uint8_t NM_CMD_ALIVE = 0x02;
const uint8_t NM_MASK_CMD_LIMP = 0x04;
const uint8_t NM_MASK_SLEEP = 0x10;
const uint8_t NM_TX_SLEEP_ACK = 0x20;
const uint8_t NM_NODE_SELF = 0x0B;

// --- INTERWAŁY ---
const unsigned long INTERVAL_RADIO_PUMP = 150;
const unsigned long INTERVAL_HANG_CHECK = 2000;
const unsigned long INTERVAL_TJA_ERR_LOG = 5000;
const unsigned long INTERVAL_RELAY_SILENCE_OFF = 300000;
const unsigned long INTERVAL_HW_CHECK = 1000;
const uint8_t MAX_FRAMES_PER_RX_LOOP = 48;

const uint32_t CAN_ID_RADIO_STATUS = 0x661;
const uint32_t CAN_ID_SNIFFER_IGNORE_A = 0x531;
const uint32_t CAN_ID_IGNITION_STATUS = 0x2C3;
const uint32_t CAN_ID_DIMMING = 0x635;
const uint32_t CAN_ID_LIGHT_STATUS = 0x531;
const uint8_t CAN_MAX_DLEN = 8;
const uint32_t CAN_ID_MASK = 0x1FFFFFFF;

BluetoothSerial SerialBT;

// --- STAN (NM / watchdog / wake) ---
unsigned long lastSendTime = 0;
unsigned long lastGwSelfNmMs = 0;
bool isHanging = false;
bool busSleep = true;
bool isBusActive = false;
bool isTwaiReady = false;
unsigned long lastErrCheckMs = 0;
unsigned long lastAnyCanActivityMs = 0;
bool relayForcedOffBySilence = false;
twai_state_t lastTwaiState = TWAI_STATE_STOPPED;

bool relayAccOn = false;
bool relayIllOn = false;
bool relayBackOn = false;

enum AutoNmState : uint8_t {
  AUTO_ACTIVE = 0,
  AUTO_SLEEP_PREP,
  AUTO_SILENT_LISTEN
};

AutoNmState autoNmState = AUTO_SILENT_LISTEN;

// --- FORWARD DECLARATIONS ---
void setAutoNmState(AutoNmState next);
void handleGatewayNm(uint32_t id, uint8_t *buf, uint8_t len);
void checkHardwareErrors();
void processSerial();
void updateRelaySignalsFromFrame(uint32_t id, const uint8_t *buf, uint8_t len);
void applyRelayOutputs();
void wejdzWTrybLekkiegoSnu();
bool sendCanFrame(uint32_t id, uint8_t len, const uint8_t *data);
bool initTwai();

// --- HELPERS ---
inline uint32_t decodeWakeCombo(const uint8_t *buf) {
  return (uint32_t)buf[2] | ((uint32_t)buf[3] << 8) | ((uint32_t)buf[4] << 16);
}

inline uint32_t normalizeCanId(uint32_t rawId) {
  return rawId & CAN_ID_MASK;
}

inline uint8_t normalizeCanLen(uint8_t rawLen) {
  return (rawLen > CAN_MAX_DLEN) ? CAN_MAX_DLEN : rawLen;
}

void setAutoNmState(AutoNmState next) {
  if (autoNmState == next) return;
  autoNmState = next;
}

void applyRelayOutputs() {
  digitalWrite(RELAY_ACC_PIN, relayAccOn ? LOW : HIGH);
  digitalWrite(RELAY_ILL_PIN, relayIllOn ? LOW : HIGH);
  digitalWrite(RELAY_BACK_PIN, relayBackOn ? LOW : HIGH);
}

void updateRelaySignalsFromFrame(uint32_t id, const uint8_t *buf, uint8_t len) {
  if (len < 1) return;

  if (id == CAN_ID_IGNITION_STATUS) {
    relayAccOn = (buf[0] & 0x02) != 0; // ZS1_ZAS_Kl_15
    applyRelayOutputs();
    return;
  }

  if (id == CAN_ID_DIMMING) {
    uint8_t displayPercent = buf[0] & 0x7F;  // DI1_Display (0..100)
    bool displayFault = (buf[0] & 0x80) != 0; // DI1_Display_def
    relayIllOn = (!displayFault && displayPercent > 0);
    applyRelayOutputs();
    return;
  }

  if (id == CAN_ID_LIGHT_STATUS) {
    relayBackOn = (buf[0] & 0x20) != 0; // LIA_Rueckfahrlicht
    applyRelayOutputs();
  }
}

// --- LOGIKA DELTA ---
#define MAX_TRACKED_IDS 60
struct CANFrame {
  uint32_t id;
  uint8_t len;
  uint8_t data[8];
};
CANFrame trackedFrames[MAX_TRACKED_IDS];
uint8_t trackedCount = 0;

// --- FILTRY ---
bool isDiagFrame(uint32_t id) {
  if (id >= 0x200 && id <= 0x27F) return true; // TP 2.0 Setup
  if (id == 0x300) return true;                // TP 2.0 RX
  if (id >= 0x700 && id <= 0x7FF) return true; // UDS/KWP
  return false;
}

bool isDelta(uint32_t id, uint8_t len, const uint8_t *data) {
  uint8_t safeLen = normalizeCanLen(len);
  for (uint8_t i = 0; i < trackedCount; i++) {
    if (trackedFrames[i].id == id) {
      for (uint8_t j = 0; j < safeLen; j++) {
        if (trackedFrames[i].data[j] != data[j]) {
          memcpy(trackedFrames[i].data, data, safeLen);
          trackedFrames[i].len = safeLen;
          return true;
        }
      }
      return false;
    }
  }
  if (trackedCount < MAX_TRACKED_IDS) {
    trackedFrames[trackedCount].id = id;
    trackedFrames[trackedCount].len = safeLen;
    memcpy(trackedFrames[trackedCount].data, data, safeLen);
    trackedCount++;
  }
  return true;
}

inline bool isNmCommandFrame(uint8_t b1) {
  return (b1 & (NM_CMD_RING | NM_CMD_ALIVE | NM_MASK_CMD_LIMP)) != 0;
}

void updateSleepSignalsFromGateway(uint8_t b1, const uint8_t *buf) {
  if (buf[0] != NM_NODE_SELF) return;

  lastGwSelfNmMs = millis();
  isHanging = false;

  if ((b1 & NM_MASK_SLEEP) != 0) {
    SerialBT.println("SYS:CAN:SLEEP_IND");
    busSleep = true;
    setAutoNmState(AUTO_SILENT_LISTEN);
    wejdzWTrybLekkiegoSnu();
    return;
  }

  if ((b1 & NM_CMD_ALIVE) != 0) {
    busSleep = false;
    setAutoNmState(isBusActive ? AUTO_ACTIVE : AUTO_SLEEP_PREP);
  }
}

void updateWakeStateFromAlive(uint8_t b1, const uint8_t *buf, uint8_t len) {
  if (buf[0] != NM_NODE_SELF || (b1 & NM_CMD_ALIVE) == 0 || len < 5) return;
  if ((b1 & NM_MASK_SLEEP) != 0) return;

  uint32_t wakeCombo = decodeWakeCombo(buf);
  static uint32_t prevWakeCombo = 0;
  if (prevWakeCombo == 0 && wakeCombo != 0) {
    isBusActive = true;
    setAutoNmState(AUTO_ACTIVE);
  } else if (prevWakeCombo != 0 && wakeCombo == 0) {
    isBusActive = false;
    setAutoNmState(AUTO_SLEEP_PREP);
  }
  prevWakeCombo = wakeCombo;
}

uint8_t buildNmReplyByte1(uint8_t gatewayByte1) {
  if ((gatewayByte1 & NM_MASK_SLEEP) != 0) {
    return NM_CMD_RING | NM_TX_SLEEP_ACK;
  }

  if (gatewayByte1 & NM_MASK_CMD_LIMP) {
    return NM_CMD_ALIVE;
  }
  if (gatewayByte1 & NM_CMD_RING) {
    return NM_CMD_RING;
  }
  return NM_CMD_ALIVE;
}

void handleGatewayNm(uint32_t id, uint8_t *buf, uint8_t len) {
  if (id != NM_GATEWAY_ID || len < 2) return;

  uint8_t b1 = buf[1];
  updateSleepSignalsFromGateway(b1, buf);
  updateWakeStateFromAlive(b1, buf, len);

  if (buf[0] == NM_NODE_SELF && isNmCommandFrame(b1)) {
    uint8_t txB1 = buildNmReplyByte1(b1);
    uint8_t txBuf[6] = {NEXT_NODE_ID, txB1, 0, 0, 0, 0};
    sendCanFrame(NM_ESP32_ID, 6, txBuf);
  }
}

bool sendCanFrame(uint32_t id, uint8_t len, const uint8_t *data) {
  twai_message_t txMsg = {};
  txMsg.identifier = normalizeCanId(id);
  txMsg.flags = TWAI_MSG_FLAG_SS; // Single-shot: brak nieskończonej retransmisji.
  if (txMsg.identifier > 0x7FF) {
    txMsg.flags |= TWAI_MSG_FLAG_EXTD;
  }
  txMsg.data_length_code = normalizeCanLen(len);
  memcpy(txMsg.data, data, txMsg.data_length_code);

  return twai_transmit(&txMsg, 0) == ESP_OK;
}

// --- DIAGNOSTYKA BŁĘDÓW HW ---
void checkHardwareErrors() {
  twai_status_info_t status = {};
  if (twai_get_status_info(&status) == ESP_OK && status.state != lastTwaiState) {
    lastTwaiState = status.state;
    if (status.state == TWAI_STATE_BUS_OFF) {
      SerialBT.println("ERR:HW:TWAI:BUS_OFF");
      twai_initiate_recovery();
    } else if (status.state == TWAI_STATE_RECOVERING) {
      SerialBT.println("SYS:HW:TWAI:RECOVERING");
    } else if (status.state == TWAI_STATE_RUNNING) {
      SerialBT.println("SYS:HW:TWAI:RUNNING");
    }
  }

  static unsigned long lastTjaErrLog = 0;
  if (digitalRead(TJA_ERR) == LOW) {
    unsigned long now = millis();
    if (now - lastTjaErrLog >= INTERVAL_TJA_ERR_LOG) {
      lastTjaErrLog = now;
      SerialBT.println("ERR:HW:TJA");
    }
  }
}

// --- ODBIERANIE Z BLUETOOTH (TX na CAN) ---
void processSerial() {
  if (SerialBT.available() <= 0) return;

  char buf[SERIAL_BUF_SIZE];
  size_t len = SerialBT.readBytesUntil('\n', buf, SERIAL_BUF_SIZE - 1);
  buf[len] = '\0';

  while (len > 0 && (buf[len - 1] == '\r' || buf[len - 1] == ' ')) {
    buf[--len] = '\0';
  }

  if (strncmp(buf, "TX:", 3) != 0) return;

  char *ptr;
  uint32_t txId = strtoul(buf + 3, &ptr, 16);
  if (*ptr != ':') return;

  ptr++;
  int txLen = strtol(ptr, &ptr, 10);
  if (txLen < 0) txLen = 0;
  if (txLen > 8) txLen = 8;
  if (*ptr != ':') return;

  ptr++;
  uint8_t txBuf[8] = {0};
  for (int i = 0; i < txLen && i < 8; i++) {
    txBuf[i] = (uint8_t)strtoul(ptr, &ptr, 16);
  }
  sendCanFrame(txId, (uint8_t)txLen, txBuf);
}

inline bool shouldPrintIncomingFrame(uint32_t rxId, uint8_t len, const uint8_t *rxBuf) {
  if (rxId == CAN_ID_SNIFFER_IGNORE_A || rxId == CAN_ID_RADIO_STATUS || rxId == NM_ESP32_ID) {
    return false;
  }
  return isDiagFrame(rxId) || isDelta(rxId, len, rxBuf);
}

void printIncomingFrame(uint32_t rxId, uint8_t len, const uint8_t *rxBuf) {
  uint8_t safeLen = normalizeCanLen(len);
  SerialBT.print("0x");
  SerialBT.print(rxId, HEX);
  SerialBT.print(":");
  for (uint8_t i = 0; i < safeLen; i++) {
    if (rxBuf[i] < 0x10) SerialBT.print("0");
    SerialBT.print(rxBuf[i], HEX);
    if (i < safeLen - 1) SerialBT.print(" ");
  }
  SerialBT.println();
}

void processCanRxLoop() {
  uint8_t processedFrames = 0;
  twai_message_t rxMsg = {};

  while (processedFrames < MAX_FRAMES_PER_RX_LOOP) {
    esp_err_t rxRes = twai_receive(&rxMsg, 0);
    if (rxRes == ESP_ERR_TIMEOUT) break;
    if (rxRes != ESP_OK) break;

    if (rxMsg.flags & TWAI_MSG_FLAG_RTR) {
      processedFrames++;
      continue;
    }

    uint8_t rxBuf[8] = {0};
    uint8_t len = normalizeCanLen(rxMsg.data_length_code);
    memcpy(rxBuf, rxMsg.data, len);

    lastAnyCanActivityMs = millis();
    relayForcedOffBySilence = false;

    uint32_t rxId = normalizeCanId(rxMsg.identifier);
    updateRelaySignalsFromFrame(rxId, rxBuf, len);
    handleGatewayNm(rxId, rxBuf, len);

    if (shouldPrintIncomingFrame(rxId, len, rxBuf)) {
      printIncomingFrame(rxId, len, rxBuf);
    }

    processedFrames++;
  }
}

void runHealthChecks() {
  if (!relayForcedOffBySilence && lastAnyCanActivityMs != 0 &&
      (millis() - lastAnyCanActivityMs > INTERVAL_RELAY_SILENCE_OFF)) {
    relayAccOn = false;
    relayIllOn = false;
    relayBackOn = false;
    applyRelayOutputs();
    relayForcedOffBySilence = true;
    SerialBT.println("SYS:RELAYS:FORCED_OFF_BY_SILENCE");
  }

  if (!isHanging && !busSleep && lastGwSelfNmMs != 0 &&
      (millis() - lastGwSelfNmMs > INTERVAL_HANG_CHECK)) {
    SerialBT.println("ERR:CAN:HANG");
    isHanging = true;
  }

  if (millis() - lastErrCheckMs > INTERVAL_HW_CHECK) {
    lastErrCheckMs = millis();
    checkHardwareErrors();
  }
}

void pumpRadioIfActive() {
  if (autoNmState == AUTO_ACTIVE && (millis() - lastSendTime >= INTERVAL_RADIO_PUMP)) {
    lastSendTime = millis();
    uint8_t stRadio[8] = {0x01, 0x01, 0x10, 0, 0, 0, 0, 0};
    sendCanFrame(CAN_ID_RADIO_STATUS, 8, stRadio);
  }
}

void wejdzWTrybLekkiegoSnu() {
  // Przekaźniki active-low: OFF = HIGH — odcięcie zasilania radia przed snem.
  relayAccOn = false;
  relayIllOn = false;
  relayBackOn = false;
  applyRelayOutputs();

  SerialBT.println("SYS:HW:LIGHT_SLEEP_ENTER");
  SerialBT.flush();
  delay(500);

  esp_sleep_enable_gpio_wakeup();
  gpio_wakeup_enable((gpio_num_t)TWAI_RX_PIN, GPIO_INTR_LOW_LEVEL);
  esp_light_sleep_start();

  gpio_wakeup_disable((gpio_num_t)TWAI_RX_PIN);

  SerialBT.println("SYS:HW:LIGHT_SLEEP_WAKE");
}

bool initTwai() {
  twai_general_config_t gConfig =
      TWAI_GENERAL_CONFIG_DEFAULT((gpio_num_t)TWAI_TX_PIN, (gpio_num_t)TWAI_RX_PIN, TWAI_MODE_NORMAL);
  gConfig.tx_queue_len = 24;
  gConfig.rx_queue_len = 24;

  twai_timing_config_t tConfig = TWAI_TIMING_CONFIG_100KBITS();
  twai_filter_config_t fConfig = TWAI_FILTER_CONFIG_ACCEPT_ALL();

  if (twai_driver_install(&gConfig, &tConfig, &fConfig) != ESP_OK) {
    return false;
  }
  if (twai_start() != ESP_OK) {
    twai_driver_uninstall();
    return false;
  }
  lastTwaiState = TWAI_STATE_RUNNING;
  return true;
}

void setup() {
  Serial.begin(115200);
  Serial.println("System startuje...");

  SerialBT.begin("VAG_ESP32_BT");
  Serial.println("Bluetooth gotowy jako: VAG_ESP32_BT");

  pinMode(TJA_ERR, INPUT_PULLUP);
  pinMode(TJA_STB, OUTPUT);
  pinMode(TJA_EN, OUTPUT);
  pinMode(RELAY_ACC_PIN, OUTPUT);
  pinMode(RELAY_ILL_PIN, OUTPUT);
  pinMode(RELAY_BACK_PIN, OUTPUT);
  digitalWrite(TJA_STB, HIGH);
  digitalWrite(TJA_EN, HIGH);
  applyRelayOutputs();
  lastAnyCanActivityMs = millis();

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Laczenie z WiFi...");
  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi polaczone! Adres IP modulu: ");
    Serial.println(WiFi.localIP());

    ArduinoOTA.setHostname("VAG-Dekoder-OTA");
    ArduinoOTA.onStart([]() { SerialBT.println("SYS:OTA:START"); });
    ArduinoOTA.onEnd([]() { SerialBT.println("SYS:OTA:END"); });
    ArduinoOTA.onError([](ota_error_t error) {
      SerialBT.printf("ERR:OTA:0x%X\n", error);
    });
    ArduinoOTA.begin();
    Serial.println("Serwer OTA gotowy.");
  } else {
    Serial.println("Nie znaleziono WiFi. System dziala w trybie tylko-Bluetooth.");
  }

  if (initTwai()) {
    isTwaiReady = true;
    SerialBT.println("SYS:HW:READY");
    SerialBT.println("SYS:CAN:NM_MODE_AUTO");
    setAutoNmState(AUTO_SILENT_LISTEN);
  } else {
    isTwaiReady = false;
    SerialBT.println("ERR:HW:INIT_FAIL");
  }

  gpio_wakeup_enable((gpio_num_t)TWAI_RX_PIN, GPIO_INTR_LOW_LEVEL);
}

void loop() {
  // OTA działa zawsze, niezależnie od awarii CAN.
  if (WiFi.status() == WL_CONNECTED) {
    ArduinoOTA.handle();
  }

  // Wykonuj operacje CAN tylko, jeśli sprzęt poprawnie wystartował.
  if (isTwaiReady) {
    processSerial();
    processCanRxLoop();
    runHealthChecks();
    pumpRadioIfActive();
  }
}