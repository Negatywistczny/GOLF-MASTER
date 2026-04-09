# DOKUMENTACJA FOLDERU DATA (KNOWLEDGE BASE) - GOLF MASTER

## 1. ROLA W SYSTEMIE
Folder `/data` stanowi bazę wiedzy protokołu CAN dla platformy VAG PQ35. Przechowywane są tutaj definicje ramek, sygnałów oraz narzędzia do ich wybiórczego eksportowania. Jest to "słownik", na podstawie którego powstała logika dekodująca w `script.js`.

## 2. ZAWARTOŚĆ I PLIKI

### A. Główna Baza Danych (DBC)
* **`PQ35_46_ICAN_V3_6_9_F_20081104_ASR_V1_2.dbc`**
    * **Opis:** Oficjalny plik bazy danych CAN w formacie wektorowym. 
    * **Znaczenie:** Jest to "Single Source of Truth" (Jedyne Źródło Prawdy). Zawiera matematyczne opisy wszystkich sygnałów (startbity, długości, mnożniki, offsety) dla magistrali Infotainment.

### B. Wyciągi i Dokumentacja Tekstowa
Te pliki to czytelne dla człowieka (Human-Readable) wersje bazy DBC, ułatwiające szybkie sprawdzanie ID bez otwierania specjalistycznych narzędzi:
* **`IDramek.txt`**: Pełny opis sygnałów dla kluczowych ramek (np. VIN, Airbag, Gateway). Zawiera tablice wartości (Value Tables), czyli opisy co oznacza np. bit 0, a co bit 1.
* **`IDramek-tylko-radio.txt`**: Skondensowana lista sygnałów dotyczących wyłącznie jednostki multimedialnej, komunikatów BAP i audio.
* **`ID_po_adresach.txt`**: Lista wszystkich ramek pogrupowana według końcówek adresów (standard OSEK NM), co ułatwia identyfikację modułów na ringu.
* **`ID_po_adresach_tylko_pq35.txt`**: Specyficzna lista ramek nadawanych wyłącznie przez Gateway w architekturze PQ35.

### C. Narzędzia (Tools)
* **`info_o_ramce.py`**
    * **Opis:** Skrypt pomocniczy napisany w Pythonie, korzystający z biblioteki `cantools`.
    * **Funkcja:** Pozwala błyskawicznie wyciągnąć szczegółowe informacje o dowolnej ramce z pliku DBC. Wystarczy wpisać nazwę ramki (np. `BAP_AUDIO`), aby otrzymać pełną strukturę bitową w konsoli.

## 3. PRZEPŁYW PRACY (WORKFLOW)
Jeśli chcesz dodać nowy wskaźnik do Dashboardu (Web UI):
1. Szukasz nazwy interesującej Cię funkcji w `ID_po_adresach.txt`.
2. Używasz `info_o_ramce.py` lub zaglądasz do `IDramek.txt`, aby poznać **StartBit** i **Długość (Length)** sygnału.
3. Kopiujesz te parametry do słownika w `script.js` w folderze `/web_ui`.

## 4. UWAGI TECHNICZNE
* Wszystkie definicje w tej bazie oparte są o kolejność bajtów **Intel (Little-endian)**, która jest standardem dla platformy PQ35.
* Sygnały takie jak **VIN** (ID `0x65F`) wykorzystują system **Multipleksera**, co oznacza, że zawartość ramki zmienia się w zależności od wartości bajtu sterującego (Counter/Index).
