# 🏎️ GOLF MASTER v50.0 - Ultimate CAN Management System

**GOLF MASTER** to zaawansowany ekosystem inżynieryjny przeznaczony do monitorowania, diagnostyki i zarządzania magistralą **CAN-Infotainment** w samochodach grupy VAG (platforma **PQ35**, m.in. VW Golf V, Passat B6, Leon II).

System łączy precyzję sprzętową mikrokontrolera z nowoczesnym interfejsem webowym, umożliwiając bezpieczną komunikację z autem bez ryzyka rozładowania akumulatora.



---

## 🏗️ Architektura Systemu
Projekt składa się z trzech współpracujących warstw:

1.  **Hardware (Arduino + MCP2515 + TJA1055):** Fizyczny mostek wpięty w kable samochodu. Obsługuje niskopoziomowy protokół OSEK NM w **logice zero-jedynkowej**: odpowiedź `0x40B` i podtrzymanie radia (`0x661`) działają tylko, gdy Gateway w ramce Alive (`0x42B`) raportuje **Weckursache** (niezerowy Bajt 2 — powody wybudzenia CAN / Wake / Timer). Po wygaśnięciu przyczyn Arduino celowo milknie, umożliwiając uśpienie magistrali. Szczegóły: [hardware/README.md](./hardware/README.md).
2.  **Bridge (Python):** Asynchroniczny serwer zarządzający przepływem danych, obsługujący diagnostykę TP 2.0 oraz automatyczne zwalnianie portów.
3.  **Smart UI (Web Frontend):** Responsywny dashboard wizualizujący stan auta w czasie rzeczywistym oraz umożliwiający przeprowadzanie pełnych skanów DTC.

---

## 📂 Struktura Projektu
Każdy folder zawiera dedykowaną dokumentację techniczną:

* [**`/hardware`**](./hardware/README.md) – Kod źródłowy Arduino, schematy połączeń i konfiguracja transiwera TJA.
* [**`/bridge`**](./bridge/README.md) – Skrypt Python pośredniczący w komunikacji (WebSocket server).
* [**`/web`**](./web/README.md) – Interfejs użytkownika, dekodery sygnałów i terminal live.
* [**`/data`**](./data/README.md) – Bazy wiedzy DBC, mapy adresów i opisy sygnałów CAN.
* [**`MESSAGES.md`**](./MESSAGES.md) – **Słownik komunikatów** (SYS/ERR) używanych w całym systemie.

### Struktura Frontendu (aktualna)
Warstwa Web UI jest rozwijana w modułach ES6 (`web/js/`), a uruchamiana lokalnie przez wygenerowany bundle offline:

* `web/index.html` – punkt wejścia, ładuje `js/app.offline.js` (działa z `file://`).
* `web/js/` – moduły aplikacji (`main.js`, `ws.js`, `ui.js`, `state.js`, `config.js`, `utils.js`).
* `web/js/decoders/` – dekodery ramek CAN oraz router dekoderów.
* `web/build_offline_bundle.py` – skrypt generujący `web/js/app.offline.js` z modułów.

---

## 🚀 Uruchamianie Systemu (One-Click Start)

Projekt ma dwa skrypty startowe:

* Windows: `START.bat`
* macOS: `START.command`

### Jak uruchomić?
1. Kliknij odpowiedni plik startowy dla systemu.
2. Wybierz tryb:
   * `1` - realny bridge (`bridge/bridge.py`)
   * `2` - symulacja (`bridge/test_simulation.py`)
3. Skrypt automatycznie:
   * przebuduje `web/js/app.offline.js`,
   * uruchomi wybrany bridge,
   * otworzy `web/index.html` lokalnie (`file://`).

### Uwagi operacyjne
* UI działa offline po dwukliku `web/index.html`.
* Po ręcznych zmianach w `web/js/*.js` można przebudować bundle komendą:
  * `python3 web/build_offline_bundle.py`
