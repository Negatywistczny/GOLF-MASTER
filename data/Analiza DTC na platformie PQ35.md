[Analiza Deep Research Gemini Pro]

# **Architektura i procesy analizy błędów DTC na platformie Volkswagen PQ35**

Platforma Volkswagen PQ35, wprowadzona na początku XXI wieku jako fundament dla modeli takich jak Golf V, Audi A3 (8P) czy Skoda Octavia II, stanowiła punkt zwrotny w projektowaniu systemów elektronicznych pojazdów grupy VAG.1 Przejście z prostych struktur opartych na linii K na zaawansowane, wielopoziomowe sieci magistral CAN wymusiło całkowitą redefinicję sposobu, w jaki pojazd identyfikuje, przechowuje i komunikuje usterki, znane jako kody błędów DTC (Diagnostic Trouble Codes).1 System ten nie jest jedynie zbiorem cyfrowych etykiet, lecz złożonym ekosystemem obejmującym warstwy fizyczne komunikacji, protokoły transportowe takie jak TP 2.0 oraz warstwy aplikacji diagnostycznych KWP2000 i UDS.2

## **Architektura sieciowa i centralna rola interfejsu J533**

Analiza błędów DTC na platformie PQ35 rozpoczyna się od zrozumienia topologii sieci, w której kluczową rolę odgrywa moduł J533, powszechnie nazywany Gatewayem.5 W architekturze PQ35 elektronika nie jest połączona jedną wspólną magistralą, lecz podzielona na odizolowane sub-sieci o różnej charakterystyce fizycznej i priorytetach transmisji.1

### **Topologia magistral danych CAN**

W pojeździe opartym na platformie PQ35 występuje kilka głównych magistral CAN, które spotykają się w module Gateway J533. Jest on odpowiedzialny za przekazywanie wiadomości (routing) między tymi sieciami oraz za pośredniczenie w komunikacji z zewnętrznym testerem diagnostycznym.5

| Nazwa Magistrali CAN | Prędkość | Charakterystyka Fizyczna | Główne Moduły Sterujące |
| :---- | :---- | :---- | :---- |
| CAN-Napęd (Drivetrain) | 500 kBit/s | High-Speed, odporna na błędy | Silnik (0x01), Skrzynia biegów (0x02), ABS/ESP (0x03) |
| CAN-Komfort (Convenience) | 100 kBit/s | Low-Speed, dwuprzewodowa | Moduł komfortu (0x46), Drzwi (0x42), Klimatyzacja (0x08) |
| CAN-Infotainment | 100 kBit/s | Low-Speed, multimedialna | Radio (0x56), Nawigacja (0x37), Wzmacniacz (0x47) |
| CAN-Diagnostyka | 500 kBit/s | Dedykowana linia do OBD | Gateway (0x19), bezpośrednie wyjście na gniazdo |

Źródło: 1

Gateway J533 monitoruje status wszystkich modułów w sieci. W blokach pomiarowych sterownika 0x19 można odczytać status komunikacji każdego zadeklarowanego urządzenia.7 Jeśli sterownik nie wysyła ramek w określonym czasie, Gateway generuje błąd DTC o braku komunikacji, co jest kluczowe dla diagnostyki problemów z magistralą danych.6

### **Mechanizm routingu diagnostycznego**

Kiedy tester diagnostyczny (np. VCDS, ODIS) wysyła zapytanie o kody błędów do sterownika silnika (adres 0x01), zapytanie to trafia najpierw do Gatewaya przez CAN-Diagnostyka.6 Gateway sprawdza swoją wewnętrzną tablicę routingu, identyfikuje, że adres 0x01 znajduje się na magistrali CAN-Napęd i przekazuje tam żądanie.6 Odpowiedź ze sterownika silnika przechodzi tę samą drogę w odwrotnym kierunku. Taka separacja chroni kluczowe systemy pojazdu przed zakłóceniami generowanymi przez testery diagnostyczne lub zainfekowane moduły multimedialne.5

Warto zauważyć, że awaria modułu Gateway paraliżuje całą diagnostykę pojazdu, gdyż jest on jedynym mostem łączącym gniazdo OBD-II z resztą systemów.6 Typowe objawy uszkodzenia J533 na platformie PQ35 obejmują kaskadowe błędy typu "No communication" we wszystkich innych modułach oraz brak możliwości nawiązania sesji diagnostycznej z jakimkolwiek sterownikiem poza samym Gatewayem.6

## **Protokoły komunikacji diagnostycznej: Warstwa transportowa i sesji**

Sama fizyczna obecność magistrali CAN nie definiuje sposobu przesyłania błędów DTC. Ponieważ kody błędów wraz z ich danymi środowiskowymi (Freeze Frames) często przekraczają standardowy limit 8 bajtów danych na ramkę CAN, system musi stosować protokoły transportowe do segmentacji i składania wiadomości.13

### **Volkswagen Transport Protocol 2.0 (TP 2.0)**

TP 2.0 jest autorskim protokołem grupy VAG, stosowanym powszechnie na platformie PQ35.3 Jego unikalną cechą jest dynamiczne nawiązywanie kanałów komunikacyjnych (Logical Channels).13 Zamiast używać stałych identyfikatorów CAN dla każdego sterownika (jak w standardzie ISO-TP), TP 2.0 negocjuje identyfikatory dla każdej sesji.3

Proces nawiązywania połączenia TP 2.0 (Handshake) przebiega w następujący sposób:

1. **Channel Setup (0xC0):** Tester wysyła ramkę na identyfikator 0x200 (Gateway base ID) z adresem logicznym celu (np. 0x01).13  
2. **Positive Response (0xD0):** Sterownik odpowiada na ID ![][image1] (np. 0x201), podając identyfikatory CAN, na których będzie odbywać się komunikacja.13 Zazwyczaj sterownik prosi tester o nadawanie na ID 0x740, a sam nadaje na ID 0x300.13  
3. **Channel Parameters (0xA0/0xA1):** Tester i sterownik uzgadniają parametry czasu oczekiwania (T1-T4) oraz rozmiar bloku danych (Block Size), co optymalizuje przepływ informacji bez przeciążania magistrali.13  
4. **Data Transmission:** Rozpoczyna się przesyłanie właściwych danych diagnostycznych (np. żądania odczytu DTC).13

Dzięki temu mechanizmowi, platforma PQ35 potrafi obsłużyć wielu testerów jednocześnie lub pozwala na komunikację między modułami przy użyciu tych samych protokołów warstwy wyższej.18

### **Ewolucja warstwy aplikacji: KWP2000 i UDS**

Na platformie PQ35 spotykamy dwa standardy warstwy aplikacji, co wynika z długiego okresu produkcji tej architektury i jej stopniowej modernizacji.2

* **KWP2000 (ISO 14230-3):** Stosowany w starszych modułach PQ35 (np. silniki 1.9 TDI, sterowniki Bordnetz). Wykorzystuje symetryczną komunikację żądanie-odpowiedź.2 W KWP2000 odczyt błędów odbywa się głównie przez serwis 0x18 (Read DTC by Status).2  
* **UDS (ISO 14229):** Wprowadzony w późniejszych modelach (np. Golf VI po 2009 roku) i nowych modułach BCM.4 UDS jest protokołem bardziej elastycznym, niezależnym od warstwy fizycznej i oferującym aż 21 subfunkcji dla serwisu 0x19 (Read DTC Information), co pozwala na znacznie bardziej precyzyjne filtrowanie pamięci błędów.2

W praktyce tester diagnostyczny musi najpierw rozpoznać, który protokół jest obsługiwany przez dany sterownik, co odbywa się podczas inicjalizacji sesji serwisem 0x10.21

## **Struktura danych i formaty błędów DTC**

Kody błędów na platformie PQ35 mogą przyjmować różne formy prezentacji, zależnie od tego, czy są odczytywane przez standardowy protokół OBD-II, czy przez dedykowane systemy serwisowe Volkswagena.23

### **Klasyfikacja kodów SAE J2012 (P-Codes, C-Codes, B-Codes, U-Codes)**

Globalny standard SAE J2012 definiuje 5-znakowe kody błędów, które są powszechnie używane również na platformie PQ35.25 Każdy błąd składa się z litery i czterech cyfr.27

| Pierwszy Znak | Kategoria Systemu | Przykłady Usterek |
| :---- | :---- | :---- |
| **P (Powertrain)** | Układ napędowy | Silnik, skrzynia biegów, układ paliwowy 26 |
| **C (Chassis)** | Podwozie | ABS, ESP, kontrola ciśnienia w oponach 26 |
| **B (Body)** | Nadwozie | Poduszki powietrzne, centralna elektryka, oświetlenie 26 |
| **U (Network)** | Sieć i komunikacja | Błędy magistral CAN, brak wiadomości od modułów 26 |

Drugi znak kodu informuje o typie standaryzacji:

* **0:** Kod ustandaryzowany (identyczny dla wszystkich producentów).30  
* **1:** Kod specyficzny dla producenta (VAG).30  
* **2, 3:** Kody zarezerwowane lub rzadziej stosowane.33

Trzeci znak precyzuje podsystem, np. cyfra '3' w kodzie P03xx zawsze odnosi się do wypadania zapłonów lub układu zapłonowego.27

### **Format 5-cyfrowy VAG i kodowanie binarne**

Równolegle do kodów SAE, VW stosuje własne, 5-cyfrowe numery dziesiętne (np. 00532 – Napięcie zasilania B+).24 Wewnątrz pamięci ECU każdy błąd zapisany jest jako dwubajtowa wartość szesnastkowa.35

Konwersja między formatem binarnym a czytelnym dla człowieka kodem SAE odbywa się według specyficznego algorytmu. Przykładowo, dwa bajty danych błędu są interpretowane bitowo, gdzie dwa najstarsze bity pierwszego bajtu definiują literę systemu 35:

* 00 \= P  
* 01 \= C  
* 10 \= B  
* 11 \= U

Kolejne bity odpowiadają za cyfry kodu. Ten format pozwala na zapisanie tysięcy unikalnych błędów w bardzo zwartej formie 16-bitowej.26

## **Analiza statusu błędu: Maska bitowa i stany dynamiczne**

Kluczowym elementem analizy DTC na PQ35 nie jest sam kod, lecz dołączony do niego bajt statusu (Status of DTC).38 Pozwala on mechanikowi lub inżynierowi stwierdzić, czy błąd jest usterką aktywną w tej chwili, czy też zdarzeniem sporadycznym, które wystąpiło w przeszłości.38

### **Interpretacja bajtu statusu (od prawej do lewej, bity 0-7)**

Volkswagen stosuje standardową maskę bitową zgodną z ISO 14229-1, którą profesjonalne testery takie jak VCDS wyświetlają w nawiasach lub w formie opisu tekstowego.38

| Bit | Nazwa Techniczna | Logika i Znaczenie |
| :---- | :---- | :---- |
| **0** | **Test Failed** | **1** \= Usterka jest obecnie aktywna (static). **0** \= Usterka pasywna (sporadic). 38 |
| **1** | **Test Failed (This Cycle)** | **1** \= Usterka wystąpiła przynajmniej raz w obecnym cyklu pracy zapłonu. 38 |
| **2** | **Pending DTC** | Błąd oczekujący. Wystąpił, ale wymaga potwierdzenia w kolejnych cyklach. 38 |
| **3** | **Confirmed DTC** | Błąd potwierdzony i zapisany w pamięci trwałej sterownika. 38 |
| **4** | **Test Not Completed (Since Clear)** | Procedura diagnostyczna dla tego błędu nie została wykonana od ostatniego kasowania. 38 |
| **5** | **Test Failed (Since Clear)** | Błąd wystąpił chociaż raz od czasu ostatniego czyszczenia pamięci. 38 |
| **6** | **Test Not Completed (This Cycle)** | Diagnostyka błędu nie została jeszcze przeprowadzona w tym cyklu pracy. 38 |
| **7** | **Warning Indicator Requested** | Żądanie zapalenia kontrolki (np. Check Engine) na desce rozdzielczej. 38 |

Źródło: 38

Dzięki tej masce tester potrafi odróżnić błąd, który trwał ułamek sekundy (sporadyczny), od usterki trwałej, np. przerwanego przewodu (statyczny).41 W logach diagnostycznych PQ35 błąd statyczny często nie posiada dodatkowego opisu, podczas gdy błędy sporadyczne są wyraźnie oznaczane jako "Intermittent".41

### **Algorytmy Debouncingu (Filtrowanie zakłóceń)**

ECU na platformie PQ35 nie zapisuje błędu natychmiast po wykryciu anomalii elektrycznej. Stosuje się tzw. debouncing, aby uniknąć fałszywych alarmów spowodowanych szumem na magistrali lub drganiami styków.39

Istnieją dwie główne strategie debouncingu:

1. **Oparta na czasie (Time-based):** Anomalia musi trwać nieprzerwanie przez określony czas (np. 200ms lub 2 sekundy), aby bit "Test Failed" został ustawiony na 1\.39  
2. **Oparta na liczniku (Counter-based):** Sterownik posiada licznik usterki. Każda błędna próbka sygnału zwiększa licznik o pewien krok (np. \+1). Każda poprawna próbka zmniejsza go (np. \-1). Gdy licznik osiągnie górny próg (zazwyczaj \+127), błąd zostaje uznany za "Confirmed".39

Proces ten ma również charakter odwrotny – jeśli błąd przestaje występować, licznik maleje. Gdy osiągnie dolny próg (np. \-128), błąd zmienia status na "Healed" (uleczony) i przechodzi w stan sporadyczny, aż do momentu jego całkowitego wygaśnięcia z pamięci (aging).39

## **Freeze Frames: Dane zamrożone i kontekst wystąpienia błędu**

Analiza samego kodu błędu to tylko połowa diagnostyki. Platforma PQ35 pozwala na odczyt parametrów pracy pojazdu z dokładnego momentu, w którym błąd został zapisany.39 Dane te są nazywane ramkami zamrożonymi (Freeze Frames) lub danymi środowiskowymi (Environmental Data).42

### **Składnia ramki danych zamrożonych**

Typowa ramka danych zamrożonych na platformie PQ35, widoczna w profesjonalnych logach, zawiera następujące informacje 41:

* **Fault Status:** 8-bitowy status usterki opisany wcześniej.  
* **Fault Priority:** Priorytet usterki w skali 1-8.  
* **Fault Frequency:** Licznik wystąpień (ile razy błąd powrócił).  
* **Reset Counter:** Licznik pokazujący, ile cykli jazdy bez błędu musi upłynąć, by błąd samoczynnie zniknąć z pamięci (aging counter).  
* **Mileage/Date/Time:** Przebieg pojazdu oraz czas wystąpienia (jeśli moduł ma dostęp do zegara czasu rzeczywistego z Gatewaya).

Ponadto, zależnie od typu błędu, sterownik silnika może zapisać dodatkowe parametry 43:

* Obroty silnika (RPM).  
* Obciążenie silnika (Engine Load).  
* Prędkość pojazdu.  
* Temperatura płynu chłodzącego.  
* Napięcie zasilania (Terminal 30).

Przykładowo, jeśli błąd niedoładowania turbosprężarki (P0299) występuje tylko przy obrotach powyżej 3000 RPM i temperaturze płynu 90°C, dane zamrożone natychmiast wskazują mechanikowi warunki brzegowe usterki, co drastycznie skraca czas diagnozy.42

### **Priorytety błędów VAG**

Volkswagen wprowadził własną skalę priorytetów (1-8), która pomaga uszeregować usterki według ich wpływu na bezpieczeństwo i mobilność.45

| Priorytet | Znaczenie i Wymagane Działanie |
| :---- | :---- |
| **1** | Bardzo wysoki wpływ na jazdę; wymagane natychmiastowe zatrzymanie pojazdu. |
| **2** | Usterka wymagająca natychmiastowej wizyty w serwisie. |
| **3** | Usterka niekrytyczna; powinna być naprawiona przy najbliższym przeglądzie. |
| **4** | Zalecane podjęcie działań, w przeciwnym razie jazda może być utrudniona. |
| **5** | Usterka nie ma wpływu na właściwości jezdne (np. drobne błędy komfortu). |
| **6** | Usterka mająca długofalowy wpływ na podzespoły (np. błędy czujników zużycia). |
| **7** | Wpływ wyłącznie na funkcje komfortu, bez wpływu na bezpieczeństwo. |
| **8** | Notatka ogólna, informacja dla serwisu o statusie specyficznym. |

Źródło: 45

## **Diagnostyka systemów Infotainment i protokół BAP**

Systemy multimedialne na platformie PQ35 (radia RNS510, RCD300, moduły Bluetooth) wykorzystują specyficzny protokół warstwy aplikacji o nazwie BAP (Bedien- und Anzeigeprotokoll).48 Protokół ten służy do przesyłania informacji o tym, co ma wyświetlić zestaw wskaźników lub jak sterować nawigacją.48

### **Dynamiczna diagnostyka przez ID 0x300**

Analiza danych binarnych (DBC) dla PQ35 ujawnia istnienie specjalnej ramki o identyfikatorze 0x300 (mTP\_Dyn\_Diag\_1\_1).48 Jest to dynamiczny kanał odbiorczy wykorzystywany przez testery diagnostyczne do komunikacji z systemami multimedialnymi przy użyciu protokołu TP 2.0.48

Charakterystyka sygnału w ramce 0x300 48:

* **Nazwa sygnału:** TPDyn\_Diag\_1\_1.  
* **Długość:** 64 bity (zajmuje całą ramkę 8-bajtową).  
* **Typ:** Bez znaku (Unsigned), format Intel (Little-endian).  
* **Przeznaczenie:** Tester Reception Channel 1 (Empfangskanal fuer Tester).

Wiele modułów, od wzmacniaczy po tunery TV i systemy sterowania głosem, współdzieli to ID do wysyłania odpowiedzi na zapytania diagnostyczne.48 Dzięki temu Gateway J533 może zarządzać ruchem diagnostycznym w sieci Infotainment w sposób uporządkowany, bez konieczności rezerwowania dziesiątek stałych adresów CAN.48

### **Debugowanie i parametryzacja ASR (Automated Speech Recognition)**

W zaawansowanych systemach PQ35, takich jak moduły głośnomówiące UHV, diagnostyka obejmuje również odczyt parametrów wydajnościowych algorytmów rozpoznawania mowy.48 Wykorzystywane są do tego ramki diagnostyczne o wyższych identyfikatorach, np. ID 0x7A6 (mASR6\_Param\_Request) i 0x7A7 (mASR7\_Param\_Feedback).48

Tester wysyła żądanie odczytu parametru (np. poziomu ufności rozpoznanego słowa) za pomocą 16-bitowego ID parametru (ASR6\_Param\_ID), a sterownik odpowiada ramką zawierającą 40-bitową wartość parametru (ASR7\_Param\_GetValue).48 Jest to przykład diagnostyki wykraczającej poza proste kody DTC, skupiającej się na optymalizacji działania oprogramowania.

## **Inicjalizacja komunikacji i warstwa fizyczna (Electrical Faults)**

Zrozumienie mechanizmów analizy DTC wymaga również spojrzenia na warstwę fizyczną. Na platformie PQ35 komunikacja diagnostyczna jest wrażliwa na parametry elektryczne sieci.50

### **Handshake na linii K i CAN**

Choć PQ35 jest platformą nowoczesną, niektóre sterowniki (np. wczesne moduły poduszek powietrznych czy sterownik ABS MK60) wymagają inicjalizacji przez linię K (pin 7 gniazda OBD), mimo że właściwa diagnostyka odbywa się później po CAN.50

Istnieją dwa główne sposoby inicjalizacji (Wake-up):

* **5-Baud Init (Slow Init):** Tester wysyła adres sterownika z prędkością zaledwie 5 bitów na sekundę. To archaiczny mechanizm, który pozwala wybudzić konkretny procesor z uśpienia.52  
* **Fast Init:** Krótki puls o niskim stanie logicznym trwający 25ms, po którym następuje wymiana "słów kluczowych" (Keywords) przy normalnej prędkości transmisji.52

Jeśli napięcie akumulatora w pojeździe spadnie poniżej 10.5V, inicjalizacja KWP2000 często kończy się niepowodzeniem, co tester zgłasza jako "Init Failed".50 Problemem mogą być również tanie interfejsy diagnostyczne, które mają niewłaściwie dobrany rezystor podciągający (pull-up) na linii K, co zniekształca zbocza sygnału cyfrowego i uniemożliwia odczyt błędów DTC.50

### **Błędy magistrali CAN (Bus-Off i Single-Wire)**

W magistrali CAN-Komfort na platformie PQ35 zastosowano system odporny na błędy (Fault-Tolerant CAN), który potrafi kontynuować pracę w trybie jednoprzewodowym (Single-Wire Mode), jeśli jeden z przewodów (CAN-High lub CAN-Low) zostanie zwarty do masy lub przerwany.6

W takiej sytuacji sterownik nie przestaje działać, ale zapisuje specyficzny kod błędu DTC:

* **00470:** Magistrala danych komfortu w trybie jednoprzewodowym (Comfort Databus in Single-Wire Operation).6  
* **01312:** Magistrala danych napędu uszkodzona (Drivetrain Data Bus Defective).6

Analiza tych błędów pozwala na szybkie zlokalizowanie uszkodzeń wiązki elektrycznej, np. w gumowych przelotkach drzwi, co jest częstą przypadłością pojazdów na platformie PQ35.6

## **Proces usuwania błędów DTC i mechanizm Aging**

Kasowanie błędów na platformie PQ35 to proces sformalizowany w protokołach KWP2000 i UDS za pomocą serwisu 0x04 (Clear Diagnostic Information).45

### **Procedura czyszczenia pamięci**

Kasowanie błędów nie jest możliwe dla usterki o statusie "Static" (bit 0 \= 1), dopóki fizyczna przyczyna błędu nie zostanie usunięta.45 Tester wysyła żądanie kasowania, sterownik sprawdza warunki (np. czy silnik jest wyłączony, czy zapłon jest włączony) i jeśli są one spełnione, czyści całą pamięć błędów modułu.21

Należy podkreślić dwie istotne cechy systemu VAG na PQ35:

1. **Brak możliwości kasowania selektywnego:** Nie da się skasować jednego wybranego błędu, pozostawiając inne. Polecenie 0x04 zawsze czyści całą tablicę zdarzeń w danym sterowniku.45  
2. **Kody krytyczne (Hard DTC):** Niektóre błędy, jak błąd pamięci sterownika (65535) lub błąd "Crash Data Stored" w module poduszek powietrznych, są zablokowane przed kasowaniem standardowym serwisem 0x04 i wymagają specjalistycznej procedury resetowania procesora.54

### **Mechanizm Auto-Aging (Samoczynne wygasanie)**

System PQ35 jest zaprojektowany tak, aby "zapominać" o błędach sporadycznych, które nie powracają przez dłuższy czas.36 Służy do tego licznik resetowania (Reset Counter).41 Za każdym razem, gdy błąd wystąpi, licznik ten jest ustawiany na określoną wartość (często 40 lub 255).36 Jeśli podczas kolejnego cyklu jazdy (Warm-up Cycle) błąd nie wystąpi, sterownik zmniejsza licznik o 1\.39 Gdy licznik osiągnie zero, wpis DTC zostaje automatycznie usunięty z pamięci, co zapobiega gromadzeniu się starych, nieistotnych informacji w systemie.39

## **Podsumowanie systemowe**

Analiza błędów DTC na platformie Volkswagen PQ35 to wielowymiarowy proces, który łączy rygorystyczne standardy inżynieryjne z praktycznymi potrzebami diagnostyki warsztatowej. Kluczowe wnioski z analizy tej architektury wskazują na następujące filary działania systemu:

1. **Centralizacja diagnostyki:** Dzięki modułowi J533 Gateway, diagnostyka całego pojazdu odbywa się przez jeden punkt dostępowy, co umożliwia wykonywanie automatycznych skanów (Auto-Scan) i szybką ocenę kondycji wszystkich systemów jednocześnie.1  
2. **Dynamika protokołu TP 2.0:** Zastosowanie dynamicznych kanałów komunikacyjnych pozwoliło na elastyczne przesyłanie dużej ilości danych, takich jak Freeze Frames, co wcześniej było niemożliwe na sztywnych strukturach starszych systemów.3  
3. **Precyzja statusu błędu:** Dzięki 8-bitowej masce statusu, system PQ35 dostarcza informacji nie tylko o fakcie wystąpienia usterki, ale o jej charakterze (statyczny/sporadyczny), etapie weryfikacji (pending/confirmed) oraz konieczności interwencji (MIL request).38  
4. **Kontekst operacyjny:** Ramki zamrożone (Freeze Frames) przekształcają kod błędu w pełny zapis warunków pracy pojazdu, umożliwiając analizę korelacji między usterkami a parametrami środowiskowymi, co jest standardem w nowoczesnej diagnostyce automotive.39

Zrozumienie tych mechanizmów – od fizycznej warstwy napięć na linii K, przez negocjację kanałów TP 2.0, aż po bitową interpretację statusów UDS – stanowi fundament profesjonalnej diagnostyki i serwisu pojazdów grupy VAG produkowanych w pierwszej dekadzie XXI wieku.50

#### **Cytowane prace**

1. VCDS: CAN-Bus Information \- Ross-Tech, otwierano: kwietnia 6, 2026, [https://www.ross-tech.com/vcds/canbus.html](https://www.ross-tech.com/vcds/canbus.html)  
2. KWP2000 vs UDS Protocol: An Analysis and Comparison \- Embitel, otwierano: kwietnia 6, 2026, [https://www.embitel.com/blog/embedded-blog/kwp-2000-and-uds-protocols-for-vehicle-diagnostics-an-analysis-and-comparison](https://www.embitel.com/blog/embedded-blog/kwp-2000-and-uds-protocols-for-vehicle-diagnostics-an-analysis-and-comparison)  
3. VW-TP-2.0.txt \- Open-Vehicle-Monitoring-System-3 \- GitHub, otwierano: kwietnia 6, 2026, [https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3/blob/master/vehicle/OVMS.V3/components/vehicle/docs/VW-TP-2.0.txt](https://github.com/openvehicles/Open-Vehicle-Monitoring-System-3/blob/master/vehicle/OVMS.V3/components/vehicle/docs/VW-TP-2.0.txt)  
4. UDS Services | Vehicle Diagnostics \- Embitel, otwierano: kwietnia 6, 2026, [https://www.embitel.com/blog/embedded-blog/4-uds-services-that-every-vehicle-diagnostics-implementation-team-should-know](https://www.embitel.com/blog/embedded-blog/4-uds-services-that-every-vehicle-diagnostics-implementation-team-should-know)  
5. Data bus diagnosis interface \- VolksPage.Net, otwierano: kwietnia 6, 2026, [https://www.volkspage.net/technik/ssp/ssp/SSP\_307\_d2.pdf](https://www.volkspage.net/technik/ssp/ssp/SSP_307_d2.pdf)  
6. Audi Volkswagen Porsche CAN Gateway Module J533 Repair Service \- ECU Maverick, otwierano: kwietnia 6, 2026, [https://ecumaverick.com/products/audi-volkswagen-porsche-gateway-module-programming-coding-service](https://ecumaverick.com/products/audi-volkswagen-porsche-gateway-module-programming-coding-service)  
7. ssp269 Data transfer on CAN data bus II \- VolksPage.Net, otwierano: kwietnia 6, 2026, [https://www.volkspage.net/technik/ssp/ssp/SSP\_269\_d1.pdf](https://www.volkspage.net/technik/ssp/ssp/SSP_269_d1.pdf)  
8. VCDS help : r/Volkswagen \- Reddit, otwierano: kwietnia 6, 2026, [https://www.reddit.com/r/Volkswagen/comments/1hy2t7l/vcds\_help/](https://www.reddit.com/r/Volkswagen/comments/1hy2t7l/vcds_help/)  
9. VW / Passat B7 (36) / 19 \- Gateway (J533 Gateway) CAN, otwierano: kwietnia 6, 2026, [https://diagnostics.vis4vag.com/en/vw/passat-b7-36/19-gateway-j533-gateway-can/](https://diagnostics.vis4vag.com/en/vw/passat-b7-36/19-gateway-j533-gateway-can/)  
10. How to read vw can bus \- General Discussion \- Macchina, otwierano: kwietnia 6, 2026, [https://forum.macchina.cc/t/how-to-read-vw-can-bus/655](https://forum.macchina.cc/t/how-to-read-vw-can-bus/655)  
11. VW PQ35 requesting data from other CAN buses : r/CarHacking \- Reddit, otwierano: kwietnia 6, 2026, [https://www.reddit.com/r/CarHacking/comments/1afgptr/vw\_pq35\_requesting\_data\_from\_other\_can\_buses/](https://www.reddit.com/r/CarHacking/comments/1afgptr/vw_pq35_requesting_data_from_other_can_buses/)  
12. Repair/REMAN Service \- CAN Gateway J533 Module-1311 \- SpeedoSolutions, otwierano: kwietnia 6, 2026, [https://www.speedosolutions.com/RepairREMAN-Service--CAN-Gateway-J533-Module\_p\_1332.html](https://www.speedosolutions.com/RepairREMAN-Service--CAN-Gateway-J533-Module_p_1332.html)  
13. VW Transport Protocol 2.0 (TP 2.0) for CAN bus | Personal website of Jared Wiltshire, otwierano: kwietnia 6, 2026, [https://jazdw.net/tp20](https://jazdw.net/tp20)  
14. CAN Part 8 \- ISO 15765, KWP2000, ODB, and UDS (Automotive Diagnostic Command Set), otwierano: kwietnia 6, 2026, [http://hooovahh.blogspot.com/2017/07/can-part-8-iso-15765-kwp2000-odb-and.html](http://hooovahh.blogspot.com/2017/07/can-part-8-iso-15765-kwp2000-odb-and.html)  
15. VW Transport Protocol 2.0 (TP 2.0) For CAN Bus | PDF \- Scribd, otwierano: kwietnia 6, 2026, [https://www.scribd.com/document/578694698/VW-Transport-Protocol-2-0-TP-2-0-for-CAN-bus](https://www.scribd.com/document/578694698/VW-Transport-Protocol-2-0-TP-2-0-for-CAN-bus)  
16. \[Ovmsdev\] Poller support for VW TP 2.0 \- Open Vehicle Monitoring System, otwierano: kwietnia 6, 2026, [http://lists.openvehicles.com/pipermail/ovmsdev/2021-May/015344.html](http://lists.openvehicles.com/pipermail/ovmsdev/2021-May/015344.html)  
17. VW Transport Protocol 2.0 Overview | PDF \- Scribd, otwierano: kwietnia 6, 2026, [https://www.scribd.com/document/670573720/VAG-TP-2-0](https://www.scribd.com/document/670573720/VAG-TP-2-0)  
18. VW TP2.0 multiple module request : r/CarHacking \- Reddit, otwierano: kwietnia 6, 2026, [https://www.reddit.com/r/CarHacking/comments/1jxu8mk/vw\_tp20\_multiple\_module\_request/](https://www.reddit.com/r/CarHacking/comments/1jxu8mk/vw_tp20_multiple_module_request/)  
19. Unified Diagnostic Services \- Wikipedia, otwierano: kwietnia 6, 2026, [https://en.wikipedia.org/wiki/Unified\_Diagnostic\_Services](https://en.wikipedia.org/wiki/Unified_Diagnostic_Services)  
20. KWP2000 and UDS Difference \- automotive basics \- WordPress.com, otwierano: kwietnia 6, 2026, [https://automotivetechis.wordpress.com/2012/06/06/kwp2000-and-uds-difference/](https://automotivetechis.wordpress.com/2012/06/06/kwp2000-and-uds-difference/)  
21. Interacting with UDS — RAMN 1.0.0 documentation \- Read the Docs, otwierano: kwietnia 6, 2026, [https://ramn.readthedocs.io/en/latest/userguide/diag\_tutorial.html](https://ramn.readthedocs.io/en/latest/userguide/diag_tutorial.html)  
22. PyVCDS/kwp.py at master \- GitHub, otwierano: kwietnia 6, 2026, [https://github.com/baconwaifu/PyVCDS/blob/master/kwp.py](https://github.com/baconwaifu/PyVCDS/blob/master/kwp.py)  
23. BentleyPublishers.com \- VW / Audi DTC Trouble codes (Diagnostic Trouble Codes) \- VAGLinks.com, otwierano: kwietnia 6, 2026, [https://www.vaglinks.com/Docs/VW/BentleyPublishers.com\_VW\_DTC\_Table.pdf](https://www.vaglinks.com/Docs/VW/BentleyPublishers.com_VW_DTC_Table.pdf)  
24. VAG Diagnostic Trouble Codes List | PDF | Technology & Engineering \- Scribd, otwierano: kwietnia 6, 2026, [https://www.scribd.com/doc/197788654/Fault-Codes-VAG-English](https://www.scribd.com/doc/197788654/Fault-Codes-VAG-English)  
25. 5-Digit DTC Codes: Vehicle Diagnostics Simplified | TruckX, otwierano: kwietnia 6, 2026, [https://truckx.com/faqs/fleet-management/what-is-the-5-digit-dtc-code/](https://truckx.com/faqs/fleet-management/what-is-the-5-digit-dtc-code/)  
26. Diagnostic Trouble Code (DTC) Explanation: From Zero Basics to Complete Mastery, otwierano: kwietnia 6, 2026, [https://en.eeworld.com.cn/news/qrs/eic698361.html](https://en.eeworld.com.cn/news/qrs/eic698361.html)  
27. What is a DTC Code? Ultimate Guide to Understanding Common DTC Codes | Geotab, otwierano: kwietnia 6, 2026, [https://www.geotab.com/glossary/dtc-codes/](https://www.geotab.com/glossary/dtc-codes/)  
28. DTC Codes: A Complete Guide to What They Are and What They Mean \- Whip Around, otwierano: kwietnia 6, 2026, [https://whiparound.com/lead-magnet/dtc-codes/](https://whiparound.com/lead-magnet/dtc-codes/)  
29. How to Decode OBD2 Diagnostic Trouble Codes \- Carista, otwierano: kwietnia 6, 2026, [https://carista.com/blogs/news/how-to-decode-obd2-diagnostic-trouble-codes](https://carista.com/blogs/news/how-to-decode-obd2-diagnostic-trouble-codes)  
30. What are DTC Codes? The Complete Diagnostic Trouble Code Guide \- Lytx, otwierano: kwietnia 6, 2026, [https://www.lytx.com/blog/dtc-guide-everything-you-need-to-know-about-diagnostic-trouble-codes](https://www.lytx.com/blog/dtc-guide-everything-you-need-to-know-about-diagnostic-trouble-codes)  
31. DTC Codes: Everything You Need to Know to Manage Your Fleet | Linxup, otwierano: kwietnia 6, 2026, [https://www.linxup.com/blog/dtc-codes-everything-you-need-to-know-to-manage-your-fleet](https://www.linxup.com/blog/dtc-codes-everything-you-need-to-know-to-manage-your-fleet)  
32. Anatomy of the DTC: OBD2 Codes Explained \- AVI OnDemand, otwierano: kwietnia 6, 2026, [https://aviondemand.com/insider/anatomy-of-the-dtc-obd2-codes-explained/](https://aviondemand.com/insider/anatomy-of-the-dtc-obd2-codes-explained/)  
33. The Complete Diagnostic Trouble Codes (DTC) Guide \- Enterprise Fleet Management, otwierano: kwietnia 6, 2026, [https://www.efleets.com/en/proof-and-insights/white-papers/complete-diagnostic-trouble-codes-guide.html](https://www.efleets.com/en/proof-and-insights/white-papers/complete-diagnostic-trouble-codes-guide.html)  
34. 00532 \- Ross-Tech Wiki, otwierano: kwietnia 6, 2026, [http://wiki.ross-tech.com/index.php/00532](http://wiki.ross-tech.com/index.php/00532)  
35. How the Diagnostic Trouble Code(DTC) data is defined in the ECU? \- Stack Overflow, otwierano: kwietnia 6, 2026, [https://stackoverflow.com/questions/52003866/how-the-diagnostic-trouble-codedtc-data-is-defined-in-the-ecu](https://stackoverflow.com/questions/52003866/how-the-diagnostic-trouble-codedtc-data-is-defined-in-the-ecu)  
36. EDC16 Error Management and DTC Removal | PDF | Switch \- Scribd, otwierano: kwietnia 6, 2026, [https://www.scribd.com/document/804780112/14-EDC16-Error-Dtc-Removal](https://www.scribd.com/document/804780112/14-EDC16-Error-Dtc-Removal)  
37. Message Signal Type DTC \- Intrepid Control Systems, Inc., otwierano: kwietnia 6, 2026, [https://cdn.intrepidcs.net/support/VehicleSpy/spyInDecodeDTC.htm](https://cdn.intrepidcs.net/support/VehicleSpy/spyInDecodeDTC.htm)  
38. 00-18-02TT – DTC Status Bit Explanation \- nhtsa, otwierano: kwietnia 6, 2026, [https://static.nhtsa.gov/odi/tsbs/2018/MC-10150854-9999.pdf](https://static.nhtsa.gov/odi/tsbs/2018/MC-10150854-9999.pdf)  
39. The Lifecycle of a Diagnostic Trouble Code (DTC) \- KPIT, otwierano: kwietnia 6, 2026, [https://www.kpit.com/insights/the-lifecycle-of-a-diagnostic-trouble-code-dtc/](https://www.kpit.com/insights/the-lifecycle-of-a-diagnostic-trouble-code-dtc/)  
40. UDS ReportDTCByStatusMask.vi \- NI \- National Instruments, otwierano: kwietnia 6, 2026, [https://www.ni.com/docs/en-US/bundle/automotive-diagnostic-command-set-toolkit-labview-api-ref/page/uds-reportdtcbystatusmask-vi.html](https://www.ni.com/docs/en-US/bundle/automotive-diagnostic-command-set-toolkit-labview-api-ref/page/uds-reportdtcbystatusmask-vi.html)  
41. Problems with My can bus gateway and this is what VCDS say, do I have to get a new gateway ? or what should I do as the car works sometimes and sometimes starts then stops working : r/tdi \- Reddit, otwierano: kwietnia 6, 2026, [https://www.reddit.com/r/tdi/comments/1ha77gk/problems\_with\_my\_can\_bus\_gateway\_and\_this\_is\_what/](https://www.reddit.com/r/tdi/comments/1ha77gk/problems_with_my_can_bus_gateway_and_this_is_what/)  
42. VCDS Fault Codes for VW Golf | PDF | Headlamp | Airbag \- Scribd, otwierano: kwietnia 6, 2026, [https://www.scribd.com/document/827306070/Report-Golf](https://www.scribd.com/document/827306070/Report-Golf)  
43. VCDS Diagnostic Report | PDF | Airbag | Vehicles \- Scribd, otwierano: kwietnia 6, 2026, [https://www.scribd.com/document/336100444/Log-WAUZZZ8P79A086396-110370km-68580mi-txt](https://www.scribd.com/document/336100444/Log-WAUZZZ8P79A086396-110370km-68580mi-txt)  
44. Introduction to the Debounce Algorithm for Automotive ECU Diagnosis \- EEWorld, otwierano: kwietnia 6, 2026, [https://en.eeworld.com.cn/news/qrs/eic649432.html](https://en.eeworld.com.cn/news/qrs/eic649432.html)  
45. VCDS Tour \- Fault Codes \- Ross-Tech, otwierano: kwietnia 6, 2026, [https://www.ross-tech.com/vcds/tour/dtc\_screen.html](https://www.ross-tech.com/vcds/tour/dtc_screen.html)  
46. VAG-COM Tour: Fault Codes \- Ross-Tech, otwierano: kwietnia 6, 2026, [https://www.ross-tech.com/vag-com/tour-old/dtc\_screen.html](https://www.ross-tech.com/vag-com/tour-old/dtc_screen.html)  
47. Fault Codes \- VCDS-Lite Manual \- Ross-Tech, otwierano: kwietnia 6, 2026, [https://www.ross-tech.com/vcds-lite/manual/dtc.html](https://www.ross-tech.com/vcds-lite/manual/dtc.html)  
48. PQ35\_46\_ICAN\_V3\_6\_9\_F\_20081104\_ASR\_V1\_2.dbc  
49. BAP-FC NAV-SD P30DF48 v2.80 F PDF | PDF | Volkswagen Group \- Scribd, otwierano: kwietnia 6, 2026, [https://www.scribd.com/document/476121999/BAP-FC-NAV-SD-P30DF48-v2-80-F-pdf](https://www.scribd.com/document/476121999/BAP-FC-NAV-SD-P30DF48-v2-80-F-pdf)  
50. KWP2000 Error Codes: The Hidden Cost in Diagnostic Time, otwierano: kwietnia 6, 2026, [https://obd-cable.com/kwp2000-error-costs-diagnostic-time/](https://obd-cable.com/kwp2000-error-costs-diagnostic-time/)  
51. Legacy OBD2 Protocols Guide: KWP2000, ISO9141 & CAN, otwierano: kwietnia 6, 2026, [https://obd-cable.com/legacy-obd2-protocols-guide/](https://obd-cable.com/legacy-obd2-protocols-guide/)  
52. KW2000 Protocol Supported Services | PDF | Osi Model | Computing \- Scribd, otwierano: kwietnia 6, 2026, [https://www.scribd.com/document/95266778/KW2000-Supported-Services](https://www.scribd.com/document/95266778/KW2000-Supported-Services)  
53. A Guide to KWP2000 Protocol \- Embien Technologies, otwierano: kwietnia 6, 2026, [https://www.embien.com/automotive-insights/demystifying-the-kwp2000-protocol-a-comprehensive-guide](https://www.embien.com/automotive-insights/demystifying-the-kwp2000-protocol-a-comprehensive-guide)  
54. Repair VAG COM 65535 \- Internal Control Module Memory Error 37-10 \- Faulty \- YouTube, otwierano: kwietnia 6, 2026, [https://www.youtube.com/watch?v=f4SK\_lWvhVE](https://www.youtube.com/watch?v=f4SK_lWvhVE)  
55. kwp2000 · GitHub Topics, otwierano: kwietnia 6, 2026, [https://github.com/topics/kwp2000?o=desc\&s=updated](https://github.com/topics/kwp2000?o=desc&s=updated)  
56. vcds\_release.txt \- JUCETIZE, otwierano: kwietnia 6, 2026, [https://jucetize.weebly.com/uploads/3/7/2/0/37200949/vcds\_release.txt](https://jucetize.weebly.com/uploads/3/7/2/0/37200949/vcds_release.txt)

[image1]: <data:image/png;base64,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>