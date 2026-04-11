[ANALIZA GEMINI DEEP RESEARCH]

# **Kompleksowa Analiza Inżynieryjna Magistrali CAN i Implementacja Protokołu OSEK NM w Architekturze Volkswagen PQ35 dla Systemów Telemetrii Opartej na Mikrokontrolerach Arduino**

## **Architektura Sieciowa Platformy Volkswagen PQ35 i Rola Modułu Gateway**

Platforma PQ35, wprowadzona przez koncern Volkswagen w połowie pierwszej dekady XXI wieku, stanowi fundament technologiczny dla szerokiej gamy pojazdów, w tym modelu Golf Plus z 2006 roku. Systemy elektroniczne w tej architekturze opierają się na zaawansowanej komunikacji sieciowej, w której centralną rolę odgrywa moduł J533, znany jako Gateway lub brama sieciowa. Moduł ten pełni funkcję inteligentnego łącznika pomiędzy różnymi podsieciami Controller Area Network (CAN), które różnią się od siebie prędkością transmisji, charakterystyką fizyczną oraz priorytetami przesyłanych danych. W pojeździe Golf Plus 2006 struktura ta jest podzielona na trzy główne segmenty: magistralę napędową (CAN-Antrieb), magistralę komfortu (CAN-Komfort) oraz magistralę informacyjno-rozrywkową (CAN-Infotainment).  
Magistrala CAN-Antrieb operuje z wysoką prędkością 500 kbit/s, co jest podyktowane koniecznością przesyłania danych krytycznych czasowo, takich jak parametry pracy silnika, sterowanie układem hamulcowym ABS/ESP czy zarządzanie poduszkami powietrznymi. Z kolei magistrale CAN-Komfort i CAN-Infotainment pracują z prędkością 100 kbit/s i wykorzystują standard Low-Speed CAN, który charakteryzuje się wysoką odpornością na błędy fizyczne, w tym zdolnością do pracy w trybie jednoprzewodowym w przypadku zwarcia jednego z przewodów do masy lub przerwania ciągłości obwodu. Gateway J533 nie tylko przekazuje ramki między tymi światami, ale również filtruje ruch, zarządza uprawnieniami do diagnostyki oraz koordynuje procesy uśpienia i wybudzania poszczególnych sterowników. Zrozumienie tej hierarchii jest kluczowe dla inżyniera projektującego system odczytu danych za pomocą Arduino, gdyż fizyczne wpięcie się w niewłaściwą parę przewodów lub zastosowanie błędnej prędkości transmisji uniemożliwi jakąkolwiek komunikację.  
Specyfika magistrali Infotainment w modelu Golf Plus 2006 polega na obsłudze takich modułów jak radioodtwarzacz, system nawigacji, wzmacniacze dźwięku oraz interfejsy multimedialne. Kluczowym wyzwaniem w integracji zewnętrznego urządzenia, takiego jak komputer z Arduino, jest fakt, że Gateway monitoruje aktywność każdego węzła sieciowego. Jeśli urządzenie peryferyjne, które powinno być obecne w sieci (np. radio), przestaje nadawać lub nie uczestniczy w protokole zarządzania siecią, Gateway może zarejestrować błąd komunikacji i po pewnym czasie odciąć zasilanie logiki lub przejść w tryb uśpienia, co skutkuje przerwaniem strumienia danych telemetrii.

## **Teoretyczne Podstawy Protokołu OSEK NM w Grupie VAG**

Network Management (NM) w systemach Infotainment grupy Volkswagen opiera się na standardzie OSEK/VDX NM, który jest sformalizowanym mechanizmem koordynacji stanów pracy węzłów w sieci rozproszonej. Głównym celem tego protokołu jest zapewnienie, że magistrala pozostaje aktywna tak długo, jak przynajmniej jeden sterownik wymaga komunikacji, oraz umożliwienie skoordynowanego przejścia całego systemu w tryb niskiego poboru energii (Bus Sleep) w celu ochrony akumulatora. W architekturze PQ35 każdemu sterownikowi przypisany jest unikalny identyfikator Node ID, który determinuje jego adres w pierścieniu logicznym (Logical Ring).  
Pierścień logiczny jest mechanizmem, w którym token (ramka NM) jest przekazywany sekwencyjnie od jednego węzła do drugiego. Adresacja tych ramek odbywa się w zakresie 0x400 do 0x4FF, gdzie identyfikator konkretnej ramki oblicza się poprzez dodanie stałej 0x400 do Node ID sterownika. Przykładowo, Gateway o Node ID 0x2B nadaje ramki NM pod identyfikatorem 0x42B. Jeśli Arduino ma symulować obecność modułu radiowego, musi operować na identyfikatorze przypisanym fabrycznie dla radia (zazwyczaj 0x63, co daje ramkę 0x463) lub na wolnym identyfikatorze zaakceptowanym przez Gateway.  
Algorytm pracy pierścienia logicznego wymusza na każdym uczestniku aktywność. Kiedy węzeł otrzymuje ramkę NM, w której pierwszy bajt danych (Receiver ID) wskazuje na jego własny identyfikator, staje się on tymczasowym posiadaczem tokenu i jest zobowiązany do wysłania własnej ramki NM, wskazującej kolejnego następcę w pierścieniu. Czas pomiędzy odebraniem a wysłaniem ramki, a także interwały czasowe wysyłania ramek "Alive" przy dołączaniu do sieci, są ściśle zdefiniowane w specyfikacji OSEK, aby zminimalizować obciążenie magistrali przy jednoczesnym zachowaniu ciągłości monitorowania statusu węzłów.

### **Tabela 1: Główne Stany Pracy Węzła w Protokole OSEK NM**

| Stan | Opis Funkcjonalny | Zachowanie na Magistrali CAN |
| :---- | :---- | :---- |
| **NMOff** | Sterownik jest wyłączony lub w głębokim uśpieniu bez zasilania logiki. | Brak jakiejkolwiek transmisji i odbioru. |
| **NMReset** | Faza inicjalizacji po wybudzeniu lub resecie programowym. | Wysłanie ramki "Alive" w celu zgłoszenia obecności w sieci. |
| **NMNormal** | Standardowy tryb pracy w pierścieniu logicznym. | Odbiór ramek NM i przekazywanie tokenu do następcy. |
| **NMLimpHome** | Tryb awaryjny po wykryciu błędów konfiguracji lub braku następców. | Cykliczne wysyłanie ramek "Limp Home" informujących o błędzie. |
| **NMBusSleep** | Stan niskiego poboru energii, magistrala jest nieaktywna elektrycznie. | Węzeł nasłuchuje jedynie na impuls wybudzenia (WUP). |

## **Analiza Sygnałowa Ramki NM Gatewaya o ID 0x42B**

Ramka 0x42B jest jedną z najważniejszych ramek w systemie zarządzania siecią Infotainment platformy PQ35, ponieważ jej nadawcą jest brama sieciowa (Gateway J533), która de facto zarządza całym procesem komunikacji. Zgodnie z dokumentacją techniczną, ramka ta ma długość (DLC) wynoszącą 6 bajtów i posiada strukturę, którą inżynier musi dokładnie zdekodować, aby Arduino mogło poprawnie na nią odpowiedzieć.  
Struktura danych w ramce 0x42B przedstawia się następująco:

1. **Bajt 0: NMGW\_I\_Receiver (Adresat)**: Zawiera Node ID sterownika, do którego Gateway aktualnie kieruje token pierścienia logicznego. Jeśli Arduino ma utrzymać komunikację, musi monitorować ten bajt i reagować, gdy wartość w nim zawarta odpowiada identyfikatorowi, pod którym Arduino "przedstawia się" w sieci.  
2. **Bajt 1: NMGW\_I\_OpCode (Kod Operacji)**: Jest to pole bitowe definiujące typ wiadomości NM:  
   * **Bit 0 (CmdAlive)**: Jeśli ustawiony, ramka jest komunikatem o wejściu Gatewaya w stan aktywny.  
   * **Bit 1 (CmdRing)**: Najczęstszy stan, oznaczający normalne przekazywanie tokenu w pierścieniu.  
   * **Bit 2 (CmdLimpHome)**: Informuje o przejściu w tryb awaryjny z powodu braku odpowiedzi od innych węzłów.  
3. **Bajt 2: Flagi Statusu i Zarządzania Energią**:  
   * **Bit 4 (SleepInd)**: Indykacja uśpienia. Gateway ustawia ten bit, gdy warunki systemowe (np. wyłączony zapłon, brak aktywności użytkownika) pozwalają na uśpienie magistrali.  
   * **Bit 5 (SleepAck)**: Potwierdzenie uśpienia. Gdy wszystkie węzły zgłoszą chęć uśpienia, Gateway wysyła ten bit jako ostateczny rozkaz wyłączenia komunikacji.

W przykładach dostarczonych przez użytkownika widzimy dynamiczną zmianę stanów bramki sieciowej. Analiza tych konkretnych instancji pozwala na sformułowanie precyzyjnych schematów odpowiedzi.

### **Szczegółowa Interpretacja Przykładowych Logów 0x42B**

W pierwszym przypadku log wskazuje: 0x42B | 0B 02 80 02 00 00\. Pierwszy bajt danych to 0x0B, co w systemie dziesiętnym oznacza 11\. Gateway przesyła token do węzła o numerze 11\. Drugi bajt to 0x02, co oznacza aktywną flagę CmdRing. Jest to klasyczny scenariusz, w którym system działa poprawnie, a Gateway oczekuje, że węzeł 11 (czyli w tym przypadku nasze Arduino) przejmie token i przekaże go dalej.  
Drugi przypadek: 0x42B | 0B 04 00 00 00 00\. Tutaj bajt adresata pozostaje bez zmian (0x0B), ale kod operacji zmienia się na 0x04. Bit 2 jest ustawiony, co oznacza CmdLimpHome. Taka sytuacja sugeruje, że Gateway wykrył problem z topologią pierścienia logicznego – być może Arduino nie odpowiedziało na poprzednie zapytania wystarczająco szybko lub inny węzeł w sieci nagle zniknął. W tym stanie Gateway wysyła ramki z większą częstotliwością, próbując zidentyfikować aktywnych następców.  
Trzeci przypadek: 0x42B | 0B 14 00 00 00 00\. Wartość bajtu 1 wynosi 0x14, co binarnie odpowiada 00010100\. Oznacza to jednoczesne występowanie flagi CmdLimpHome (bit 2\) oraz SleepInd (bit 4). Gateway komunikuje węzłowi 11, że system nadal jest w trybie awaryjnym, ale jednocześnie brama jest gotowa do uśpienia magistrali Infotainment. Jest to krytyczny moment dla Arduino; jeśli urządzenie ma nadal odczytywać dane, musi w odpowiedzi zresetować flagę uśpienia w swoim własnym pakiecie NM, co wymusi na Gatewayu pozostanie w stanie aktywnym.

## **Schematy Odpowiedzi i Logika Utrzymania Komunikacji**

Aby Arduino mogło skutecznie "oszukać" Gateway i utrzymać magistralę w stanie aktywnym, musi ono implementować algorytm odpowiedzi zgodny z kierunkiem przepływu tokenu. Zakładając, że Arduino przyjmuje Node ID równy 0x0B (zgodnie z adresacją w bajcie 0 otrzymywanych ramek), jego własny identyfikator CAN dla ramek NM będzie wynosił 0x40B.

### **Tabela 2: Matryca Odpowiedzi Arduino na Ramki NM Gatewaya (0x42B)**

| Odebrano z 0x42B (HEX) | Stan Gateway | Wymagana Akcja Arduino | Ramka Odpowiedzi (ID: 0x40B) | Cel Akcji |
| :---- | :---- | :---- | :---- | :---- |
| 0B 02 XX XX XX XX | Normal Ring | Wyślij Ring do następcy | 2B 02 00 00 00 00 | Podtrzymanie pierścienia, token wraca do J533. |
| 0B 04 XX XX XX XX | Limp Home | Wyślij Alive | 2B 01 00 00 00 00 | Re-inicjalizacja obecności w sieci. |
| 0B 14 XX XX XX XX | Sleep Request | Odrzuć uśpienie | 2B 02 00 00 00 00 | Blokada przejścia w tryb Sleep, utrzymanie zasilania. |
| 0B 01 XX XX XX XX | New Node Alive | Dołącz do pierścienia | 2B 02 00 00 00 00 | Potwierdzenie udziału w nowej konfiguracji. |

W powyższych schematach pierwszy bajt danych wysyłany przez Arduino (0x2B) jest adresem następcy. W najprostszej konfiguracji, gdzie w sieci Infotainment aktywne są tylko Gateway i Arduino, token krąży bezpośrednio między nimi dwoma. Jeśli jednak w aucie zamontowane są inne aktywne moduły (np. fabryczny moduł Bluetooth lub wzmacniacz DSP), Arduino musi dynamicznie uczyć się struktury pierścienia. OSEK NM definiuje, że następcą węzła jest węzeł o najniższym Node ID wyższym od aktualnego; jeśli aktualny węzeł ma najwyższe ID w sieci, token wraca do węzła o najniższym ID.  
Kolejnym istotnym elementem jest obsługa bitów statusowych. Jeśli Gateway wysyła w bajcie 2 wartość 0x80 lub 0x02 (jak w przykładach użytkownika), są to dane specyficzne dla aplikacji VAG, często informujące o przyczynie wybudzenia (np. zacisk 15, kontakt drzwiowy). Arduino powinno w swoich odpowiedziach dążyć do zachowania bajtów 2-5 jako wyzerowanych, chyba że specyficzna funkcja wymaga zgłoszenia gotowości do uśpienia.

### **Uzupełnienie v03 (implementacja w repozytorium)**

W bieżącym szkicu `hardware/hardware.ino` (wersja **v03**) dodano przełączanie po Serialu (115200, linia zakończona Enter): **`MODE:KEEPALIVE`** — zachowanie jak wcześniejsza iteracja „zawsze utrzymuj pierścień”; **`MODE:SLEEP_COOP`** — w odpowiedzi **`0x40B`** kopiowane są z ramki Gatewaya **`0x42B`** bity **SleepInd** i **SleepAck** w **bajcie 1** (układ jak sygnały **NWM_Radio** w `id_ramek_tylko_radio.txt`, spójny z `mNM_Gateway_I`). Celem jest zbliżenie się do zgłaszania gotowości do snu bez rekompilacji; skutek na żywej magistrali zależy od pojazdu i pozostałych węzłów. Checklista testów i archiwum wersji: `logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`.

## **Fizyczna Warstwa Komunikacji i Dobór Komponentów Arduino**

Implementacja odczytu danych CAN w Volkswagenie Golf Plus 2006 wymaga precyzyjnego doboru sprzętu, ze względu na specyfikę magistrali Low-Speed (100 kbit/s). Standardowe moduły CAN dla Arduino, oparte na układzie MCP2515 połączonym z transiwerem TJA1050, są zaprojektowane dla magistral High-Speed (ISO 11898-2). Choć w warunkach laboratoryjnych TJA1050 potrafi odczytać dane z magistrali Low-Speed, nie jest to rozwiązanie zalecane do długotrwałej pracy w pojeździe.  
Idealnym rozwiązaniem jest zastosowanie transiwera dedykowanego do systemów Low-Speed Fault-Tolerant, takiego jak TJA1054 lub TJA1055. Układy te poprawnie obsługują poziomy napięć charakterystyczne dla CAN-Infotainment w PQ35: w stanie recesywnym napięcie na linii CAN-High wynosi około 0V, a na CAN-Low około 5V, co jest odwróceniem logiki znanej z magistral High-Speed (gdzie oba przewody mają ok. 2.5V). Niewłaściwy transiwer może powodować błędy typu "Bit Stuffing Error" lub "Form Error", co Gateway zinterpretuje jako usterkę fizyczną magistrali i odnotuje w ramce błędów 0x557.

### **Konfiguracja Kontrolera MCP2515 dla 100 kbit/s**

Większość bibliotek Arduino (np. mcp\_can.h autorstwa Cory'ego Fowlera) nie posiada domyślnej definicji dla prędkości 100 kbit/s przy częstotliwości kwarcu 8MHz lub 16MHz. Inżynier musi obliczyć wartości rejestrów CNF1, CNF2 i CNF3 kontrolera MCP2515. Przy kwarcu 8MHz, typowe ustawienia dla 100 kbps to:

* CNF1: 0x03 (Baud Rate Prescaler)  
* CNF2: 0xAC (Propagation Segment i Phase Segment 1\)  
* CNF3: 0x03 (Phase Segment 2\)

Błędna konfiguracja prędkości jest najczęstszą przyczyną braku odpowiedzi od Gatewaya. Należy również pamiętać o wyłączeniu rezystorów terminujących 120 Ohm na module Arduino, jeśli wpinamy się w istniejącą sieć, która jest już poprawnie terminowana przez fabryczne sterowniki.

## **Katalog Sygnałów i Danych Telemetrycznych w Platformie PQ35**

Po ustanowieniu stabilnego połączenia i obsłużeniu protokołu NM, Arduino zyskuje dostęp do ogromnej bazy danych przesyłanych cyklicznie przez Gateway i inne moduły. Na podstawie dostarczonej dokumentacji IDramek.txt, możliwe jest monitorowanie niemal każdego aspektu pracy pojazdu.

### **Dynamika Pojazdu i Parametry Napędu (Magistrala Odczytana przez Gateway)**

Gateway J533 agreguje kluczowe informacje z magistrali napędowej i udostępnia je na magistrali Infotainment, co pozwala na budowę zaawansowanych komputerów pokładowych.

* **Prędkość Pojazdu (ID 0x351, 0x527)**: Sygnał GW1\_FzgGeschw przesyłany jest w ramce 0x351. Wykorzystuje on 15 bitów (Bajt 1 i 2), a przelicznik fizyczny wynosi 0.01. Pozwala to na odczyt prędkości z precyzją do dwóch miejsc po przecinku w zakresie do 326 km/h. Wartości specjalne, takie jak 32742, wskazują na błąd czujnika prędkości ABS.  
* **Obroty Silnika (ID 0x35B)**: Sygnał GWM\_Motordrehzahl w ramce 0x35B zajmuje bity 8-23. Wzór fizyczny to Wartość \= Dane \\times 0.25. Jest to parametr kluczowy dla systemów typu "Shift-Light" lub logowania wydajności silnika.  
* **Temperatura Cieczy Chłodzącej (ID 0x35B)**: Sygnał GWM\_KuehlmittelTemp (bity 24-31). Formuła przeliczania to T \= (Dane \\times 0.75) \- 48\. Zakres pomiarowy od \-47 do 142 stopni Celsjusza umożliwia precyzyjne monitorowanie fazy rozgrzewania silnika.

### **Zarządzanie Komfortem i Interfejs Użytkownika**

Platforma PQ35 umożliwia odczyt stanu wszystkich fizycznych przełączników w kabinie, co otwiera drogę do automatyzacji oświetlenia czy sterowania dodatkowymi urządzeniami.

* **Status Drzwi i Zamków (ID 0x291, 0x470)**: Ramka 0x291 (mZKE\_1) informuje o stanie ryglowania drzwi, natomiast ramka 0x470 (mBSG\_Kombi) dostarcza surowych danych z krańcówek drzwi (FT, BT, HL, HR), maski silnika (MH) oraz klapy bagażnika (HD).  
* **Manetka Komputera Pokładowego (ID 0x2C1)**: Ramka mLSM\_1 przesyła stan przycisków na manetce wycieraczek. Sygnały LS1\_BC\_Down\_Cursor (bit 20\) i LS1\_BC\_Up\_Cursor (bit 21\) mogą być przechwytywane przez Arduino do sterowania własnym menu wyświetlanym na ekranie komputera podłączonego do mikrokontrolera.  
* **Oświetlenie i Dimmowanie (ID 0x635)**: Ramka mDimmung przesyła informację o jasności podświetlenia deski rozdzielczej (Klemme 58d). Sygnał DI1\_Display w bajcie 0 (0-100%) pozwala na automatyczną synchronizację jasności zewnętrznego ekranu LCD podłączonego do Arduino z resztą instrumentów w aucie.

### **Tabela 3: Wykaz Kluczowych Ramek Danych dla Golf Plus 2006 (Infotainment/Komfort)**

| ID (Hex) | Nazwa Ramki | DLC | Kluczowe Sygnały | Przykładowe Zastosowanie |
| :---- | :---- | :---- | :---- | :---- |
| **0x151** | mAirbag\_1 | 4 | Crash status, Pas kierowcy/pasażera | Bezpieczeństwo, e-Call |
| **0x291** | mZKE\_1 | 5 | Pilot RF, ryglowanie drzwi | Automatyka domowa |
| **0x2C1** | mLSM\_1 | 6 | Kierunkowskazy, manetka BC, klakson | Sterowanie multimediami |
| **0x2C3** | mZAS\_Status | 1 | Zacisk 15, zacisk S, rozrusznik | Logika zasilania Arduino |
| **0x351** | mGateway\_1 | 8 | Prędkość pojazdu, światło wsteczne | HUD, kamera cofania |
| **0x35B** | mGW\_Motor | 8 | RPM, Temp cieczy, Sprzęgło, Hamulec | Sportowa telemetria |
| **0x3E1** | mClima\_1 | 8 | Stan klimatyzacji, obciążenie kompresora | Diagnostyka AC |
| **0x3E3** | mClima\_2 | 8 | Temp wnętrza, nasłonecznienie | Inteligentna wentylacja |
| **0x470** | mBSG\_Kombi | 8 | Kontrolki, stan klap, napięcie akumulatora | Monitoring zdrowia pojazdu |
| **0x621** | mKombi\_K1 | 7 | Poziom paliwa (litry), hamulec ręczny | Logowanie tankowań |

## **Zaawansowana Interakcja z Zestawem Wskaźników (MFA/FIS)**

Jednym z najbardziej pożądanych celów projektów opartych na Arduino w grupie VAG jest możliwość wyświetlania własnych komunikatów tekstowych na wyświetlaczu między zegarami (MFA \- Multi-Funktions-Anzeige). W Golfie Plus z 2006 roku komunikacja ta odbywa się za pośrednictwem ramek sterujących wyświetlaczem, głównie pod ID 0x62F.

### **Protokół DDP (Display-Daten-Protokoll)**

W starszych modelach platformy PQ35 (do ok. 2008 roku) wykorzystywany jest protokół DDP. Ramka 0x62F (mDisplay\_1) pełni rolę koordynatora. Sygnał DY1\_Display\_OK (bit 0\) informuje Arduino, czy wyświetlacz jest gotowy do przyjęcia danych. Wyświetlanie tekstu odbywa się poprzez wysyłanie sekwencji ramek pod specyficznymi identyfikatorami (np. 0x261 dla pierwszej linii tekstu, 0x263 dla drugiej), gdzie dane są kodowane w standardzie ASCII.  
Aby pomyślnie wyświetlić tekst, Arduino musi:

1. Utrzymać sesję NM, aby Gateway nie wyłączył magistrali Infotainment.  
2. Wysłać ramkę żądania priorytetu dla danego obszaru wyświetlacza (np. obszar Audio lub Nawigacja). 3\. Cyklicznie nadawać ramki z treścią ASCII, dbając o to, by nie kolidować z fabrycznymi komunikatami (np. ostrzeżeniami o braku płynu do spryskiwaczy z ramki 0x621).

## **Diagnostyka Komunikacji i Interpretacja Błędów Sieciowych**

Praca z magistralą CAN w samochodzie niesie ze sobą ryzyko zakłócenia pracy krytycznych systemów. Gateway J533 w sposób ciągły monitoruje poprawność ramek i obecność sterowników, raportując błędy w ramce 0x557 (mKD\_Error).

### **Ramka Błędów 0x557 – Przewodnik Diagnostyczny**

Jeśli po podłączeniu Arduino na zestawie wskaźników pojawią się kontrolki błędu (np. ABS, poduszki powietrzne), inżynier powinien przeanalizować bity w ramce 0x557:

* **Bit 0 (EKD\_Motor\_A)**: Błąd komunikacji z silnikiem. Może wystąpić, jeśli Arduino przypadkowo wyśle ramkę z ID kolidującym z ECU silnika.  
* **Bit 35 (EKD\_Gateway\_K)**: Ogólny błąd Gatewaya. Często oznacza przeciążenie magistrali (Bus Load \> 80%) spowodowane zbyt częstym nadawaniem ramek przez Arduino.  
* **Bit 62 (EKD\_Radio\_I)**: Błąd komunikacji z radiem. Jeśli Arduino próbuje symulować radio, ale robi to niepoprawnie (np. błędy w protokole NM), Gateway ustawi ten bit, co może skutkować brakiem sterowania z kierownicy multimedialnej.

### **Problemy Elektryczne i Warstwa Fizyczna**

Analiza sygnałów za pomocą oscyloskopu lub multimetru jest niezbędna w przypadku całkowitego braku komunikacji. W magistrali Low-Speed CAN (Infotainment) napięcia spoczynkowe są kluczowe:

* Jeśli napięcie na CAN-Low wynosi 0V zamiast 5V, oznacza to zwarcie do masy lub uszkodzenie transiwera w jednym z węzłów.  
* Jeśli napięcie na obu liniach wynosi 2.5V, magistrala może pracować w trybie High-Speed, co jest błędem konfiguracyjnym w tej części instalacji pojazdu.

Pojazd Golf Plus 2006 jest również wyposażony w system "Single Wire Operation". Jeśli jeden z przewodów CAN zostanie przerwany, Gateway przechodzi w tryb awaryjny, zwiększając napięcie sygnału na pozostałym przewodzie, aby umożliwić dokończenie transmisji. Arduino z prostym transiwerem TJA1050 nie poradzi sobie z odczytem danych w tym trybie.

## **Zarządzanie Energią i Ochrona Akumulatora**

Jednym z najpoważniejszych ryzyk związanych z pozostawieniem Arduino wpiętego do magistrali CAN jest rozładowanie akumulatora pojazdu. W platformie PQ35 magistrala Infotainment jest zasilana z zacisku 30 (stały plus), co oznacza, że sterowniki są pod napięciem nawet po wyjęciu kluczyka. O tym, czy sterowniki przejdą w tryb uśpienia, decyduje wyłącznie brak aktywności w protokole NM.

### **Procedura Bezpiecznego Uśpienia**

Jeśli Arduino będzie stale odpowiadać na ramki 0x42B z Gatewaya, przesyłając token pierścienia logicznego, Gateway uzna, że system multimedialny jest nadal potrzebny użytkownikowi i nie wyłączy zasilania magistrali. Może to generować pobór prądu na poziomie 1-2 Amperów przez wszystkie wybudzone moduły.  
Prawidłowy algorytm dla Arduino powinien monitorować ramkę 0x2C3 (mZAS\_Status):

1. Gdy bit ZS1\_ZAS\_Kl\_S zmieni wartość na 0 (kluczyk wyjęty), Arduino powinno wysłać ramkę NM (0x40B) z ustawionym bitem SleepInd (bit 4 w bajcie 1).  
2. Arduino musi przestać wysyłać jakiekolwiek inne ramki danych aplikacyjnych.  
3. Po odebraniu z Gatewaya ramki 0x42B z ustawionym bitem SleepAck (bit 5 w bajcie 1), Arduino powinno przełączyć własny kontroler CAN w tryb uśpienia (MCP\_SLEEP) i przejść w stan Power Down.

Wybudzenie systemu następuje automatycznie przez Gateway, gdy użytkownik np. otworzy drzwi (ramka 0x291) lub naciśnie przycisk na pilocie. Moduł MCP2515 posiada pin przerwania (INT), który może wybudzić Arduino z głębokiego snu po wykryciu aktywności na liniach CAN.

## **Przykładowa Implementacja Programowa dla Arduino (C++)**

Poniżej przedstawiono szkielet programu realizującego opisaną logikę odpowiedzi na ramkę NM 0x42B oraz odczyt podstawowej telemetrii. Wykorzystano bibliotekę mcp\_can.h.  
`#include <mcp_can.h>`  
`#include <SPI.h>`

`// Definicje specyficzne dla platformy PQ35 Infotainment`  
`const int SPI_CS_PIN = 10;`  
`const int CAN_INT_PIN = 2;`  
`const long NM_GATEWAY_ID = 0x42B;`  
`const long NM_ARDUINO_ID = 0x40B; // Zakładamy Node ID = 0x0B`  
`const int NEXT_NODE_ID = 0x2B;   // Powrót do Gateway`

`MCP_CAN CAN(SPI_CS_PIN);`

`void setup() {`  
    `Serial.begin(115200);`  
      
    `// Inicjalizacja dla Low-Speed CAN 100k`  
    `// Uwaga: Parametry CNF zależą od częstotliwości kwarcu modułu!`  
    `if(CAN.begin(MCP_ANY, CAN_100KBPS, MCP_8MHZ) == CAN_OK) {`  
        `Serial.println("CAN Infotainment Initialized 100kbps");`  
    `} else {`  
        `Serial.println("Initialization Failed");`  
        `while(1);`  
    `}`  
      
    `CAN.setMode(MCP_NORMAL);`  
    `pinMode(CAN_INT_PIN, INPUT);`  
`}`

`void loop() {`  
    `if(!digitalRead(CAN_INT_PIN)) {`  
        `long rxId;`  
        `unsigned char len = 0;`  
        `unsigned char rxBuf;`

        `CAN.readMsgBuf(&rxId, &len, rxBuf);`

        `// Obsługa protokołu NM dla ID 0x42B`  
        `if(rxId == NM_GATEWAY_ID) {`  
            `handleNetworkManagement(rxBuf);`  
        `}`

        `// Przykład odczytu obrotów silnika (ID 0x35B)`  
        `if(rxId == 0x35B) {`  
            `unsigned int rawRpm = (rxBuf << 8) | rxBuf;`  
            `float realRpm = rawRpm * 0.25;`  
            `Serial.print("RPM: ");`  
            `Serial.println(realRpm);`  
        `}`  
    `}`  
`}`

`void handleNetworkManagement(unsigned char* buf) {`  
    `// Sprawdź czy token jest kierowany do nas (Bajt 0 == 0x0B)`  
    `if(buf == 0x0B) {`  
        `unsigned char txBuf = {0};`  
        `txBuf = NEXT_NODE_ID; // Przekaż do Gateway`  
          
        `// Analiza kodu operacji (Bajt 1)`  
        `if(buf & 0x04) { // Wykryto Limp Home`  
            `txBuf = 0x01; // Odpowiedz Alive, aby odbudować pierścień`  
            `Serial.println("NM: Responding to LimpHome with Alive");`  
        `} else {`  
            `txBuf = 0x02; // Standardowy Ring Message`  
        `}`  
          
        `// Wysyłanie odpowiedzi NM`  
        `CAN.sendMsgBuf(NM_ARDUINO_ID, 0, 6, txBuf);`  
    `}`  
`}`

## **Zależności Między Parametrami a Diagnostyka Systemowa (Wnioski Inżynieryjne)**

Analiza danych z platformy PQ35 pozwala na wyciągnięcie wniosków wykraczających poza prosty odczyt wartości. Systemy te są ze sobą ściśle powiązane przyczynowo-skutkowo. Na przykład, monitorowanie sygnału AB1\_CrashStaerke z ramki 0x151 w połączeniu z GWM\_Bremslicht\_Schalter z ramki 0x35B pozwala Arduino na odróżnienie gwałtownego hamowania (brak sygnału crash, wysokie ciśnienie hamowania) od rzeczywistej kolizji (sygnał crash obecny).  
Innym przykładem jest korelacja między ramką 0x3E1 (klimatyzacja) a 0x35B (silnik). Sygnał CL1\_Drehzahlanhebung informuje o żądaniu podniesienia obrotów biegu jałowego przez sterownik Climatronic w celu zwiększenia wydajności kompresora lub alternatora. Arduino odczytujące te dane może przewidzieć zmianę zachowania silnika, co jest istotne przy tuningu lub diagnostyce spadków mocy.  
Również systemy oświetlenia w ramce 0x470 dostarczają cennych informacji o zdrowiu elektrycznym pojazdu. Sygnał BSK\_Ruhespannung przesyła napięcie spoczynkowe akumulatora z dokładnością do 0.1V. Jest to kluczowy parametr dla algorytmu uśpienia Arduino – jeśli napięcie spadnie poniżej progu 11.8V, Arduino powinno natychmiast wyłączyć swój udział w pierścieniu NM i pozwolić Gatewayowi na uśpienie magistrali, nawet jeśli zapłon jest nadal włączony (np. w trybie akcesoriów).

## **Podsumowanie i Rekomendacje**

Implementacja systemu opartego na Arduino w Volkswagenie Golf Plus 2006 wymaga rygorystycznego podejścia do protokołu OSEK NM oraz zrozumienia fizyki magistrali Low-Speed CAN.

1. **Reakcja na ID 0x42B**: Arduino musi traktować ramkę 0x42B jako sygnał do działania. Odpowiedź pod ID 0x40B z danymi kierującymi token z powrotem do Gatewaya (0x2B w bajcie 0\) jest niezbędna do podtrzymania sesji komunikacyjnej. W stanach LimpHome (0x04) należy wysyłać flagę Alive (0x01), a w stanach normalnych Ring (0x02).  
2. **Konfiguracja Sprzętowa**: Zaleca się stosowanie modułów MCP2515 z transiwerami Fault-Tolerant (np. TJA1055) i precyzyjne ustawienie prędkości 100 kbit/s. Użycie standardowych modułów 500k/HS CAN doprowadzi do błędów elektrycznych w sieci pojazdu. 3\. **Integracja Danych**: Wykorzystanie bogatego słownika sygnałów (prędkość 0.01 km/h, RPM 0.25, temperatury ze skalami offsetowymi) pozwala na budowę narzędzia o klasie profesjonalnego skanera diagnostycznego.  
3. **Bezpieczeństwo Energetyczne**: Monitorowanie statusu stacyjki (0x2C3) i napięcia akumulatora (0x470) jest obligatoryjne dla uniknięcia unieruchomienia pojazdu z powodu rozładowania akumulatora.

Prawidłowo zaprojektowany system nie tylko dostarczy precyzyjnych danych na komputer, ale będzie całkowicie przezroczysty dla fabrycznej diagnostyki VAG (VCDS/ODIS), nie generując błędów w ramce 0x557.

## **Uwaga: firmware w repozytorium (`hardware/hardware.ino`)**

Dla spójności z **rzeczywistymi definicjami sygnałów** (w tym bitów w bajcie 1 ramki `0x42B`) obowiązuje plik **`data/id_ramek.txt`** (ramka `mNM_Gateway_I`), a nie wyłącznie opisy w tym dokumencie.

W projekcie (aktualnie **v04 Auto-NM**) zastosowano strategię **sleep-first**:

- **Maszyna stanów sieci**: `NET_SLEEP`, `NET_ACTIVE`, `NET_GRACE`, `NET_SLEEP_READY` — przejścia przy `SYS:CAN:WAKE_START` / `WAKE_END`, zboczu `SleepInd` i timerach.
- **Automat NM (bez komend `MODE:*`)**: `AUTO_ACTIVE`, `AUTO_SLEEP_PREP`, `AUTO_SILENT_LISTEN`.
- **NM (`0x40B`)**:
  - `AUTO_ACTIVE`: odpowiedź na token do `0x0B` (stabilna komunikacja),
  - `AUTO_SLEEP_PREP`: odpowiedzi tylko dla ramek związanych ze snem (`SleepInd`/`SleepAck`),
  - `AUTO_SILENT_LISTEN`: celowe milczenie (bez sztucznego trzymania pierścienia).
- **Ramka aplikacyjna `0x661`**: nadawana tylko w `NET_ACTIVE`.

**Konsekwencja dla walidacji:** bramą sukcesu jest teraz Test A (`sleep-path`) na logu z podłączonym Arduino. Dopiero po przejściu tej bramy interpretujemy Test B/C jako wynik produktowy (nie tylko regresję techniczną). Szczegóły i aktualny status: **`logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`**.

Checklista testów A/B/C: **`logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`** (kanoniczna kopia przy logach; skrypt: `scripts/validate_nm_serial_log.py`).

Archiwum ponumerowanych szkiców przy logach: **`hardware_v01_aba4daa__tests-1-4.ino`**, **`hardware_v02_nm_netstate_plan.ino`**, **`hardware_v03_serial_modes_sleep_coop.ino`** i **`hardware_v04_auto_nm_sleep_gate.ino`** w `logs/2026-04-11/`.

#### **Cytowane prace**

1\. ssp269 Data transfer on CAN data bus II \- VolksPage.Net, https://www.volkspage.net/technik/ssp/ssp/SSP\_269\_d1.pdf 2\. Understanding Volkswagen CAN Bus System | PDF | Data Transmission \- Scribd, https://www.scribd.com/presentation/178559027/Spho-Vw-Can-Data-Bus-Int 3\. Data Exchange On The CAN Bus I \- VolksPage.Net, https://www.volkspage.net/technik/ssp/ssp/SSP\_238.pdf 4\. Trying to understand VW CAN gateway behaviour : r/CarHacking \- Reddit, https://www.reddit.com/r/CarHacking/comments/1h4pmnw/trying\_to\_understand\_vw\_can\_gateway\_behaviour/ 5\. CAN BUS Troubleshooting Guide (with Video) \- Enovation Controls Help Center, https://support.enovationcontrols.com/hc/en-us/articles/360038856494-CAN-BUS-Troubleshooting-Guide-with-Video 6\. CAN Gateway Highline for VW PQ35 \- kufatec, https://kufatec.com/en/can-gateway-highline-for-vw-pq35/37816 7\. CAN BUS Shield \+ Arduino UNO \+ VW Golf \- Seeed Studio Forum, https://forum.seeedstudio.com/t/can-bus-shield-arduino-uno-vw-golf/18102 8\. Hacking the Volkswagen CAN-Comfort Bus \- Showcase \- Arduino Forum, https://forum.arduino.cc/t/hacking-the-volkswagen-can-comfort-bus/59257 9\. AUTOSAR CAN Network Management Overview | PDF \- Scribd, https://www.scribd.com/document/735273879/CAN-NETWORK-MANAGEMENT 10\. How to read vw can bus \- General Discussion \- Macchina, https://forum.macchina.cc/t/how-to-read-vw-can-bus/655 11\. How To: Deactivate Component Protection From Your VW Radio Via ODIS \- YouTube, https://www.youtube.com/watch?v=dvJweDBXgpw 12\. android Car radio Canbus Box Decoder For VW Golf 5/6/Polo/Passat/Jetta/Tiguan 16 pin Wiring Harness Plug Power Cable \- AliExpress, https://www.aliexpress.com/i/1005006160895259.html 13\. For VW Golf Jetta Polo Caddy PQ35 Canbus Decoder Cable Quadlock Wiring Harness SWC Retention 16 Pin Adapter for Android Radio \- AliExpress, https://www.aliexpress.com/i/1005010651157634.html 14\. NM \- OSEK VDX Portal, https://www.osek-vdx.org/osekvdx\_nm.html 15\. Network Management Concept and Application Programming Interface \- osek-vdx.org, https://www.osek-vdx.org/mirror/oseknm25.pdf 16\. Network Management v2.5.3 \- OSEK VDX Portal, https://www.osek-vdx.org/mirror/nm253.pdf 17\. Popular Science Series: Comparison of AUTOSAR and OSEK Network Management (Part 1\) \- EEWORLD, https://en.eeworld.com.cn/news/qrs/eic654946.html 18\. NETWORK MANAGEMENT – PART 2: OSEK – CAN Bus Hacking | Vehicle Cyber Security | Fuel Reclamation | Reverse Engineering, https://canbushack.com/web/network-management-part-2-osek/ 19\. Reading data from CAN bus volkswagen | Page 2 \- Teensy Forum, https://forum.pjrc.com/index.php?threads/reading-data-from-can-bus-volkswagen.63063/page-2 20\. OSEK/VDX NM, https://www.osek-vdx.org/mirror/nm252.pdf 21\. OSEK/VDX-based Dynamic Network Management on Automotive Network \- ResearchGate, https://www.researchgate.net/publication/224501466\_OSEKVDX-based\_Dynamic\_Network\_Management\_on\_Automotive\_Network 22\. OSEK/VDX Network Management Concept and Application Programming Interface \- Qiita, https://qiita.com/kaizen\_nagoya/items/bfc78c65d544525da6be 23\. Arduino R4 Minima CAN bus delay required between sending messages, https://forum.arduino.cc/t/arduino-r4-minima-can-bus-delay-required-between-sending-messages/1432836 24\. Introduction to CAN-BUS and How to use it with Arduino\[2025\] \- Seeed Studio, https://www.seeedstudio.com/blog/2019/11/27/introduction-to-can-bus-and-how-to-use-it-with-arduino/ 25\. CAN Bus Errors Explained \- A Simple Intro \[2025\] \- CSS Electronics, https://www.csselectronics.com/pages/can-bus-errors-intro-tutorial 26\. Writing message on VW infotainment bus \- General Guidance \- Arduino Forum, https://forum.arduino.cc/t/writing-message-on-vw-infotainment-bus/512631 27\. Sending canbusmessage to sleeping node \- Programming \- Arduino Forum, https://forum.arduino.cc/t/sending-canbusmessage-to-sleeping-node/1265140 28\. VW PQ35 requesting data from other CAN buses : r/CarHacking \- Reddit, https://www.reddit.com/r/CarHacking/comments/1afgptr/vw\_pq35\_requesting\_data\_from\_other\_can\_buses/ 29\. parse\_can\_logs/VW CAN IDs Summary.md at master \- GitHub, https://github.com/v-ivanyshyn/parse\_can\_logs/blob/master/VW%20CAN%20IDs%20Summary.md 30\. VW CanBus decoding \- General Guidance \- Arduino Forum, https://forum.arduino.cc/t/vw-canbus-decoding/406342 31\. Digital Speedometer to Car's Instrument Cluster via CAN Bus \- Arduino Project Hub, https://projecthub.arduino.cc/databus100/digital-speedometer-to-cars-instrument-cluster-via-can-bus-9ee5ca 32\. X70P-Electrical Manual | PDF | Air Conditioning | Temperature \- Scribd, https://www.scribd.com/document/793888767/X70P-Electrical-manual 33\. Finding CAN Bus Faults With Multimeter | CAN Bus Diagnostics | Mechanic Mindset, https://www.youtube.com/watch?v=W-e7eT91DrQ 34\. best way to keep arduino powered in car when car is off, https://forum.arduino.cc/t/best-way-to-keep-arduino-powered-in-car-when-car-is-off/180414 35\. Arduino \+ CANBUS Shield: Sleep/standby and wake up through CANBUS signal?, https://forum.arduino.cc/t/arduino-canbus-shield-sleep-standby-and-wake-up-through-canbus-signal/908378 36\. CAN bus arduino freeze after sleep \- Programming, https://forum.arduino.cc/t/can-bus-arduino-freeze-after-sleep/939764