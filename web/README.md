# DOKUMENTACJA SMART UI (WEB INTERFACE) - GOLF MASTER

## 1. ROLA W SYSTEMIE
Folder `web_ui` zawiera kompletną warstwę prezentacji danych. Jest to responsywna aplikacja typu **Single Page Application (SPA)**, napisana w czystym języku JavaScript (Vanilla JS), która wizualizuje surowy strumień danych CAN na czytelne wskaźniki, tabele błędów i interaktywne wykresy.

## 2. TECHNOLOGIE
* **HTML5 & CSS3**: Struktura i nowoczesny, ciemny motyw "VW-Blue".
* **Vanilla JavaScript**: Logika przetwarzania sygnałów (bez zewnętrznych frameworków).
* **WebSockets API**: Komunikacja w czasie rzeczywistym z mostkiem Python.

## 3. ARCHITEKTURA I FUNKCJE

### A. Silnik Dekodujący (CAN Decoder)
Serce interfejsu stanowi funkcja `extractCANSignal()`. Obsługuje ona standard **Intel (Little-Endian)** stosowany w grupie VAG:
* Wycina określoną liczbę bitów z dowolnego miejsca ramki.
* Nakłada mnożniki (Multiplier) i przesunięcia (Offset).
* Obsługuje liczby ujemne (Uzupełnienie do dwóch).

### B. Dynamiczny Dashboard
Interfejs automatycznie tworzy "kafelki" dla każdej wykrytej ramki CAN. Są one segregowane do odpowiednich stref:
* **NAPĘD I ZASILANIE**: Silnik, Skrzynia, ABS, Akumulator.
* **KOMFORT I NADWOZIE**: Klimatyzacja, Drzwi, Centralny Zamek, Manetki.
* **MULTIMEDIA I INFO**: Licznik, MFA, Czas, Jednostki.
* **SYSTEM I DIAGNOSTYKA**: Gateway, Lista modułów, VIN, Błędy.

### C. Narzędzia Diagnostyczne
* **🛠️ SKANUJ DTC**: Wysyła do Pythona polecenie `CMD:REQ_FULL_SCAN`, inicjując diagnostykę wszystkich sterowników przez protokół TP 2.0.
* **📸 SNAPSHOT**: Eksportuje aktualny stan wszystkich zdekodowanych sygnałów w aucie do pliku **CSV** (kompatybilne z Excel).
* **📝 ZAPISZ LOGI**: Pobiera pełną zawartość terminala LIVE do pliku tekstowego.
* **📟 TERMINAL LIVE**: Podgląd surowych ramek w czasie rzeczywistym z historią do 5000 linii.

## 4. DEKODOWANIE SPECJALISTYCZNE
Interfejs posiada wbudowane dedykowane dekodery dla kluczowych ramek PQ35:
* **0x65F (VIN)**: Składa numer nadwozia z 3-etapowego multipleksera (MUX).
* **0x557 (Błędy)**: Monitoruje bity błędów 62 modułów jednocześnie.
* **0x3C3 (Kąt Skrętu)**: Przelicza wartości na stopnie z uwzględnieniem kierunku (Lewo/Prawo).
* **0x42B (OSEK)**: Wizualizuje stan uśpienia i przyczyny wybudzenia magistrali.

## 5. INSTRUKCJA URUCHOMIENIA
1. Upewnij się, że `bridge.py` jest uruchomiony i połączony z Arduino.
2. Otwórz plik `index.html` w dowolnej nowoczesnej przeglądarce (Chrome/Edge/Firefox).
3. Status połączenia zostanie zasygnalizowany zielonym paskiem w sekcji "LIVE".

---
**Wskazówka**: Kliknięcie w dowolny kafelek na dashboardzie otwiera **okno modalne** z listą wszystkich surowych sygnałów zawartych w danej ramce CAN.
