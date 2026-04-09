# DOKUMENTACJA MOSTEK (PYTHON BRIDGE) - GOLF MASTER

## 1. ROLA W SYSTEMIE
Skrypt `bridge.py` pełni rolę inteligentnego pośrednika (middleman) między warstwą sprzętową (Arduino) a interfejsem użytkownika (Web UI). Zarządza on asynchronicznym przepływem danych, kolejkami komunikatów oraz logiką diagnostyczną protokołu **TP 2.0 / KWP2000**.

## 2. WYMAGANIA I KONFIGURACJA
Skrypt wymaga środowiska Python 3.8+ oraz następujących bibliotek:
* `pyserial` - obsługa komunikacji USB z Arduino.
* `websockets` - komunikacja w czasie rzeczywistym z przeglądarką.
* `asyncio` - zarządzanie wielozadaniowością.

**Główne parametry (Konfigurowalne w kodzie):**
* `SERIAL_PORT`: Domyślnie `COM7`.
* `BAUD_RATE`: `115200`.
* `WS_PORT`: `8765`.

## 3. KLUCZOWE FUNKCJONALNOŚCI

### A. Zarządzanie energią i zasobami (Auto-Shutdown)
Skrypt implementuje inteligentny system zamykania procesu:
* **`auto_shutdown_timer()`**: Jeśli ostatni klient (karta w przeglądarce) zostanie zamknięty, skrypt odlicza 2 sekundy. Jeśli w tym czasie nikt nie połączy się ponownie, proces zabija się (`os._exit(0)`).
* **Cel**: Zwolnienie portu COM i zasobów systemowych natychmiast po zakończeniu pracy z UI, co zapobiega blokowaniu Arduino przez "wiszące" procesy w tle.

### B. Obsługa Szeregowego Portu (Serial Handling)
* **`handle_serial()`**: Działa w nieskończonej pętli.
    * **TX (Do Arduino)**: Pobiera wiadomości z kolejki `tx_queue` i wysyła je do auta.
    * **RX (Z Arduino)**: Czyta surowe linie danych, rozsyła je do wszystkich klientów WebSocket (`broadcast`) oraz zasila kolejkę `rx_queue` na potrzeby diagnostyki.

### C. Silnik Diagnostyczny (TP 2.0 / KWP2000)
Funkcja **`tp20_read_dtc()`** realizuje pełny, 4-etapowy "uścisk dłoni" (handshake) z modułami VAG:
1. **Channel Setup**: Nawiązanie sesji na ID `0x200`.
2. **Timing Parameters**: Potwierdzenie parametrów czasowych (odpowiedź `A0`).
3. **KWP2000 Request**: Wysłanie żądania kodów błędów (`0x18 - Read DTC`).
4. **DTC Reading**: Dekodowanie odpowiedzi na kanale logicznym i zamknięcie sesji (`A4`).

### D. Auto-Skanowanie (Full Scan)
Funkcja **`perform_full_scan()`** zarządza sekwencyjnym odpytywaniem 19 kluczowych modułów pojazdu (Silnik, ABS, Airbag, Komfort itd.). Każdy moduł jest procesowany oddzielnie, a wyniki są strumieniowane na żywo do przeglądarki.

## 4. SCHEMAT PRZEPŁYWU DANYCH



1. **WEB UI** wysyła `CMD:REQ_FULL_SCAN`.
2. **Python** tworzy zadanie `perform_full_scan`.
3. **Python** wysyła ramkę `TX:200...` do **Arduino**.
4. **Arduino** pcha ramkę na fizyczny **CAN**.
5. **Auto** odpowiada, **Arduino** odsyła ramkę do **Pythona**.
6. **Python** parsuje odpowiedź i aktualizuje stan w **WEB UI**.

## 5. DIAGNOSTYKA I LOGI (SYS/ERR)
Skrypt generuje logi w standardzie projektu `MESSAGES.md`:
* `SYS:PY:BROWSER_CONNECTED` - Nowy użytkownik otworzył UI.
* `SYS:PY:SERIAL_READY` - Połączenie z Arduino ustanowione.
* `ERR:PY:SERIAL_LOST` - Fizyczne odłączenie Arduino od komputera.
* `SYS:PY:AUTO_SHUTDOWN` - Automatyczne zwolnienie portu COM.

---
**Uwaga**: Skrypt automatycznie ignoruje błędy dekodowania (`UnicodeDecodeError`), które mogą wystąpić przy fizycznym podłączaniu/odłączaniu kabla USB w trakcie pracy.