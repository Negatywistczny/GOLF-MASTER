/** Firmware SYS/ERR messages — descriptions, UI tone, TTL overrides. */
export const MESSAGE_CATALOG = Object.freeze({
    "HW:READY": {
        desc: "Inicjalizacja TWAI zakończona — ESP32 gotowe",
        tone: "info",
        ttlMs: 8000
    },
    "FW:BUILD_ID": {
        desc: "Identyfikator buildu firmware",
        tone: "info",
        ttlMs: null
    },
    "CAN:NM_MODE_AUTO": {
        desc: "Auto-NM: stany AUTO_ACTIVE / SLEEP_PREP / SILENT_LISTEN",
        tone: "info",
        ttlMs: null
    },
    "CAN:SLEEP_IND": {
        desc: "Gateway 0x42B — SleepInd (bit 0x10)",
        tone: "warn",
        ttlMs: 15000
    },
    "CAN:WAKE_START": {
        desc: "wakeCombo 0→≠0 w Alive do 0x0B",
        tone: "info",
        ttlMs: 10000
    },
    "CAN:WAKE_END": {
        desc: "wakeCombo ≠0→0 — koniec sygnalizacji wake",
        tone: "warn",
        ttlMs: 10000
    },
    "CAN:IDLE_SHUTDOWN": {
        desc: "10 s ciszy CAN — idle shutdown + light sleep",
        tone: "warn",
        ttlMs: 20000
    },
    "HW:LIGHT_SLEEP_ENTER": {
        desc: "Wejście w light sleep (GPIO wake na TWAI_RX)",
        tone: "warn",
        ttlMs: 15000
    },
    "HW:LIGHT_SLEEP_WAKE": {
        desc: "Wybudzenie z light sleep",
        tone: "info",
        ttlMs: 10000
    },
    "HW:TWAI:RECOVERING": {
        desc: "TWAI recovery po BUS_OFF",
        tone: "warn",
        ttlMs: 10000
    },
    "HW:TWAI:RUNNING": {
        desc: "Sterownik TWAI w stanie RUNNING",
        tone: "info",
        ttlMs: 8000
    },
    "RELAY_ILL:OFF_BY_CAN_IDLE": {
        desc: "ILL wyłączone po 2 s ciszy CAN",
        tone: "info",
        ttlMs: 8000
    },
    "RELAYS:FORCED_OFF_BY_SILENCE": {
        desc: "Wszystkie przekaźniki OFF po 5 min ciszy CAN",
        tone: "warn",
        ttlMs: 20000
    },
    "OTA:START": {
        desc: "Rozpoczęto upload OTA — sleep zablokowany",
        tone: "info",
        ttlMs: 60000
    },
    "OTA:END": {
        desc: "Upload OTA zakończony",
        tone: "info",
        ttlMs: 15000
    },
    "HW:TWAI:BUS_OFF": {
        desc: "Kontroler TWAI w BUS_OFF (liczniki TEC/REC w szczegółach)",
        tone: "error",
        ttlMs: 30000
    },
    "HW:TWAI:RECOVERY_START_FAIL": {
        desc: "Nie udało się uruchomić recovery TWAI",
        tone: "error",
        ttlMs: 30000
    },
    "HW:TWAI:RESTART_FAIL": {
        desc: "twai_start() po recovery nie powiódł się",
        tone: "error",
        ttlMs: 30000
    },
    "HW:INIT_FAIL": {
        desc: "Błąd instalacji / startu sterownika TWAI",
        tone: "error",
        ttlMs: null
    },
    "HW:TJA": {
        desc: "Błąd transceivera TJA1055T (pin ERR)",
        tone: "error",
        ttlMs: 30000
    },
    "CAN:HANG": {
        desc: "Brak ramek 0x42B→0x0B >2 s przy aktywnej magistrali",
        tone: "error",
        ttlMs: 60000
    },
    "OTA": {
        desc: "Błąd uploadu OTA",
        tone: "error",
        ttlMs: 30000
    }
});

const SORTED_KEYS = Object.keys(MESSAGE_CATALOG).sort((a, b) => b.length - a.length);

export function resolveFirmwareMessageKey(restParts) {
    const joined = restParts.join(":");
    for (const key of SORTED_KEYS) {
        if (joined === key) return { key, details: "" };
        if (joined.startsWith(`${key}:`)) {
            return { key, details: joined.slice(key.length + 1) };
        }
    }
    const fallbackKey = restParts.slice(0, 2).join(":");
    return { key: fallbackKey, details: restParts.slice(2).join(":") };
}

export function catalogEntryFor(key) {
    return MESSAGE_CATALOG[key] || null;
}
