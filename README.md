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

---

## 🚀 Uruchamianie Systemu (One-Click Start)

System posiada zautomatyzowany skrypt rozruchowy **`START.BAT`**, który samodzielnie podnosi wszystkie warstwy projektu we właściwej kolejności.

### Jak uruchomić?
Wystarczy dwukrotnie kliknąć plik `START.BAT` znajdujący się w głównym katalogu projektu. 

### Co dokładnie robi skrypt?
1. **Podniesienie Mostka:** Wywołuje polecenie `start python bridge/bridge.py`, które w nowym oknie konsoli uruchamia serwer WebSocket i nawiązuje połączenie Serial z Arduino.
2. **Synchronizacja (Timeout):** Odczekuje równe 2 sekundy (`timeout /t 2`). Jest to kluczowe, aby skrypt w Pythonie zdążył zająć port COM i uruchomić nasłuchiwanie na porcie 8765, zanim przeglądarka spróbuje się z nim połączyć.
3. **Uruchomienie Interfejsu (Smart UI):** Otwiera plik `index.html` z wykorzystaniem zmiennej `%~dp0` (która automatycznie podstawia absolutną ścieżkę do folderu z projektem, co zapobiega błędom ścieżek względnych).
4. **Zarządzanie Zabezpieczeniami (CORS):** Skrypt wymusza otwarcie przeglądarki Chrome z flagą `--allow-running-insecure-content`. Jest to niezbędne, ponieważ otwieranie lokalnego pliku (`file://`) i jednoczesne próby łączenia się przez protokół WebSocket (`ws://`) mogą być natywnie blokowane przez politykę bezpieczeństwa przeglądarki. Flaga ta gwarantuje płynną komunikację.
