# Walidacja komunikacji NM (PQ35 Infotainment) — checklista

Kryteria odnoszą się do firmware w `hardware/hardware.ino` (obecnie **v03** — patrz tabela archiwum; **v02** i **v01** to archiwum w `logs/2026-04-11/`).

## Wnioski ostateczne (stan na 2026-04-11)

### Co wynika z materiałów w repo

- **v01** na logach `v01_A_*_sleep_ok` pokazuje **pełną ścieżkę snu** (`sleep-path` w skrypcie — OK), przy czym **v01_B** przy impulsach po `WAKE_END` daje **HANG** (zerwany pierścień przez brak NM na Limp).
- **v02** usuwa **HANG** w scenariuszu B (skrypt `no-hang` / `resilience` na `v02_B_KA_*`), ale przy **wpiętym** węźle i polityce ciągłej odpowiedzi NM **nie** domyka **naturalnego snu** magistrali w logu — magistrala jest **sztucznie podtrzymywana** przez udział w pierścieniu.
- **v03** dodaje tryby Serial i lustro bitów Sleep w `0x40B` (**SLEEP_COOP**). Na zapisanych logach **`v03_A_KA_cisza`** i **`v03_A_SC_cisza`** skrypt **`sleep-path` nadal FAIL** (brak `SYS:CAN:SLEEP_IND`). **`v03_B_*`** przechodzi **tylko warstwę skryptu** (brak HANG, ruch po `WAKE_END`) — patrz [Test B: skrypt vs intencja magistrali](#test-b-skrypt-vs-intencja-magistrali). **Test C** potwierdza brak HANG, nie rozstrzyga „uczciwości” snu.

### Ocena postępu v02 → v03 względem zamierzonego celu

**Realnie nie uzyskano postępu w rozwiązaniu głównego problemu** (współpraca ze snem przy wpiętym urządzeniu w warunkach zbliżonych do OE): zachowanie **rdzeniowo pozostaje w tym samym kompromisie** co v02 — węzeł **nadal** utrzymuje pierścień, a **ścieżka snu na serialu przy wpiętym Arduino nie została potwierdzona**. v03 to **większa złożoność kodu** (tryby, lustro bitów, logika HANG w SLEEP_COOP) **bez** przełożenia na **zaliczony** Test A w polu. Jedyny wyraźny zysk techniczny względem v01 to **stabilność bez HANG** w scenariuszu B — to nadal **leczenie objawowe** w sensie architektury snu, nie „naprawa” podtrzymywania magistrali.

### Kolejność i sens dalszych testów (stanowisko autora)

Jeśli **celem merytorycznym** jest magistrala **niezakłamana** przez **sztuczne utrzymywanie** węzła w NM, uznajemy za **sensowną bramę**: **najpierw** osiągnąć **Test A / uśpienie** (`sleep-path` lub równoważny, powtarzalny dowód na żywym węźle przy założonej polityce firmware). **Dopiero wtedy** wyniki testów **B** i **C** można interpretować w kontekście „prawdziwego” stanu busu. **Bez przejścia testu uśpienia** testy B/C nadal mają wartość jako **regresja inżynierska** (watchdog, pompa `0x661`), ale **nie** jako potwierdzenie, że system zachowuje się **właściwie** w sensie pełnego cyklu życia magistrali — wynik jest **przez ten warunek zawężony** i można go uznać za **wprowadzający w błąd**, jeśli mylnie utożsamia się „brak HANG” z sukcesem produktowym.

### Kierunki na kolejną iterację (skrót)

- Świadoma **zmiana polityki NM** (np. **okresowe lub warunkowe milczenie TX** w fazie gotowości do snu, ścisła synchronizacja z `SleepInd` / watchdogiem — wysokie ryzyko HANG przy błędnej implementacji).
- Albo **jawna dekompozycja produktu**: tryb **tylko telemetria** (akceptacja braku snu przy wpiętym urządzeniu) vs osobny **eksperyment** pod sen, bez mieszania interpretacji wyników.

---

## Wnioski (wersje firmware i logi)

### v01 — `hardware_v01_aba4daa__tests-1-4.ino` (git `aba4daa`)

- **`v01_A_*_sleep_ok`:** (`v01_A_zamek_sleep_ok_2026-04-11.txt`, `v01_A_swiatla_sleep_ok_2026-04-11.txt`) — pełna sekwencja snu na magistrali (m.in. `SLEEP_IND`, `0x42B` z `0B 14…`). Skrypt: wszystkie trzy checki (`no-hang`, `sleep-path`, `resilience`) → **OK**.
- **`v01_B_*_hang`:** (`v01_B_zamek_hang_2026-04-11.txt`, `v01_B_swiatla_hang_2026-04-11.txt`) — po `WAKE_END` powtarzane impulsy użytkownika → **`ERR:CAN:HANG`**; brak domknięcia snu w logu. Przyczyna: NM było nadawane tylko przy `isBusActive` i tylko dla `CmdRing`/`CmdAlive` — **brak odpowiedzi na `CmdLimpHome` (`0x04`)**, więc pierścień się rwał.
- Wniosek: **v01** jest dobrym referencją do walidacji **ścieżki snu** na zapisanych logach, ale **nie** spełnia wymogu stabilności po impulsach po `WAKE_END`.

### v02 — `hardware_v02_nm_netstate_plan.ino` / `hardware/hardware.ino`

- **`v02_A_KA_*` / `v02_B_KA_*` (pole):** `v02_A_KA_swiatla_2026-04-11.txt`, `v02_B_KA_swiatla_impulsy_2026-04-11.txt` — skrypt **`no-hang`** + **`resilience`** → **OK** (brak `ERR:CAN:HANG`, ruch po `WAKE_END`). **Merytorycznie** to nadal **utrzymanie pierścienia przez wpięty węzeł** — patrz [Test B: skrypt vs intencja magistrali](#test-b-skrypt-vs-intencja-magistrali).
- **`sleep-path`** na logu **z wpiętym** Arduino i **obecną** polityką „zawsze odpowiadaj na token NM” → zwykle **FAIL** (brak `SLEEP_IND`): węzeł **nadal uczestniczy w pierścieniu**, więc Gateway **nie domyka** pełnej procedury usypiania Infotainment „obok” tego urządzenia. Log **nie ma naturalnego końca** — to oczekiwane przy ręcznym zatrzymaniu nagrywania, nie „ucięty plik”.
- Wniosek: **v02** realizuje cel **stabilnej komunikacji i braku HANG**; **wyklucza to samo** co jednoczesne łatwe uzyskanie **pełnego snu magistrali na serialu** bez zmiany polityki (np. celowe wyciszenie NM w fazie gotowości do snu / test bez aktywnego węzła).

### v03 — `hardware_v03_serial_modes_sleep_coop.ino` / aktualne `hardware/hardware.ino`

- **Tryby Serial (bez rekompilacji):**
  - `MODE:KEEPALIVE` — zachowanie jak **v02** (odpowiedź `0x40B` bez bitów Sleep w bajcie 1; domyślne po starcie — linia `SYS:CAN:NM_MODE_KEEPALIVE`).
  - `MODE:SLEEP_COOP` — w odpowiedzi NM **lustruje** bity **SleepInd** (`0x10`) i **SleepAck** (`0x20`) z ramki Gatewaya `0x42B` do bajtu 1 ramki `0x40B`, zgodnie z układem sygnałów **NWM_Radio** w [`data/id_ramek_tylko_radio.txt`](../../data/id_ramek_tylko_radio.txt) (startbity 12–13, jak w `mNM_Gateway_I`).
- **Watchdog HANG:** w `SLEEP_COOP` krótkie wyciszenie fałszywego HANG w oknie **równym Grace po `WAKE_END`** (`hadWakeEndForGrace` + `!isSleepIndicated`), żeby nie karać przejścia tuż po zaniku wake.
- **Status empiryczny (zapisane logi):** `v03_A_KA_cisza` / `v03_A_SC_cisza` — **`sleep-path` FAIL** (brak `SLEEP_IND`). **`v03_B_KA_impulsy`** / **`v03_B_SC_impulsy`:** skrypt `no-hang`+`resilience` → OK — **bez** zmiany diagnozy z sekcji [Wnioski ostateczne](#wnioski-ostateczne-stan-na-2026-04-11): **ten sam rdzeniowy problem co v02** względem celu snu przy wpiętym węźle.

### Kompromis projektowy

| Cel | v01 | v02 | v03 |
|-----|-----|-----|-----|
| Ścieżka snu widoczna w logu (Test A / `sleep-path`) | Tak (przy sprzyjających warunkach auta) | Zwykle nie przy ciągłej odpowiedzi NM | **Do walidacji** w SLEEP_COOP |
| Odporność po impulsach po `WAKE_END` (Test B / skrypt) | Nie (HANG w `v01_B_*`) | OK skryptu (`v02_B_KA_*`) | OK skryptu (`v03_B_*`; patrz uwaga poniżej) |
| `no-hang` | `v01_A_*` OK; `v01_B_*` FAIL | `v02_*` OK | Cel: OK w obu trybach |
| Ustawienie bez flash | — | — | `MODE:*` po Serialu |

### Skrypt walidacji

- Ścieżka: `scripts/validate_nm_serial_log.py` (z katalogu głównego repo).
- Dla **v02/v03 KEEPALIVE** sensowny zestaw po polu: `--check no-hang --check resilience`.
- **v03 SLEEP_COOP:** dodatkowo spróbować pełnego `sleep-path` na nagraniu z auta (możliwa, nie gwarantowana poprawa względem v02).
- **Fixture CI / smoke:** `scripts/fixtures/nm_min_sleep_path.txt` — minimalny syntetyczny log; `python scripts/validate_nm_serial_log.py scripts/fixtures/nm_min_sleep_path.txt --check sleep-path --check no-hang` musi zwracać `OK`.
- Pełny **`sleep-path`** na materiale rzeczywistym: logi **v01** (`v01_A_*_sleep_ok_2026-04-11.txt`) lub nagranie **bez** podtrzymującego węzła.

### Test B: skrypt vs intencja magistrali

1. **Warstwa skryptu** (`--check no-hang --check resilience`): sprawdza wyłącznie, czy **nie ma** `ERR:CAN:HANG` i czy **po ostatnim** `SYS:CAN:WAKE_END` nadal jest w logu **wystarczająco dużo** ruchu (regresja względem **v01**, gdzie pierścień się rwał i pojawiał się HANG). To jest **minimalny test techniczny** — „czy telemetria się nie wywala”.
2. **Warstwa merytoryczna (produkt / OE):** jeśli uznajesz za właściwe, żeby magistrala **nie była bez końca podtrzymywana** przez wpięty węzeł odpowiadający na każdy token NM, to **sam wynik OK ze skryptu nie znaczy sukcesu scenariusza B w pełnym sensie**. Nadal działa **świadomy kompromis** v02/v03 **KEEPALIVE** (i częściowo **SLEEP_COOP**, dopóki węzeł aktywnie uczestniczy w pierścieniu): **leczenie objawowe** — usuwasz HANG i utrzymujesz pierścień, **bez** rozwiązania problemu „jak fabryczne radio + sen przy wpiętym urządzeniu”.  
   **W praktyce:** możesz traktować Test B jako **zaliczony technicznie** (skrypt) i **niezaliczony** pod kątem docelowej architektury snu — obie oceny są spójne z tym dokumentem.

## Ważne: obecny firmware a pełna sekwencja snu (Test A)

Przy **aktualnej** logice Arduino magistrala jest **dalej aktywna z punktu widzenia NM**, dopóki Gateway adresuje węzeł `0x0B`: firmware **zawsze** odpowiada ramką `0x40B` (przekazanie tokenu), a w fazie `NET_ACTIVE` dodatkowo nadaje `0x661`. To **sztucznie utrzymuje udział węzła w pierścieniu** i sprawia, że Gateway **zwykle nie zakończy** pełnej procedury usypiania Infotainment w obecności tego urządzenia.

Skutek praktyczny:

- Log seriala **może nie mieć „naturalnego końca”** — strumień `0x42B` / `0x65F` itd. trwa dalej; to **nie** jest błąd zapisu ani „ucięty plik”, jeśli nagrywanie zatrzymałeś ręcznie.
- **`SYS:CAN:SLEEP_IND` oraz ramka `0x42B` z `0B 14…` (LimpHome + SleepInd) w tej konfiguracji raczej się nie pojawią** — dopóki nie wprowadzisz osobnej polityki (np. celowe wyciszenie TX NM / symulacja gotowości do snu zgodnie z OSEK, albo test bez podłączonego węzła „radio”).

**Test A (`sleep-path` w skrypcie)** da się zaliczyć na logu **bez** obecnego węzła podtrzymującego pierścień, albo z **innym** firmware testowym, albo z nagraniem z samego auta **przed** wpięciem Arduino / z wersją która nie odpowiada na token.

Przy **v03** i trybie **`MODE:SLEEP_COOP`** celem jest **zbliżyć się** do zachowania fabrycznego radia (zgłaszanie gotowości do snu w NM) — nadal możliwe jest, że Gateway nie domknie snu (zależność od konfiguracji pojazdu / innych węzłów).

Checki **`no-hang`** i **`resilience`** dla **KEEPALIVE** (i częściowo **SLEEP_COOP**) warto traktować jako **konieczne, lecz niewystarczające**: potwierdzają stabilność watchdogu i ciągłość NM po impulsach, **nie** że magistrala zachowuje się „jak bez emulatora” ani że problem sztucznego podtrzymania zniknął. Dla **SLEEP_COOP** nadal potrzebna jest **walidacja w polu** pod kątem snu (brak gwarancji z samego lustra bitów).

## Kiedy plan jest uznany za ukończony

Implementacja w repozytorium to tylko część pracy — **zamknięcie w sensie produktowym** wymaga jasnego **wyboru celu** (telemetria vs sen przy wpiętym węźle). Przy celu „**nie zakłamywać** wyniku sztucznym podtrzymaniem” przyjmuje się **bramę**: **najpierw Test A / uśpienie** — patrz [Wnioski ostateczne](#wnioski-ostateczne-stan-na-2026-04-11).

1. **Scenariusz A (`sleep-path`) — brama (gdy ten cel ma znaczenie):** log z wpiętym urządzeniem i przyjętą polityką firmware; walidator: `--check sleep-path` (+ `--check no-hang`). **Bez sensownego przejścia tej bramy** wyniki testów B/C **nie** świadczą o „właściwości” pełnego cyklu magistrali — jedynie o regresji technicznej (HANG, pompa).
2. **Scenariusz B (warstwa techniczna, opcjonalna po bramie lub w trybie czystej telemetrii):** jak dotąd — `WAKE_START` → `WAKE_END` → impulsy; osobno **`MODE:KEEPALIVE`** / **`MODE:SLEEP_COOP`**. Walidator:

```text
python scripts/validate_nm_serial_log.py TWOJ_LOG_B.txt --check no-hang --check resilience
```

   **Osobno oceń** warstwę merytoryczną — [Test B: skrypt vs intencja magistrali](#test-b-skrypt-vs-intencja-magistrali).
3. **Scenariusz C** — jak dotąd; sens **ograniczony** bez wcześniejszej bramy snu, jeśli taka brama jest częścią Twojej definicji sukcesu.

Opcjonalnie pełne trzy checki na starym materiale:

```text
python scripts/validate_nm_serial_log.py logs/2026-04-11/v01_A_swiatla_sleep_ok_2026-04-11.txt
```

**Archiwum logów (v01):**

- `v01_A_zamek_sleep_ok_2026-04-11.txt`, `v01_A_swiatla_sleep_ok_2026-04-11.txt` — wszystkie trzy checki **OK**.
- `v01_B_zamek_hang_2026-04-11.txt`, `v01_B_swiatla_hang_2026-04-11.txt` — **FAIL** (`HANG`, brak pełnej ścieżki snu) — dokumentuje problem **v01**, naprawiony w **v02** pod kątem `resilience`.

## Archiwum wersji firmware (numeracja)

| Wersja | Plik w `logs/2026-04-11/` | Opis |
|--------|---------------------------|------|
| **v01** | `hardware_v01_aba4daa__tests-1-4.ino` | Odtworzone z gita: `hardware/hardware.ino` @ commit **aba4daa** — firmware referencyjny do logów `v01_*_2026-04-11.txt` (przed planem NetState / bezwarunkowego NM na Limp). |
| **v02** | `hardware_v02_nm_netstate_plan.ino` | NetState, Grace, NM Ring\|Alive\|Limp, `0x661` tylko w `NET_ACTIVE` — **bez** trybów Serial / lustra snu. |
| **v03** | `hardware_v03_serial_modes_sleep_coop.ino` | Jak v02 + **`MODE:KEEPALIVE` / `MODE:SLEEP_COOP`** + lustro SleepInd/SleepAck w `0x40B` + krótkie tłumienie HANG w SLEEP_COOP po `WAKE_END`. Powinna odpowiadać aktualnemu `hardware/hardware.ino`. |

Odtworzenie v01 z innego miejsca:  
`git show aba4daa:hardware/hardware.ino`

## Odniesienia

- Bity `0x42B` (mNM_Gateway_I): `data/id_ramek.txt`
- Logi porównawcze **v01:** `v01_B_zamek_hang_2026-04-11.txt`, `v01_B_swiatla_hang_2026-04-11.txt`, `v01_A_zamek_sleep_ok_2026-04-11.txt`, `v01_A_swiatla_sleep_ok_2026-04-11.txt` (nagłówki wskazują firmware **v01**)

## Tryby Serial (v03)

| Komenda (linia + Enter, 115200) | Odpowiedź firmware | Zachowanie NM `0x40B` |
|----------------------------------|--------------------|------------------------|
| `MODE:KEEPALIVE` | `SYS:CAN:NM_MODE_KEEPALIVE` | Jak v02 — tylko Ring / Alive / Limp w bajcie 1 |
| `MODE:SLEEP_COOP` | `SYS:CAN:NM_MODE_SLEEP_COOP` | Dodatkowo OR z bitami SleepInd/SleepAck z `0x42B` bajt 1 |

**Ryzyko:** tłumienie HANG tylko w pierwszych **2 s** po `WAKE_END` w SLEEP_COOP — jeśli Gateway ma dłuższą fazę przejściową, nadal możliwy HANG lub konieczność dalszego strojenia.

## Kryteria sukcesu (ogólne)

1. **v03 / produkcja (minimum techniczne):** brak `ERR:CAN:HANG` po wielokrotnych impulsach **po** `SYS:CAN:WAKE_END` (oba tryby osobno w polu) — to **nie** równa się automatycznie akceptacją **sztucznego podtrzymania** pierścienia jako docelowego zachowania; jeśli tak uznajesz, traktuj to jako **kompromis telemetrii**, nie jako „naprawę” magistrali w sensie snu OE.
2. **v01 lub autobus bez podtrzymującego węzła:** powtarzalne dojście do `SYS:CAN:SLEEP_IND` i sekwencji z `0x42B` typu `0B 14 …` (wzór: `v01_A_zamek_sleep_ok_…` / `v01_A_swiatla_sleep_ok_…`).
3. **v02/v03:** po `WAKE_END` brak ciągłego nadawania `0x661` (pompa tylko w `NET_ACTIVE`).
4. **v02/v03:** odpowiedzi `0x40B` przy tokenie do `0x0B` także przy `CmdLimpHome` (`0x04` / `0x14` w bajcie 1 — `id_ramek.txt`).
5. **v03 SLEEP_COOP:** w logu sniffera / narzędzia — w fazie snu ramki `0x40B` powinny pokazywać ustawione bity zgodne z lustrem Gatewaya (weryfikacja poza tym dokumentem).

## Test A — scenariusz „udany sen” (wzór: `v01_A_*_sleep_ok_2026-04-11.txt`)

| Krok | Akcja | Oczekiwane na serialu / CAN |
|------|--------|-----------------------------|
| A1 | Jedno wybudzenie (np. światła / zamek) | `SYS:CAN:WAKE_START`, potem ruch `0x42B` z `02 80 02` (para z `01`) |
| A2 | Odczekać naturalny koniec cyklu | `SYS:CAN:WAKE_END`, potem `0x42B` z `02 00 00 …` |
| A3 | Bez dodatkowych impulsów | `0x42B:0B 04 …`, `SYS:CAN:SLEEP_IND`, `0x42B:0B 14 …` |
| A4 | — | Brak `ERR:CAN:HANG` |

## Test B — scenariusz „impulsy po WAKE_END” (wzór: `v01_B_*_hang_2026-04-11.txt` — na v01 dawało HANG; na v02/v03 skrypt: brak HANG)

| Krok | Akcja | Oczekiwane |
|------|--------|------------|
| B1 | `WAKE_START` → `WAKE_END` jak w teście A | Jak wyżej |
| B2 | Wielokrotne impulsy zamka `0x291` lub manetki `0x2C1` **po** `WAKE_END` | Nadal odpowiedzi NM na `0x42B→0x0B`; **brak** `ERR:CAN:HANG` (**to sprawdza skrypt**; **merytorycznie** nadal możesz uznać scenariusz za nieakceptowalny, jeśli celem jest magistrala bez **sztucznego** podtrzymania węzłem — patrz wyżej) |
| B3 | Monitorować `0x661` | Brak ciągłej pompy po `WAKE_END` (stan `NET_GRACE` / `NET_SLEEP_READY` / `NET_SLEEP`) |

## Test C — regresja radia (`0x661`)

| Krok | Akcja | Oczekiwane |
|------|--------|------------|
| C1 | Trwanie w fazie między `WAKE_START` a `WAKE_END` | Okresowe ramki `0x661` (~co 150 ms) |
| C2 | Po `WAKE_END` | Ustanie pompy `0x661` do następnego `WAKE_START` |

## Notatki

- Ponowne wejście w `NET_ACTIVE` jest **tylko** przy `WAKE_START` (przejście `wakeCombo` z 0 na ≠0 w ramce Alive z Gatewaya) — impulsy komfortu same w sobie nie włączają pompy `0x661`.
- Stałe czasowe (`GRACE_AFTER_WAKE_END_MS`, `SLEEP_READY_TO_SLEEP_MS`) można stroić pod konkretny pojazd po logach.
