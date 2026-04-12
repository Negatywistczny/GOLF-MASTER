# Katalog stanów i sytuacji NM/CAN (pełna analiza logów v01-v05)

## Cel dokumentu

Ten dokument grupuje **wszystkie zaobserwowane sytuacje** z logów `v01...v05` w jeden katalog operacyjny, bez powielania wariantów o tej samej semantyce.

Dla każdej sytuacji podano:
- dokładne sygnatury ramek z logów (zwłaszcza `0x42B`),
- ramki tła i ramki wyjątkowe,
- ocenę stanu magistrali (aktywna/ograniczona/zerwany przepływ),
- zalecenie: **co wysyłać do magistrali** (`0x40B`) i czego nie robić.

## Zakres danych i ograniczenia

- Źródła: wszystkie logi `logs/2026-04-11/v*.txt` (v01, v02, v03, v04, v04_1, v05).
- `0x40B` i `0x661` nie są widoczne bezpośrednio w serialu (filtrowane przez firmware), więc ich ocena jest pośrednia (na podstawie skutków w `0x42B`, zdarzeń `SYS:*` i kondycji ruchu).
- Mapowanie bitów NM (`CmdRing`, `CmdAlive`, `CmdLimpHome`, `SleepInd`, `SleepAck`) przyjmujemy z `data/id_ramek.txt` (kanoniczne).
- Punkt odniesienia dla spójności nazewnictwa i klasyfikacji dowodów: `logs/2026-04-11/NM_CANONICAL_BASELINE.md`.

## Rozróżnienie obowiązkowe: procedura usypiania magistrali vs zdarzenie `SleepInd`

Te pojęcia **nie** są zamienne — mylenie ich prowadzi do błędnych wniosków w dokumentacji i interpretacji logów.

1. **Procedura usypiania magistrali** (w sensie Testu A / pełnego cyklu): to **sekwencja stanów i decyzji Gatewaya oraz węzłów**, która **może w ogóle nie zostać rozpoczęta**. W profilu **v02** (ciągła odpowiedź NM na token, „keepalive pierścienia”) węzeł **aktywnie podtrzymuje pierścień**, więc Gateway **nie wchodzi** w dalszą fazę koordynacji snu Infotainment. W takim przypadku **zjawisko usypiania nie ma prawa się rozpocząć** — mówimy o **braku startu procedury**, a nie o „złej obsłudze któregoś kroku po drodze”.

2. **`SleepInd`** (bit w bajcie 1 ramki `0x42B`, zbocze → `SYS:CAN:SLEEP_IND` na serialu): to **konkretne zdarzenie CAN w już trwającej** sekwencji koordynacji snu (po wcześniejszych warunkach systemowych). **Nie** opisuje samego faktu „magistrala zaczęła się usypiać” w abstrakcji — w **v02** typowo **nie występuje**, bo **wcześniejsza faza** (wejście w procedurę prowadzącą do tego bitu) **nie następuje**.

3. **Wniosek dla logów:** **brak `SYS:CAN:SLEEP_IND`** w logu **v02** oznacza najczęściej, że **do etapu, w którym Gateway nadaje `SleepInd`, się nie doszło** — to **nie to samo** co „nie zareagowaliśmy na `SleepInd`” ani „problem po `SleepInd`”.

---

## Sytuacja S0: Start firmware i gotowość sesji

**Sygnatura zdarzeń**
- `SYS:HW:READY`
- `SYS:CAN:NM_MODE_AUTO` (w wersjach auto-NM)

**Ramki magistrali**
- Początek strumienia ramek tła po inicjalizacji (bez jeszcze jawnego `WAKE_START`).

**Ramki wyjątkowe dla tej sytuacji**
- Brak unikalnych CAN ID; wyróżnikiem są linie `SYS:*`.

**Stan magistrali**
- Sesja pomiarowa uruchomiona; stan logiczny NM jeszcze niepotwierdzony.

**Jak działać (TX)**
- Nie wymuszać żadnego stanu NM na timerze.
- Czekać na pierwszą sekwencję `0x42B` adresowaną do `0x0B`.

---

## Sytuacja S1: Wybudzenie i aktywna faza NM

**Sygnatura zdarzeń**
- `SYS:CAN:WAKE_START`
- dominujące wzorce `0x42B`:
  - `0x42B: 0B 02 80 02 00 00`
  - `0x42B: 0B 01 00 00 00 00`

**Ramki magistrali (powtarzalne tło)**
- Bardzo często: `0x65F`, `0x65D`
- Regularnie: `0x351`, `0x527`, `0x557`, `0x651`
- Zależnie od scenariusza: `0x2C1` (manetka), `0x291` (zamek)

**Ramki wyjątkowe**
- `0x42B: 0B 02 80 02 00 00` (aktywna przyczyna wake) jest sygnaturą startu aktywnej sesji.

**Stan magistrali**
- Magistrala aktywna, ruch szeroki, wiele modułów nadaje.

**Jak działać (TX)**
- Odpowiadać `0x40B` tylko gdy token jest do `0x0B` (`Receiver=0x0B`).
- Obsługiwać `CmdRing/CmdAlive/CmdLimpHome` zgodnie z `id_ramek.txt`.
- Nie przechodzić do ciszy bez zdarzeń `SleepInd/SleepAck/WAKE_END`.

---

## Sytuacja S2: Koniec aktywnego wake i faza post-WAKE_END

**Sygnatura zdarzeń**
- `SYS:CAN:WAKE_END`
- `0x42B` przechodzi głównie na:
  - `0x42B: 0B 02 00 00 00 00`
  - `0x42B: 0B 01 00 00 00 00`

**Ramki magistrali**
- Nadal obecne `0x65F`, `0x65D`, czasem `0x351`, `0x557`, `0x651`.

**Ramki wyjątkowe**
- Brak `0x80 02` w payloadzie `0x42B` (wygaszenie aktywnej przyczyny wake).

**Stan magistrali**
- Magistrala zwykle nadal nadaje ramki; to nie jest jeszcze potwierdzony pełny sen.

**Jak działać (TX)**
- Kontynuować odpowiedzi NM tylko zdarzeniowo (token do nas).
- Nie traktować samego `WAKE_END` jako „pełny sen”.
- Nie wygaszać watchdoga z powodu samego wejścia w stan pośredni.

---

## Sytuacja S3: Negocjacja snu i prawidłowe domknięcie ścieżki A

**Sygnatura zdarzeń**
- `SYS:CAN:SLEEP_IND`
- w `0x42B` pojawiają się:
  - `0x42B: 0B 04 00 00 00 00` (Limp)
  - `0x42B: 0B 14 00 00 00 00` (Limp + SleepInd)

**Ramki magistrali**
- Ruch wyraźnie maleje po sekwencji sleep; pozostają tylko końcówki tła.

**Logi referencyjne**
- `v01_A_swiatla_sleep_ok_2026-04-11.txt`
- `v01_A_zamek_sleep_ok_2026-04-11.txt`
- `v04_1_A_sleep_gate_cisza_2026-04-11.txt`

**Stan magistrali**
- Prawidłowe przejście do snu (A PASS), bez `ERR:CAN:HANG`.

**Jak działać (TX)**
- Odpowiadać tylko tyle, ile wymaga domknięcie protokołu NM.
- Po potwierdzonym pełnym śnie przejść do pasywnego nasłuchu.
- Watchdog wolno wygasić dopiero po jawnym potwierdzeniu pełnego snu.

---

## Sytuacja S4: Impulsy po WAKE_END przy zachowanej odporności (B technicznie OK)

**Sygnatura zdarzeń**
- `WAKE_END`, następnie impulsy użytkownika:
  - `0x2C1` (manetka) lub `0x291` (zamek)
- Brak `ERR:CAN:HANG`.

**Ramki magistrali**
- `0x42B` nadal obecne po impulsach.
- Tło `0x65F`, `0x65D`, `0x571` pozostaje aktywne.

**Logi referencyjne**
- `v02_B_KA_swiatla_impulsy_2026-04-11.txt`
- `v03_B_KA_impulsy_2026-04-11.txt`
- `v03_B_SC_impulsy_2026-04-11.txt`

**Stan magistrali**
- Ciągłość techniczna zachowana, ale możliwe sztuczne podtrzymanie NM.

**Jak działać (TX)**
- Utrzymać poprawną odpowiedź na `CmdLimpHome` (brak zerwania pierścienia).
- Jednocześnie nie przejść w „always-keepalive”, który **uniemożliwia rozpoczęcie** procedury usypiania (patrz [Rozróżnienie obowiązkowe](#rozróżnienie-obowiązkowe-procedura-usypiania-magistrali-vs-zdarzenie-sleepind)).

---

## Sytuacja E1: Zerwanie komunikacji z `ERR:CAN:HANG` (B FAIL)

**Sygnatura zdarzeń**
- `WAKE_END` + impulsy (`0x2C1`/`0x291`) + końcowo `ERR:CAN:HANG`.

**Ramki magistrali**
- Przed błędem ruch istnieje (`0x42B`, `0x65F`, `0x65D`), ale kontrakt NM dla naszego węzła się rozjeżdża.

**Logi**
- `v01_B_swiatla_hang_2026-04-11.txt`
- `v01_B_zamek_hang_2026-04-11.txt`
- `v04_1_B_impulsy_po_Apass_2026-04-11.txt`

**Stan magistrali**
- Komunikacja nie jest poprawnie utrzymywana przez nasz węzeł w scenariuszu B.

**Wniosek i działanie (TX)**
- To jest regresja krytyczna.
- Obowiązkowa odpowiedź na token do `0x0B`, zwłaszcza dla `CmdLimpHome`.
- Nie wolno przechodzić do trwałego milczenia, jeśli Gateway nadal prowadzi cykl NM z naszym node.

---

## Sytuacja E2: Sztuczne podtrzymywanie komunikacji, brak domknięcia snu (A FAIL)

**Istota (profil v02 — kluczowa różnica)**  
Przy polityce **ciągłej odpowiedzi na token NM** **procedura usypiania magistrali nie jest inicjowana**: węzeł **utrzymuje pierścień**, więc **do fazy, w której pojawiłby się `SleepInd` w `0x42B`, się nie dochodzi**. To **zupełnie inny mechanizm** niż „błąd po `SleepInd`” lub „nieobsłużony `SleepInd`”. Zob. [Rozróżnienie obowiązkowe](#rozróżnienie-obowiązkowe-procedura-usypiania-magistrali-vs-zdarzenie-sleepind).

**Sygnatura zdarzeń (obserwowalna w logu / skrypt A FAIL)**
- `WAKE_END` może być obecny, ale:
  - **brak domknięcia** `sleep-path` w sensie produktowym,
  - w logach v02/v03 często **brak `SYS:CAN:SLEEP_IND`** — jako **konsekwencja**, że sekwencja snu **nie doszła** do etapu tego bitu, a **nie** jako opis „nie złapaliśmy SleepInd po fakcie”.
- Bardzo długi ogon ramek `0x42B` (`0B 02 00...` + `0B 01...`),
- brak `ERR:CAN:HANG` (warstwa techniczna B nadal może być OK).

**Ramki magistrali**
- Wysoka liczba `0x42B` po `WAKE_END` (w v02/v03 setki wpisów).
- Ciągłe tło (`0x65F`, `0x65D`, `0x651`, itd.).

**Logi**
- `v02_A_KA_swiatla_2026-04-11.txt`
- `v03_A_KA_cisza_2026-04-11.txt`
- `v03_A_SC_cisza_2026-04-11.txt`

**Stan magistrali**
- „Technicznie żyje”, ale produktowo błędny profil (brak naturalnego snu przy wpiętym węźle utrzymującym NM).

**Wniosek i działanie (TX)**
- Nie utrzymywać pierścienia bezwarunkowo (profil keepalive **blokuje start** procedury snu, a nie tylko „psuje obsługę SleepInd”).
- Odpowiadać NM zgodnie z warunkami protokołu i fazą snu w firmware docelowym.

---

## Sytuacja E3: Pętla sleep/wake (flapping) mimo obecnego `SLEEP_IND`

**Sygnatura zdarzeń**
- Wielokrotnie w jednym logu:
  - `SYS:CAN:NM_AUTO_SILENT`
  - `SYS:CAN:SLEEP_IND`
- Powtarzające się `0x42B: 0B 14 00 00 00 00`.

**Ramki magistrali**
- `0x42B` bardzo liczne po pierwszym `WAKE_END`.
- Tło nadal obecne (`0x65F`, `0x65D`).

**Log**
- `v04_A_sleep_gate_cisza_2026-04-11.txt` (`A_PASS: NO` mimo spełnienia prostych warunków skryptu).

**Stan magistrali**
- Stan niestabilny; brak pojedynczego, poprawnie domkniętego cyklu snu.

**Wniosek i działanie (TX)**
- PASS walidatora nie wystarcza.
- Trzeba wymuszać stabilność stanową: brak powrotu do wybudzeń bez nowej, jawnej przyczyny z magistrali.

---

## Sytuacja E4: Przedwczesne urwanie komunikacji bez `ERR:CAN:HANG` (maskowanie awarii)

**Sygnatura zdarzeń**
- `WAKE_END` -> `NM_AUTO_PREP` -> `NM_AUTO_SILENT`
- brak `SYS:CAN:SLEEP_IND`
- brak `ERR:CAN:HANG`
- komentarz w logu o zerwaniu komunikacji.

**Uwaga semantyczna:** brak `SLEEP_IND` w **E4** (log **v05**) oznacza tu **urwanie ruchu przed domknięciem sekwencji snu** — to **nie** jest ten sam mechanizm co w **E2 / profilu v02**, gdzie brak `SLEEP_IND` wynika z **nie rozpoczęcia** procedury usypiania przy ciągłym podtrzymaniu pierścienia (patrz [Rozróżnienie obowiązkowe](#rozróżnienie-obowiązkowe-procedura-usypiania-magistrali-vs-zdarzenie-sleepind)).

**Ramki magistrali**
- Po `WAKE_END` krótkie okno `0x42B` (`0B 02 00...`, `0B 01...`), potem urwanie.

**Log**
- `v05_A_sleep_gate_recovery_2026-04-11.txt` (`A_PASS: NO`, notatka o zerwaniu bez HANG).

**Stan magistrali**
- Krytyczna niejednoznaczność: brak poprawnej komunikacji i brak alarmu.

**Wniosek i działanie (TX)**
- Traktować jako automatyczny FAIL.
- Watchdog nie może być wyciszany przez stan pośredni/ciszę chwilową.

---

## Sytuacja S5: Test C (pompa) - ograniczona obserwowalność

**Sygnatura zdarzeń**
- `WAKE_START` -> `WAKE_END`, brak HANG.
- Brak bezpośrednich wpisów `0x661` (filtrowanie lokalne).

**Logi**
- `v03_C_KA_pompa_2026-04-11.txt`
- `v03_C_SC_pompa_2026-04-11.txt`

**Stan magistrali**
- Z punktu widzenia seriala: stabilnie, ale bez pełnej obserwacji ramki pompy.

**Wniosek i działanie (TX)**
- `0x661` wysyłać wyłącznie w stanie aktywnym.
- Do pełnej weryfikacji C używać równoległego sniffera CAN bez filtra `0x661`.

---

## Jednoznaczne zasady operacyjne wynikające ze wszystkich sytuacji

1. **Token do `0x0B` jest warunkiem koniecznym odpowiedzi `0x40B`.**
2. **`CmdLimpHome` musi mieć obsłużoną ścieżkę odpowiedzi** (inaczej ryzyko E1).
3. **Przejścia stanowe NM są tylko event-driven** (`0x42B`, `SleepInd`, `SleepAck`, `WAKE_END`, nowe wake-cause), bez timerów wymuszających logikę.
4. **Brak `ERR:CAN:HANG` nie jest sukcesem samym w sobie** (możliwe E2/E4).
5. **PASS skryptu + FAIL systemowy = FAIL końcowy** (np. E3).
6. **Watchdog wolno wygasić tylko przy pełnym, jawnie potwierdzonym śnie magistrali**.

---

## Status bieżący (`v10-refactor`)

- Aktualny firmware (`hardware/hardware.ino`) realizuje docelowy profil komunikacji bez odtwarzania sytuacji E1/E2/E3/E4.
- Sytuacje E1-E4 należy traktować jako **historyczne wzorce anty-regresji**, nie jako aktualny stan projektu.
- Dla nowych zmian obowiązuje walidacja względem tego katalogu: brak powrotu do któregokolwiek wzorca E*.

---

## Macierz skrócona: sytuacja -> decyzja TX

| Sytuacja | Co wysyłać | Czego nie wysyłać / nie robić |
|---|---|---|
| S1 aktywna | `0x40B` na token do `0x0B`, zgodnie z Cmd | cisza bez powodu |
| S2 po `WAKE_END` | tylko zdarzeniowe NM na token | „domyślne” wyciszenie po czasie |
| S3 domknięcie snu | minimalne NM potrzebne do domknięcia sleep | podtrzymywanie pierścienia po pełnym śnie |
| S4 impulsy po `WAKE_END` | utrzymać odpowiedź na Limp/token (bez zerwania) | trwałe milczenie prowadzące do HANG |
| E2 sztuczne podtrzymanie | ograniczyć odpowiedzi do warunków protokołu | always-keepalive (uniemożliwia **rozpoczęcie** procedury snu — v02; nie mylić z obsługą `SleepInd`) |
| E3 pętla sleep/wake | stabilizować na zdarzeniach magistrali | flapping stanów |
| E4 urwanie bez HANG | traktować jako krytyczny fail, watchdog aktywny do pełnego snu | tłumienie watchdoga w stanach pośrednich |

