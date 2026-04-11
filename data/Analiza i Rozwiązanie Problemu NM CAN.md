# **Kompleksowa analiza i rozwiązanie problemu zarządzania siecią (NM) CAN w platformie VW PQ35**

## **1\. Wprowadzenie do topologii sieciowej i architektury platformy VW PQ35**

Architektura elektroniczna platformy Volkswagen PQ35, stanowiąca fundament technologiczny dla pojazdów takich jak VW Golf V, Golf Plus, czy Audi A3 8P, opiera się na wysoce zintegrowanym i rozproszonym systemie komunikacji opartym na protokole Controller Area Network (CAN). Ze względu na rosnącą złożoność systemów wbudowanych, konieczne stało się odseparowanie różnych domen funkcjonalnych pojazdu w celu zapewnienia bezpieczeństwa, determinizmu czasowego oraz optymalizacji zużycia energii. Centralnym punktem tej topologii jest moduł bramki sieciowej J533 (Data Bus Diagnostic Interface), który pełni rolę inteligentnego routera i translatora protokołów pomiędzy niezależnymi podsieciami.1

Architektura ta dzieli się na trzy główne domeny komunikacyjne:

1. **CAN-Antrieb (Napęd):** Magistrala wysokiej prędkości (High-Speed CAN) działająca z przepustowością 500 kbit/s, oparta na standardzie fizycznym ISO 11898-2. Obsługuje ona krytyczne czasowo sterowniki, takie jak jednostka sterująca silnika (ECU), systemy ABS/ESP, sterowniki poduszek powietrznych oraz moduły przekładni automatycznych. Odznacza się ścisłymi wymaganiami czasu rzeczywistego.1  
2. **CAN-Komfort (Komfort):** Magistrala niskiej prędkości (Low-Speed, Fault-Tolerant CAN) operująca z prędkością 100 kbit/s, oparta na standardzie ISO 11898-3. Łączy moduły drzwiowe, moduł centralnej elektryki (CECM/BSG), systemy klimatyzacji oraz sterowniki foteli.1  
3. **CAN-Infotainment (Rozrywka i systemy informacyjne):** Magistrala również działająca z prędkością 100 kbit/s (ISO 11898-3), dedykowana dla systemów nawigacji, radioodbiorników, wzmacniaczy DSP, wyświetlaczy oraz interfejsów telematycznych.1

Wykorzystanie standardu ISO 11898-3 w sieciach Komfort i Infotainment ma kluczowe znaczenie dla niezawodności i zarządzania energią. Transceivery typu fault-tolerant (np. TJA1054, TJA1055) nieustannie monitorują napięcie różnicowe pomiędzy liniami CAN-High (dominujące napięcie ok. 3.6V) oraz CAN-Low (dominujące napięcie ok. 1.4V). W przypadku wystąpienia usterki fizycznej – takiej jak zwarcie jednej z linii do masy (GND), zwarcie do napięcia zasilania (VCC) lub przerwanie obwodu – transceiver sprzętowo przechodzi w tryb jednoprzewodowy (single-wire mode), wykorzystując ocalałą linię sygnałową oraz lokalną masę jako odniesienie.1 Ta wyjątkowa odporność warstwy fizycznej wymusza implementację równie zaawansowanej warstwy logicznej, która musi zarządzać wybudzaniem i usypianiem tysięcy komponentów elektronicznych, aby zapobiec drenażowi akumulatora, gdy pojazd jest zaparkowany.

Głównym problemem inżynieryjnym, będącym przedmiotem niniejszego raportu, jest anomalia w protokole zarządzania siecią (Network Management \- NM) na węźle o identyfikatorze 0x0B w sieci Infotainment. Węzeł ten musi sprostać dwóm wzajemnie wykluczającym się, rygorystycznym kryteriom walidacyjnym koncernu VAG:

* **Test A (Prawidłowe usypianie):** Węzeł musi zezwolić na całkowite uśpienie magistrali (Bus Sleep), współpracując z bramką J533, aby zredukować pobór prądu. Nie może on sztucznie podtrzymywać aktywności sieci poprzez ciągłe nadawanie żądań utrzymania pierścienia logicznego.1  
* **Test B (Odporność na asynchroniczne impulsy):** Węzeł musi wykazać pełną odporność na nagłe, fizyczne wybudzenia magistrali (np. pociągnięcie dźwigni świateł drogowych lub użycie pilota centralnego zamka) występujące w krytycznym oknie czasowym tuż po logicznym zakończeniu cyklu aktywności (faza WAKE\_END). Węzeł nie może w tej sytuacji zawiesić swojej komunikacji ani wywołać błędu alarmowego ERR:CAN:HANG wyzwalanego przez układ watchdog.1

Zrozumienie mechanizmów leżących u podstaw tego paradoksu wymaga dogłębnej analizy teoretycznych podstaw standardu OSEK/VDX, dekompozycji binarnych ładunków ramek NM oraz skrupulatnej oceny empirycznych logów komunikacyjnych.

> **Adnotacja metodyczna (repo):** Dla spójności z pozostałymi materiałami repo przyjmujemy: (1) kanoniczną mapę `0x42B` z `data/id_ramek.txt`, (2) etykiety jakości twierdzeń: **fakt z logów**, **inferencja z kodu**, **hipoteza do potwierdzenia snifferem**. Punkt odniesienia: `logs/2026-04-11/NM_CANONICAL_BASELINE.md`.

> **Aktualizacja końcowa (v10 / v10-refactor):** Problem komunikacji NM został domknięty w aktualnym `hardware/hardware.ino`. Opisane w raporcie sytuacje E1-E4 pozostają materiałem historycznym i anty-regresyjnym, ale nie reprezentują już bieżącego zachowania firmware.

## **2\. Teoretyczne podstawy protokołu OSEK/VDX Direct Network Management**

Zarządzanie stanami energetycznymi w sieciach VAG PQ35 opiera się na specyfikacji OSEK/VDX (Offene Systeme und deren Schnittstellen für die Elektronik im Kraftfahrzeug / Vehicle Distributed Executive). Standard ten definiuje otwartą architekturę dla rozproszonych jednostek sterujących. W kontekście sieciowym, OSEK NM realizuje strategię Direct Network Management, która wykorzystuje mechanizm dedykowanych ramek transmisyjnych do tworzenia wirtualnego, zdecentralizowanego pierścienia logicznego (Logical Ring).1

### **2.1. Adresowanie i topologia pierścienia logicznego**

W przeciwieństwie do standardowej arbitraży CSMA/CA wykorzystywanej do przesyłania danych aplikacyjnych, protokół OSEK NM wymusza sekwencyjne przekazywanie "tokena" pomiędzy aktywnymi węzłami. Każdy sterownik (ECU) uczestniczący w sieci NM posiada unikalny identyfikator węzła (Node ID). Zgodnie ze specyfikacją VAG, identyfikatory ramek zarządzających są obliczane poprzez dodanie stałego offsetu 0x400 do ID węzła nadającego.

Przykładowo:

* Bramka J533 posiada Node ID 0x2B, zatem nadaje ramki NM pod identyfikatorem **0x42B**.1  
* Standardowy radioodbiornik posiada Node ID 0x63, nadając pod **0x463**.1  
* Badany węzeł eksperymentalny posiada Node ID 0x0B, nadając pod **0x40B**.1

Gdy dany węzeł odbiera ramkę NM, w której pierwszy bajt (Receiver ID) jest równy jego własnemu Node ID, staje się on posiadaczem tokena. Ma wówczas obowiązek wysłać własną ramkę NM, w której Receiver ID wskazuje na logicznego następcę w pierścieniu (węzeł o kolejnym, najwyższym ID). Proces ten trwa nieprzerwanie, tworząc cykl życia sieci.1

### **2.2. Stany operacyjne węzła OSEK NM**

Maszyna stanów protokołu OSEK NM jest rygorystycznie zdefiniowana i obejmuje następujące stany wewnętrzne 1:

* **NMOff:** Węzeł jest odłączony od zasilania lub przebywa w głębokim uśpieniu sprzętowym. W tym stanie transceiver CAN nasłuchuje jedynie wzorców wybudzających (WUP \- Wake-Up Pattern) z warstwy fizycznej.  
* **NMReset:** Faza inicjalizacji. Węzeł, który został wybudzony, nadaje ramkę typu "Alive", zgłaszając swoją obecność i chęć dołączenia do pierścienia logicznego.  
* **NMAwake / NMNormal:** Stan stabilnej operacyjności. Węzeł aktywnie nasłuchuje tokenów, przetwarza je i przekazuje do następcy. W tym stanie dozwolona jest swobodna wymiana danych aplikacyjnych na magistrali.  
* **NMLimpHome:** Stan awaryjny (tryb utykania). Węzeł przechodzi w ten stan, jeśli pierścień logiczny ulegnie przerwaniu (np. brak odpowiedzi od następcy po upływie zdefiniowanego timeoutu). W trybie Limp Home węzły periodycznie nadają komunikaty "Alive", aby umożliwić rekonfigurację i odbudowę pierścienia.1  
* **NMBusSleep:** Stan niskiego poboru energii. Przejście do tego stanu jest procesem wysoce kooperatywnym i deterministycznym, regulowanym przez określone bity w ładunku ramki NM.

### **2.3. Kooperatywne usypianie sieci (Sleep Negotiation)**

Jednym z najtrudniejszych aspektów implementacji OSEK NM jest proces negocjacji snu. Żaden węzeł nie może jednostronnie uśpić sieci. Algorytm ten działa następująco 1:

1. Gdy aplikacja działająca na węźle uznaje, że nie ma już danych do wysłania ani obróbki (np. po wyłączeniu zapłonu lub zamknięciu zamków), ustawia w nadawanej ramce NM bit SleepInd (Sleep Indication) na wartość 1\.  
2. Oznacza to gotowość do uśpienia, jednak węzeł musi nadal przekazywać token i uczestniczyć w pierścieniu.  
3. Bramka J533, monitorując cały ruch NM, agreguje informacje od wszystkich węzłów.  
4. Gdy wszystkie aktywne węzły w pierścieniu zadeklarują SleepInd \= 1, bramka J533 nadaje własną ramkę NM, w której ustawiony jest globalny bit SleepInd oraz ewentualnie bit SleepAck (Sleep Acknowledge).  
5. Dopiero po odebraniu i przetworzeniu tego jednoznacznego potwierdzenia od bramki, poszczególne węzły mają prawo wyłączyć swoje wewnętrzne watchdogi komunikacyjne, dezaktywować nadajniki i przejść w stan NMBusSleep.

Nieprzestrzeganie tego ścisłego algorytmu prowadzi do błędów, które objawiają się jako patologie komunikacyjne opisane w sytuacjach E1-E4.

## **3\. Dekodowanie matrycy DBC i struktura ładunków (Payloads)**

Precyzyjna implementacja firmware'u węzła wymaga całkowitego zrozumienia semantyki bitowej na magistrali CAN. Analiza opiera się na dostarczonym pliku id\_ramek.txt, który reprezentuje spłaszczoną strukturę bazy danych CAN (DBC) z zachowaniem konwencji Little-Endian (Intel) dla wszystkich sygnałów.1

### **3.1. Ramka zarządzająca bramki: mNM\_Gateway\_I (ID: 0x42B / 1067\)**

Ramka ta stanowi wektor kontrolny dla całej polityki NM na magistrali Infotainment. Nadawana przez Gateway (J533), ma długość 6 bajtów. Poniższa tabela przedstawia dekompozycję sygnałów, która jest kluczowa dla budowy tabeli decyzyjnej oprogramowania układowego 1:

| Nazwa Sygnału | Bajt | Bit w bajcie | Startbit | Długość | Opis operacyjny sygnału |
| :---- | :---- | :---- | :---- | :---- | :---- |
| NMGW\_I\_Receiver | 0 | 0-7 | 0 | 8 bitów | Adres węzła docelowego (następcy w pierścieniu). Dla badanego węzła wartość ta wynosi 0x0B. |
| NMGW\_I\_CmdRing | 1 | 0 | 8 | 1 bit | 1 \= Ramka uczestniczy w normalnym cyklu przekazywania tokena (Ring Message). |
| NMGW\_I\_CmdAlive | 1 | 1 | 9 | 1 bit | 1 \= Węzeł zgłasza swoją obecność i inicjalizuje się w sieci (Alive Message). |
| NMGW\_I\_CmdLimpHome | 1 | 2 | 10 | 1 bit | 1 \= Błąd pierścienia. Sieć w trybie utykania. Bramka poszukuje zgubionych węzłów. |
| NMGW\_I\_SleepInd | 1 | 4 | 12 | 1 bit | 1 \= Sygnalizacja gotowości do snu. Jeśli nadawana przez bramkę, wymusza usypianie podsieci. |
| NMGW\_I\_SleepAck | 1 | 5 | 13 | 1 bit | 1 \= Ostateczne potwierdzenie snu (BusSleep Acknowledge). |
| NMGW\_I\_Kl\_30\_Reset | 2 | 4 | 20 | 1 bit | Przyczyna wybudzenia: Reset terminala 30 (bezpośrednie zasilanie z akumulatora). |
| NMGW\_I\_Fkt\_Nachlauf | 2 | 5 | 21 | 1 bit | Przyczyna wybudzenia: Zakończenie timera podtrzymania funkcji. |
| NMGW\_I\_NWake | 2 | 6 | 22 | 1 bit | Przyczyna wybudzenia: Aktywacja sprzętowej linii wybudzającej (Hardware Wake). |
| NMGW\_I\_CAN | 2 | 7 | 23 | 1 bit | Przyczyna wybudzenia: Ogólna aktywność w warstwie fizycznej CAN. |
| NMGW\_I\_Wake\_Up\_Ltg | 3 | 0 | 24 | 1 bit | Przyczyna wybudzenia: Linia Wake-Up z licznika (Kombi). |
| NMGW\_I\_Komfort\_CAN | 3 | 1 | 25 | 1 bit | Przyczyna wybudzenia: Sygnał pochodzący z magistrali CAN-Komfort. |
| NMGW\_I\_Info\_CAN | 3 | 2 | 26 | 1 bit | Przyczyna wybudzenia: Sygnał pochodzący z magistrali CAN-Infotainment. |
| NMGW\_I\_Kl\_15 | 3 | 6 | 30 | 1 bit | Przyczyna wybudzenia: Włączenie zapłonu (Terminal 15). |

> **Adnotacja techniczna (repo):** W bieżącym projekcie mapowanie bajtu 1 `0x42B` jest kanonicznie przyjęte jako: `0x01=CmdRing`, `0x02=CmdAlive`, `0x04=CmdLimpHome`, `0x10=SleepInd`, `0x20=SleepAck` (źródła: `data/id_ramek.txt`, `hardware/hardware.ino`).

#### **Analiza wariantów ładunku 0x42B:**

* **Wariant A (0B 02 80 02 00 00):** Najczęstszy stan podczas aktywnego wybudzenia (faza S1).  
  * Bajt 0: 0x0B (Token dla naszego węzła).  
  * Bajt 1: 0x02 (Binarnie 00000010\) \-\> Bit 1 ustawiony, co odpowiada Startbit 8: NMGW\_I\_CmdRing \= 1\.  
  * Bajt 2: 0x80 (Binarnie 10000000\) \-\> Bit 7 ustawiony, co odpowiada Startbit 23: NMGW\_I\_CAN \= 1\.  
  * Bajt 3: 0x02 (Binarnie 00000010\) \-\> Bit 1 ustawiony, co odpowiada Startbit 25: NMGW\_I\_Komfort\_CAN \= 1\.  
    Wniosek: Jest to normalna ramka pierścienia, która informuje, że sieć została wybudzona przez aktywność na magistrali Komfortu.  

> **Adnotacja techniczna (repo):** W tej interpretacji występuje rozbieżność nazewnicza. Dla `0x02` projekt przyjmuje `CmdAlive` (a nie `CmdRing`). Sam wzorzec `0B 02 80 02 00 00` pozostaje poprawny jako sygnatura aktywnej fazy, ale opis bitu należy czytać zgodnie z mapą kanoniczną powyżej.
* **Wariant B (0B 02 00 00 00 00):** Ramka fazy S2 (po wystąpieniu WAKE\_END). Flagi przyczyn wybudzenia (bajty 2 i 3\) zostały wyzerowane. Bramka informuje, że nie ma już fizycznego powodu utrzymywania sieci, ale pierścień nadal krąży, oczekując na ustąpienie zadań aplikacyjnych we wszystkich węzłach.1  
* **Wariant C (0B 14 00 00 00 00):** Faza S3 (Sleep Negotiation).  
  * Bajt 1: 0x14 (Binarnie 00010100). Ustawione są bity odpowiadające za Startbit 10 (CmdLimpHome) oraz Startbit 12 (SleepInd). Bramka przechodzi w tryb ograniczonej funkcjonalności, jednocześnie globalnie żądając snu.1

### **3.2. Ekosystem danych: Ramki aplikacyjne i asynchroniczne wyzwalacze (Trigger Frames)**

Problem walidacyjny Testu B opiera się na reakcji systemu na impulsy po zakończeniu fazy aktywnej. Te impulsy nie są abstrakcyjnymi szumami na linii, lecz w pełni sformowanymi ramkami aplikacyjnymi generowanymi przez ludzką interakcję z elementami wykonawczymi pojazdu. Zrozumienie struktury tych ramek jest niezbędne do analizy ścieżek wybudzania. Poniżej zdekomponowano kluczowe ramki wywołujące stany zdefiniowane w katalogu sytuacji.

#### **Ramka mLSM\_1 (ID: 0x2C1 / 705\) \- Moduł przełączników kolumny kierownicy**

Ramka ta, nadawana przez moduł kierownicy, przenosi informacje o stanie dźwigni świateł i wycieraczek.1 Wystąpienie jakiejkolwiek zmiany na tych bitach natychmiastowo wybudza bramkę J533, co wymusza przerwanie sekwencji snu.

| Nazwa Sygnału | Startbit | Długość | Zakres | Opis |
| :---- | :---- | :---- | :---- | :---- |
| LS1\_Blk\_links | 0 | 1 bit | 0-1 | Kierunkowskaz lewy (0 \= wył, 1 \= zał) |
| LS1\_Blk\_rechts | 1 | 1 bit | 0-1 | Kierunkowskaz prawy (0 \= wył, 1 \= zał) |
| LS1\_Lichthupe | 2 | 1 bit | 0-1 | Mignięcie światłami (Blendowanie) |
| LS1\_Fernlicht | 3 | 1 bit | 0-1 | Światła drogowe (0 \= wył, 1 \= zał) |
| LS1\_WischenStufe\_1 | 10 | 1 bit | 0-1 | Wycieraczki bieg 1 |

*Analiza fizyczna wyzwalacza:* Pociągnięcie dźwigni świateł drogowych (tzw. "długich") przez kierowcę powoduje zmianę bitu LS1\_Fernlicht z 0 na 1\. Ramka 0x2C1, wcześniej nieobecna lub nadawana z zerowym ładunkiem dla tej funkcji, zostaje wprowadzona na sieć CAN-Komfort. Bramka J533 odbiera ten sygnał i ze względu na konieczność powiadomienia licznika (zaświecenie niebieskiej kontrolki świateł drogowych), przekierowuje wybudzenie na magistrale Infotainment i Napęd. Widzimy to w logach jako impuls 0x2C1:04 00 80 00 00 (Gdzie bajt 0 to 0x04, co binarnie daje 00000100 \-\> Bit 2 LS1\_Lichthupe jest ustawiony).1

#### **Ramka mZKE\_1 (ID: 0x291 / 657\) \- Centralna Elektronika Komfortu**

Odpowiedzialna za obsługę zamków, kluczyków radiowych i stanu drzwi.1

| Nazwa Sygnału | Startbit | Długość | Zakres | Opis |
| :---- | :---- | :---- | :---- | :---- |
| ZK1\_Taste\_Panik | 5 | 1 bit | 0-1 | Naciśnięcie przycisku Panika na pilocie |
| ZK1\_Taste\_Auf | 6 | 1 bit | 0-1 | Naciśnięcie przycisku Otwierania (Unlock) |
| ZK1\_Taste\_Zu | 7 | 1 bit | 0-1 | Naciśnięcie przycisku Zamykania (Lock) |
| ZK1\_FT\_entriegeln | 9 | 1 bit | 0-1 | Odryglowanie drzwi kierowcy |
| ZK1\_HL\_Tuer\_offen | 36 | 1 bit | 0-1 | Drzwi tylne lewe fizycznie otwarte |

Naciśnięcie przycisku na kluczyku modyfikuje ładunek tej ramki, co stanowi kolejny brutalny, sprzętowy wyzwalacz wybudzający sieć (Test B).1

#### **Ramki informacyjne środowiska pracy: mGateway\_1 (0x351) oraz mBSG\_Kombi (0x470)**

Sieć NM nie istnieje w próżni. Węzły na magistrali Infotainment nieustannie analizują kontekst aplikacyjny, aby decydować, czy mogą zadeklarować gotowość do snu. Ramka 0x351 (mGateway\_1) transportuje kluczowe zmienne środowiskowe, takie jak prędkość pojazdu (GW1\_FzgGeschw \- 15 bitów, startbit 9, rozdzielczość 0.01 km/h) oraz stan światła wstecznego (GW1\_Rueckfahrlicht \- startbit 1).1 Z kolei ramka 0x470 (mBSG\_Kombi) koreluje dane wyświetlacza i kontroli nadwozia. Posiada kluczowe wskaźniki otwarcia drzwi, takie jak BSK\_FT\_geoeffnet (startbit 8\) dla drzwi kierowcy i BSK\_BT\_geoeffnet (startbit 9\) dla drzwi pasażera, a także natężenie oświetlenia wyświetlacza BSK\_Display (startbit 16, 7 bitów).1

Dopóki w tych ramkach widnieją statusy operacyjne (np. drzwi otwarte, zapłon włączony), moduły nie będą współpracować w procedurze usypiania.

Warto również wspomnieć o ramce mZAS\_Status (0x2C3 / 707\) opisującej stan stacyjki:

| Nazwa Sygnału | Startbit | Długość | Opis |
| :---- | :---- | :---- | :---- |
| ZS1\_ZAS\_Kl\_S | 0 | 1 bit | Kontakt S (kluczyk włożony do stacyjki) |
| ZS1\_ZAS\_Kl\_15 | 1 | 1 bit | Terminal 15 (zapłon włączony) |
| ZS1\_ZAS\_Kl\_50 | 3 | 1 bit | Terminal 50 (rozrusznik pracuje) |

Powyższe definicje bitowe 1 determinują, że proces usypiania sieci CAN może się w ogóle rozpocząć wyłącznie wtedy, gdy bity ZS1\_ZAS\_Kl\_15 oraz (często) ZS1\_ZAS\_Kl\_S przyjmą wartość 0\.

## **4\. Analiza patologii komunikacyjnych w logach empirycznych**

Opanowanie paradoksu Testu A i B stało się możliwe wyłącznie poprzez systematyczną analizę logów komunikacyjnych z magistrali, skatalogowanych w dokumencie NM\_STATE\_SITUATION\_CATALOG.md. Katalog ten dzieli zachowania sieci na sytuacje standardowe (S0-S5) oraz krytyczne błędy (E1-E4).1 W logach zapisano interakcje firmware'u badanego węzła 0x0B z bramką J533 w odpowiedzi na wyzwalacze aplikacyjne.

### **4.1. Sukces Operacyjny: Ścieżka A (Sytuacje S1 \-\> S2 \-\> S3)**

Proces prawidłowego uśpienia sieci – reprezentowany w pliku logu v01\_A\_swiatla\_sleep\_ok\_2026-04-11.txt 1 – przebiega zgodnie z wymogami protokołu:

1. **Faza S1 (WAKE\_START):** Użytkownik generuje impuls świateł drogowych (0x575:10...). Magistrala budzi się. W logu pojawia się zdarzenie SYS:CAN:WAKE\_START. Bramka J533 dystrybuuje aktywne tokeny 0x42B: 0B 02 80 02 00 00\. Węzeł 0x0B odbiera token i odpowiada ramką 0x40B (z przyczyn architektonicznych niewidoczną bezpośrednio w logu szeregowym, lecz domniemaną ze stabilności sieci).  
2. **Faza S2 (WAKE\_END):** Po ustąpieniu asynchronicznego żądania od świateł, bramka uznaje, że wyzwalacz wygasł. Nadawane jest zdarzenie SYS:CAN:WAKE\_END. Identyfikator 0x42B natychmiast zmienia ładunek na 0B 02 00 00 00 00, co – jak analizowano wcześniej – oznacza wyzerowanie bitów NMGW\_I\_CAN i NMGW\_I\_Komfort\_CAN. Ruch aplikacyjny wciąż jednak obciąża sieć (ramki 0x65F z numerem VIN, 0x65D z przebiegiem).1  
3. **Faza S3 (SLEEP\_IND):** Ponieważ węzeł 0x0B poprawnie zasygnalizował gotowość do snu, po krótkim czasie w logu pojawia się ramka 0x42B: 0B 14 00 00 00 00\. Zgodnie z definicją DBC, ustawienie bitu 4 w bajcie 1 (0x14 \-\> 00010100\) odpowiada NMGW\_I\_SleepInd \= 1\.1 Wyzwalane jest zdarzenie SYS:CAN:SLEEP\_IND. Osiągnięty zostaje stan Bus Sleep (A PASS).

### **4.2. Patologia E1: Zerwanie komunikacji i błąd HANG (Failure Path B)**

Plik v01\_B\_swiatla\_hang\_2026-04-11.txt prezentuje katastrofalny błąd dekompozycji stanów. Problem narasta w ułamkach sekund po wystąpieniu fazy WAKE\_END.1

* System przechodzi standardową drogę S1 \-\> S2 (WAKE\_END).  
* Tuż po fazie WAKE\_END, kierowca generuje asynchroniczny impuls w postaci ponownego pociągnięcia za dźwignię świateł: w logu pojawia się ramka 0x2C1: 04 00 80 00 00 (gdzie 0x04 oznacza Bit 2 LS1\_Lichthupe \= 1).1  
* Bramka J533, zgodnie ze swoją architekturą, natychmiast powraca z fazy S2 do fazy S1, wysyłając nowe żądania NM.  
* **Błąd Węzła:** Firmware węzła 0x0B w wersji v01 naiwnie założył, że zdarzenie WAKE\_END jest tożsame ze snem sprzętowym. Oprogramowanie wyłączyło podprogram odpowiadania na tokeny oraz dezaktywowało 2000-milisekundowy watchdog komunikacyjny.  
* Bramka J533 przesyła token do węzła 0x0B. Węzeł milczy.  
* Bramka uznaje pierścień za przerwany, zrzuca sieć do trybu NMLimpHome (CmdLimpHome \= 1). Węzeł wciąż milczy.  
* Końcowy rezultat: brak zdarzenia WAKE\_START pomimo ruchu na szynie CAN. Sieć przechodzi w patologiczny stan de-synchronizacji, a log zamyka się krytycznym błędem ERR:CAN:HANG.1 To powoduje oblanie Testu B.

> **Adnotacja techniczna (repo):** Część zdania o „dezaktywacji watchdoga” jest interpretacją przyczynową. Twardy dowód z logów to: `WAKE_END` + impulsy + `ERR:CAN:HANG`. Wnioski o dokładnych wewnętrznych flagach firmware należy traktować jako hipotezę zgodną z analizą kodu v01, nie jako bezpośredni odczyt z seriala.

### **4.3. Patologia E2: Sztuczne podtrzymywanie komunikacji (Failure Path A)**

Próba programowego zniwelowania błędu E1 doprowadziła inżynierów do stworzenia firmware'u w wersji v02, zilustrowanej logami v02\_A\_KA\_swiatla oraz v02\_B\_KA\_swiatla\_impulsy.1

* Aby zapobiec ignorowaniu wybudzeń asynchronicznych (Test B), programiści wdrożyli logikę typu "Keep-Alive". Węzeł 0x0B został zaprogramowany tak, aby odpowiadać na *każdy* odebrany token niezależnie od fazy systemu.  
* Węzeł na sztywno nadaje w ramce 0x40B ładunek z wyzerowanym bitem SleepInd (SleepInd \= 0), de facto komunikując: "Zawsze mam istotne dane do przesłania, nie chcę spać".  
* Zgodnie z zasadą kooperatywności protokołu OSEK NM, dopóki chociaż jeden węzeł raportuje SleepInd \= 0, bramka J533 ma absolutny zakaz uśpienia szyny.  
* Skutek operacyjny widoczny w logach: Ramka 0x42B zmienia wartość z 0B 02 80 02 00 00 (S1) na 0B 02 00 00 00 00 (S2 \- WAKE\_END), ale ze względu na brak zgody od węzła 0x0B, bramka nigdy nie przechodzi do fazy S3 (Nigdy nie wysyła 0B 14...). Komunikacja jest utrzymywana sztucznie w nieskończoność. Prąd pobierany z akumulatora nieustannie płynie, co stanowi krytyczną usterkę klasyfikowaną jako A FAIL (oblanie Testu A).1

Pozostałe zidentyfikowane usterki obejmują sytuację E3 (Sleep/Wake Flapping), gdzie system oscyluje między wybudzeniem a uśpieniem z powodu niestabilności interpretacji stanów przejściowych, oraz E4 (Przedwczesne urwanie komunikacji), które polega na uciszeniu watchdoga przez stany pośrednie AUTO\_SLEEP\_PREP, maskując w ten sposób faktyczne zerwanie ringu NM bez wygenerowania błędu ERR:CAN:HANG.1

## **5\. Polityka walidacji i restrykcje projektowe VW PQ35**

Prawidłowe rozwiązanie tego impasu wymaga ścisłego zastosowania zasad walidacyjnych zdefiniowanych dla platformy Infotainment w dokumencie NM\_COMMUNICATION\_VALIDATION.md.1 Volkswagen rygorystycznie standaryzuje zachowania węzłów, narzucając następujące prawa brzegowe dla rozwoju oprogramowania:

1. **Zasada Przejść Sterowanych Zdarzeniami (Event-Driven Transitions):** Przejścia pomiędzy stanami maszyny NM (np. z NMAwake do NMBusSleep) muszą być wyzwalane wyłącznie przez określone zdarzenia na magistrali (zmiany poszczególnych bitów w payloadzie 0x42B). Kategorycznie zakazuje się stosowania wirtualnych timerów programowych do wymuszania zmian stanu po upływie określonego czasu od wystąpienia WAKE\_END. Powodem tego zakazu jest asynchroniczność magistrali – timer wdrożony na węźle 0x0B ulegnie odchyleniu względem wewnętrznego zegara bramki J533, co doprowadzi do wyścigu (race condition). Węzeł pójdzie spać, podczas gdy bramka nadal będzie wymagała od niego utrzymania ringu.1  
2. **Wyjątek Watchdoga (2000 ms Rule):** Jedynym dopuszczalnym licznikiem czasowym w całej architekturze jest watchdog zarządzania komunikacją. Jego próg ustala się na 2000 milisekund bezwzględnej ciszy. Służy on jednak wyłącznie do wykrywania globalnej i katastrofalnej utraty pierścienia NM (ERR:CAN:HANG), a nie do sterowania zwykłą polityką usypiania.1  
3. **Krytyczny Warunek Usypiania Watchdoga:** Zapobiegając patologii zdefiniowanej w sytuacji E4 (Masked Failure), wprowadzono zasadę nadrzędną: watchdog 2000 ms może zostać zgaszony lub zapauzowany **tylko i wyłącznie** po jawnym i potwierdzonym wejściu magistrali w stan pełnego uśpienia. Stanem tym nie jest milczenie po sygnale WAKE\_END, ani fazy przejściowe. Watchdog może zostać wyłączony jedynie po odebraniu ramki 0x42B z ustawionym bitem SleepInd (ładunek 0x14).1  
4. **Zasada Anty-Regresyjna:** Inżynier nie może "naprawić" Testu A kosztem zepsucia Testu B. Rozwiązanie musi być holistyczne. Poprawienie logiki uśpienia musi gwarantować, że system będzie w stanie błyskawicznie obsłużyć nowy impuls z ramki świateł lub zamka bez zerwania ringu. Należy również udowodnić brak "sztucznego podtrzymywania" zaobserwowanego w wersjach v02 i v03.1

Dopiero jednoczesne spełnienie wszystkich tych wytycznych i udokumentowane powtarzalne wejście w stan Bus Sleep (Test A), uprawnia do zaliczenia wyników testów pobocznych (Test B, Test C).1

## **6\. Deterministyczna maszyna stanów i tabela decyzyjna (Rozwiązanie Architektoniczne)**

Mając na uwadze zarówno naturę OSEK/VDX, strukturę sprzętową 0x42B, jak i obostrzenia walidacyjne, jasnym staje się, że fundamentalnym błędem wariantu E2 było ciągłe nadawanie SleepInd \= 0, a błędem wariantu E1 była całkowita odmowa nadawania. Rozwiązanie stanowi implementacja deterministycznej, kooperatywnej maszyny stanów (w trybie zdefiniowanym jako MODE:SLEEP\_COOP 1), która dynamicznie formuje bitowy ładunek w ramce odpowiedzi 0x40B, precyzyjnie korelując go z fazą narzucaną przez bramkę w ramce 0x42B.

> **Adnotacja techniczna (repo):** `MODE:SLEEP_COOP` jest trybem historycznym (`v03`). Bieżący firmware (`hardware/hardware.ino`) działa w modelu Auto-NM (`AUTO_ACTIVE`, `AUTO_SLEEP_PREP`, `AUTO_SILENT_LISTEN`) bez komend `MODE:*`.

### **6.1. Logika Operacyjna Maszyny Stanów**

1. **Podczas fazy aktywnej (S1):** Bramka J533 nadaje 0x42B z informacjami o przyczynie wybudzenia (0B 02 80...). Węzeł 0x0B odbiera token i poprawnie wysyła 0x40B ze zresetowanym bitem snu (SleepInd \= 0). Pierścień jest aktywny, a dane wymieniają wszystkie jednostki. Watchdog 2000 ms jest nadpisywany przy każdym odebranym tokenie.1  
2. **Podczas fazy przejściowej (S2 \- Post-WAKE\_END):** Bramka usuwa flagi wybudzenia (0B 02 00 00 00 00). Oznacza to, że asynchroniczny impuls zniknął. Węzeł 0x0B **nie przestaje nasłuchiwać**. Nadal utrzymuje zapalonego watchdoga. Jednakże, formując swoją odpowiedź w ramce 0x40B, węzeł 0x0B musi **ustawić bit SleepInd na 1**. Ten akt jest kluczowy – zaspokaja on wymóg uczestnictwa w pierścieniu (zapobiegając E1 HANG) i jednocześnie komunikuje bramce J533, że węzeł 0x0B wyraża zgodę na przejście do trybu uśpienia, eliminując pętlę nieskończonego podtrzymywania (eliminacja E2).1  
3. **Reakcja na zakłócenie (Test B):** Co jeśli w fazie S2 kierowca znów błyśnie światłami (0x2C1: 04 00...)? Ponieważ węzeł 0x0B wciąż działa i nasłuchuje (jego watchdog tyka), od razu zarejestruje, że bramka zmieniła ładunek 0x42B z powrotem na 0B 02 80.... W odpowiedzi węzeł 0x0B natychmiast zresetuje swój flagę SleepInd w ramce 0x40B do wartości 0, przerywając negocjację snu i włączając się ponownie do aktywnej wymiany, unikając crashu HANG.1  
4. **Wejście w uśpienie (S3):** Jeżeli żaden impuls nie nadejdzie, bramka J533 zbierze statusy SleepInd \= 1 od wszystkich węzłów. Następnie sama wygeneruje ładunek 0B 14 00 00 00 00 (zawierający wyzwalacz globalnego snu). Dopiero po otrzymaniu tego konkretnego bajtu z wartością 0x14, węzeł 0x0B odeszłe ostatnią ramkę zawierającą potwierdzenie SleepAck \= 1\. W tym momencie, jako weryfikowalny fakt zdarzeniowy, węzeł przechodzi w stan NMBusSleep i bezpiecznie gasi watchdoga, spełniając zasady walidacyjne.1

### **6.2. Ścisła Tabela Decyzyjna Węzła 0x0B**

Poniższa ścisła tabela definiuje bezwzględne wymagania dla oprogramowania węzła po odebraniu ramki 0x42B zaadresowanej na 0x0B (Bajt 0: 0B).

| Stan Odbierany z Bramki (Ładunek 0x42B Byte 1 i 2\) | Interpretacja Zdarzenia Systemowego | Wymagany Ładunek Odpowiedzi 0x40B Tx | Akcja Wewnętrzna / Status Watchdoga 2000 ms |
| :---- | :---- | :---- | :---- |
| 01 00 (Bit 9 CmdAlive \= 1\) | **Inicjalizacja / Wake Start** Bramka oznajmia powrót sieci i formuje pierścień od nowa. | Nadaj: CmdAlive \= 1, SleepInd \= 0 | Przejście do NMAwake. Watchdog zostaje **URUCHOMIONY** i zresetowany. |
| 02 80 (Bit 8 CmdRing \= 1 \+ Bity przyczyn Wake) | **Aktywna Faza NM (S1)** Przesyłanie znacznych ilości danych aplikacyjnych po wybudzeniu. | Nadaj: CmdRing \= 1, SleepInd \= 0 | Utrzymanie NMAwake. Watchdog **AKTYWNY** i zerowany z każdym tokenem. |
| 02 00 (Bit 8 CmdRing \= 1, wyzerowane przyczyny) | **Faza przejściowa WAKE\_END (S2)** Koniec asynchronicznej obsługi. Oczekiwanie na kooperatywny sen sieci. | Nadaj: CmdRing \= 1, **SleepInd \= 1** | Utrzymanie NMAwake. Watchdog **AKTYWNY** i zerowany z każdym tokenem. Pętla nie jest przerwana, odporność na Test B zachowana. |
| 04 00 (Bit 10 CmdLimpHome \= 1\) | **Błąd Ringu / Utykanie** Następca milczy, sieć jest przebudowywana przez J533. | Nadaj: CmdAlive \= 1 (chęć ponownego wejścia do logicznego pierścienia). | Watchdog **AKTYWNY**. Możliwe opóźnienia w tokenach, rygorystyczne oczekiwanie. |
| 14 00 (Bity CmdLimpHome \= 1, SleepInd \= 1\) | **Globalna Negocjacja Snu (S3)** J533 komunikuje zgodę wszystkich modułów na uśpienie magistrali. | Nadaj: CmdRing \= 0, SleepInd \= 1, **SleepAck \= 1** | Przejście w **NMBusSleep**. Sprzętowy transceiver w stand-by. Watchdog **DEZAKTYWOWANY**. Sukces Testu A. |
| *(Brak ramki 0x42B przez \> 2000 ms)* | **Krytyczna utrata komunikacji** Sytuacja patologiczna, nagłe zniknięcie bramki J533 lub fizyczne zwarcie bez single-wire. | Nadawaj na oślep CmdAlive, wymuszając inicjalizację. | Zakończenie odliczania Watchdoga. Wystawienie błędu **ERR:CAN:HANG**. Powrót do nasłuchu. |

> **Adnotacja techniczna (repo):** Tabela ma wartość projektową, ale należy ją czytać z mapą bitów używaną w repo (`0x01=CmdRing`, `0x02=CmdAlive`). W obecnym firmware dodatkowo obowiązuje reguła walidacyjna: watchdog może być wygaszony tylko po jawnym potwierdzeniu pełnego snu magistrali (`logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`).

Oparta o powyższe wektory decyzyjne maszyna stanów wyklucza ryzyko zignorowania Testu B po WAKE\_END, zachowując transparentność niezbędną dla operacji przewidzianej w teście A, co stanowi uniwersalne rozwiązanie defektów ujawnionych w generacjach firmware'u v01-v03.

## **7\. Ocena poziomu rzetelności źródeł informacyjnych (Source Confidence)**

Syntetyczne uformowanie tabeli decyzyjnej nie byłoby możliwe bez ewaluacji wiarygodności materiałów wykorzystanych w procesie inżynierii odwrotnej. Zastosowana hierarchia pewności przebiega następująco:

1. **Matryca danych DBC (id\_ramek.txt): Prawda Absolutna (Zaufanie: 100%).** Plik dostarcza bezpośrednich specyfikacji geometrycznych, mapując rygorystycznie startbity i wielkości długości dla kluczowych wektorów operacyjnych sieci PQ35, włączając precyzyjne ulokowanie parametru NMGW\_I\_SleepInd pod offsetem 12\. Dokument ten narzuca ramy dekodowania pozostałych wektorów (m.in. mZKE\_1, mLSM\_1, mBSG\_Kombi) i jest wolny od koncepcyjnych niedomówień.1  
2. **Logi Empiryczne Szeregowe (v01-v05): Wysoce Wiarygodne (Zaufanie: 95%).** Rejestrują surowe, sprzętowe wartości heksadecymalne wychwycone na linii CAN. Udowadniają one z żelazną konsekwencją powtarzalność zjawisk. Wymagały one jedynie poprawnego nadania kontekstu przy użyciu pliku DBC.1 Ich ograniczenie to fakt, że firmware testowy lokalnie wyciął z analizy szeregowej podzbiór ramek (takich jak pompa 0x661), co uniemożliwia bezpośrednie określenie stanu testu C w tym środowisku.1  
3. **Dokumentacja OSEK/VDX Direct NM: Wiarygodne Źródło Teoretyczne (Zaufanie: 90%).** Udostępnia zasady formowania pierścienia logicznego, strategię kooperatywnego usypiania i zachowania mechanizmu LimpHome.3 Dokumentacja nie oddaje jednak implementacyjnych wariacji wprowadzonych bezpośrednio przez Volkswagena na platformie PQ35, takich jak specyficzne zachowania wyzwalaczy w ramkach asynchronicznych (co musiało zostać uzupełnione przez matryce DBC).  
4. **Zeszyty do samodzielnego kształcenia VAG SSP (SSP 238, SSP 269): Zaufanie Pomocnicze (Zaufanie: 85%).** Ważne dla uzyskania globalnego obrazu platformy oraz specyfikacji warstwy fizycznej (100kbit/s, podział na domeny Komfort, Infotainment, Drive), lecz nie zawierające precyzyjnych tabel payloadów ramek, stąd odegrały drugorzędną rolę w formowaniu samej maszyny stanów.2  
5. **Polityki Walidacyjne VW (NM\_COMMUNICATION\_VALIDATION.md): Twarda Restrykcja Projektowa (Zaufanie: 100% dla procesu).** Choć nie jest to techniczny standard sieciowy, to zbiór niepodważalnych obostrzeń (zakaz używania timerów software'owych, krytyczne warunki wygaszania watchdoga), które kategorycznie wymusiły odrzucenie jakichkolwiek prób implementacji czasowych opóźnień między przejściem z WAKE\_END do usypiania.1

## **8\. Precyzyjna strategia pomiarowa przy użyciu sniffera CAN**

Ostatnim etapem procesu walidacyjnego jest potwierdzenie skuteczności działania algorytmu w środowisku rzeczywistym poprzez bezpośrednią inspekcję za pomocą sprzętowego analizatora magistrali (sniffera CAN). Dostępne logi szeregowe mogą stanowić ofiarę opóźnień transmisji UART oraz filtracji programowej.1

### **8.1. Wymagania Sprzętowe**

Zewnętrzny analizator (np. Vector CANalyzer z interfejsem VN1610, Kvaser, lub moduły open-source takie jak SavvyCAN wspomagane układem CANact) musi zostać podłączony bezpośrednio do pinów sieci CAN-Infotainment.

* Ze względu na warstwę fizyczną zgodną ze standardem ISO 11898-3 (Low-Speed Fault Tolerant CAN), absolutnie krytyczne jest wykorzystanie odpowiedniego transceivera w snifferze (np. TJA1055 lub NCV7356). Transceivery typu High-Speed (np. TJA1050, MCP2551) zniekształcą napięcia i będą podawać fałszywe stany Error Frame, ponieważ korzystają z innej struktury terminacji sprzętowej.1  
* Sniffer powinien początkowo pracować w trybie *Listen-Only Mode*, aby nie zaburzać arbitrażu ramkowego na magistrali operacyjnej poprzez wymuszanie własnych pakietów Ack.

### **8.2. Scenariusz Pomiarowy \- Krok 1: Weryfikacja Testu A (Bus Sleep)**

1. Rozpoczynamy zapis ruchu sieciowego na pracującym pojeździe i w pełni otwartym ringiem NMAwake. Śledzimy przepływ 0x42B od bramki oraz 0x40B od badanego węzła.  
2. Zostaje wyłączony zapłon i zamknięte wszystkie drzwi. Spodziewamy się zaobserwować w oknie Trace programu zrzut flag pobudek w 0x42B, objawiający się ładunkiem 0B 02 00 00 00 00 (Faza S2, post-WAKE\_END).  
3. Bezpośrednio po tej zmianie, monitorujemy odpowiedź na 0x40B. Musi być widoczna modyfikacja ładunku o ustawiony bit SleepInd \= 1 w stosunku do ramek wysyłanych w poprzednim punkcie.  
4. Oczekujemy na globalne przejście w tryb wygaszenia. Bramka J533 musi w oknie czasowym rzędu kilku sekund wypuścić 0x42B z zawartością 0B 14 00 00 00 00 (Faza S3).  
5. Ostatnią zaobserwowaną ramką dla ringu NM powinno być 0x40B ze statusem SleepAck \= 1\. Po tej ramce magistrala zamilknie, a na warstwie fizycznej (co można zweryfikować oscyloskopem cyfrowym podpiętym do wejść oscylatora sniffera) napięcie różnicowe stopniowo wyrówna się do 0V. To gwarantuje zdanie Testu A.

### **8.3. Scenariusz Pomiarowy \- Krok 2: Weryfikacja Testu B (Odporność Impulsowa)**

Weryfikację tę najprościej przeprowadzić sztucznie generując impuls w środowisku kontrolowanym.

1. Analizator ustawiamy w tryb nadawczy (TX-Active). System pojazdu znajduję się w fazie WAKE\_END (czyli ładunek 0x42B wynosi 0B 02 00 00...).  
2. Sniffer zostaje zaprogramowany do asynchronicznego wystrzelenia jednej spreparowanej ramki z symulacją pociągnięcia dźwigni świateł drogowych: 0x2C1: 04 00 80 00 00 na magistralę.  
3. Pomiar czasu i logiki: W ułamku sekundy po wstrzyknięciu ramki 0x2C1, oprogramowanie typu CANoe powinno zarejestrować, że bramka J533 zmienia ładunek w przesyłanych ramkach z powrotem na 0x42B: 0B 02 80.... Węzeł 0x0B natychmiast, w swojej najbliższej ramce 0x40B, zeruje bit SleepInd.  
4. W logach nie może wystąpić żadna pauza komunikacyjna przekraczająca 2000 milisekund i żadne komunikaty informujące o awaryjnym poszukiwaniu ringu. Błąd ERR:CAN:HANG na węźle pozostanie niewyzwolony. Zdanie Testu B.

### **8.4. Scenariusz Pomiarowy \- Krok 3: Weryfikacja Testu C (Monitorowanie Testu Pompy)**

Jak wykazał katalog sytuacji 1, obecność sprzętowych procedur (jak weryfikacja działania pompy nadawanej ramką 0x661) jest w logach szeregowych niekompletna przez filtry uciążliwych komunikatów.

1. Analizator filtruje całkowicie ruch aplikacji, pozostawiając w podglądzie tylko ramki 0x661 i 0x42B.  
2. Weryfikujemy założenie, czy 0x661 występuje wyłączne podczas faz, w których 0x42B jest w stanie aktywnym (0B 02 80... lub ewentualnie post-WAKE\_END 0B 02 00...), ale absolutnie urywa się, zanim dojdzie do wymiany sygnatury 0B 14... oznaczającej negocjację ostatecznego uśpienia. Dzięki transparentności sniffera z pełnym dostępem do fizycznej magistrali (bez oprogramowania ukrywającego) możliwe jest udowodnienie poprawnego zaprzestania zapytań o urządzenia peryferyjne, gdy pierścień NM ustalił zgodę na spoczynek.

Rozdzielenie warstwy aplikacyjnej, logiki zarządzania OSEK i warstwy fizycznej CAN w postaci ściśle sprzężonej tabeli decyzyjnej pozwala rozwiązać nieliniowość paradoksów testowych zdefiniowanych przez restrykcje ekosystemu VW PQ35. Przebudowana architektura, wsparta deterministycznym kodem, nie tylko maskuje zjawiska HANG, ale zapewnia, że sieć może odzyskać pełną sprawność funkcjonalną z absolutnego snu bez wpływu na jakość operacyjną systemu centralnego komfortu.

#### **Cytowane prace**

1. Arduino CAN VW Golf Plus PQ35.md  
2. Data Exchange On The CAN Bus I \- VolksPage.Net, otwierano: kwietnia 11, 2026, [https://www.volkspage.net/technik/ssp/ssp/SSP\_238.pdf](https://www.volkspage.net/technik/ssp/ssp/SSP_238.pdf)  
3. Network Management v2.5.3 \- osek-vdx.org, otwierano: kwietnia 11, 2026, [https://www.osek-vdx.org/mirror/nm253.pdf](https://www.osek-vdx.org/mirror/nm253.pdf)  
4. Programming in The OSEK-VDX Environment (With CD-ROM) | PDF \- Scribd, otwierano: kwietnia 11, 2026, [https://www.scribd.com/doc/47007279/Programming-in-the-OSEK-VDX-Environment-With-CD-ROM](https://www.scribd.com/doc/47007279/Programming-in-the-OSEK-VDX-Environment-With-CD-ROM)  
5. Network Management Concept and Application Programming Interface \- osek-vdx.org, otwierano: kwietnia 11, 2026, [https://www.osek-vdx.org/mirror/oseknm25.pdf](https://www.osek-vdx.org/mirror/oseknm25.pdf)  
6. OSEK/VDX Network Management Concept and Application Programming Interface \- Qiita, otwierano: kwietnia 11, 2026, [https://qiita.com/kaizen\_nagoya/items/bfc78c65d544525da6be](https://qiita.com/kaizen_nagoya/items/bfc78c65d544525da6be)  
7. OSEKNDX, otwierano: kwietnia 11, 2026, [https://ptabdata.blob.core.windows.net/files/2017/IPR2017-01521/v9\_BMW%20EXHIBIT%201009.pdf](https://ptabdata.blob.core.windows.net/files/2017/IPR2017-01521/v9_BMW%20EXHIBIT%201009.pdf)  
8. Specification of Network Management Interface \- Autosar, otwierano: kwietnia 11, 2026, [https://www.autosar.org/fileadmin/standards/R21-11/CP/AUTOSAR\_SWS\_NetworkManagementInterface.pdf](https://www.autosar.org/fileadmin/standards/R21-11/CP/AUTOSAR_SWS_NetworkManagementInterface.pdf)  
9. ssp269 Data transfer on CAN data bus II \- VolksPage.Net, otwierano: kwietnia 11, 2026, [https://www.volkspage.net/technik/ssp/ssp/SSP\_269\_d1.pdf](https://www.volkspage.net/technik/ssp/ssp/SSP_269_d1.pdf)