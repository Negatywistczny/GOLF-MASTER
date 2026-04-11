# Walidacja komunikacji NM (PQ35 Infotainment) — checklista

Kryteria odnoszą się do firmware w `hardware/hardware.ino` (obecnie **v4.1 hard-sleep-silence** — patrz tabela archiwum; **v04/v03/v02/v01** to archiwum w `logs/2026-04-11/`).

## Canon i klasyfikacja dowodów

- Canon mapy `0x42B` i klasyfikacji fakt/inferencja/hipoteza: `logs/2026-04-11/NM_CANONICAL_BASELINE.md`.
- Przy każdej rozbieżności opisowej obowiązuje semantyka z `data/id_ramek.txt`.

## Wnioski ostateczne (stan na 2026-04-11)

### Co wynika z materiałów w repo

- **v01** na logach `v01_A_*_sleep_ok` pokazuje **pełną ścieżkę snu** (`sleep-path` w skrypcie — OK), przy czym **v01_B** przy impulsach po `WAKE_END` daje **HANG** (zerwany pierścień przez brak NM na Limp).
- **v02** usuwa **HANG** w scenariuszu B (skrypt `no-hang` / `resilience` na `v02_B_KA_*`), ale przy **wpiętym** węźle i polityce ciągłej odpowiedzi NM **nie** domyka **naturalnego snu** magistrali w logu — magistrala jest **sztucznie podtrzymywana** przez udział w pierścieniu.
- **v03** dodało tryby Serial i lustro bitów Sleep w `0x40B` (**SLEEP_COOP**), ale na zapisanych logach **`v03_A_*`** `sleep-path` nadal **FAIL**.
- **v04**: Auto-NM bez `MODE:*`; próba ograniczenia odpowiedzi NM po `WAKE_END`.
- **v4.1 (hard sleep silence)**: po `SleepInd` brak odpowiedzi `0x40B` (bez wyjątków). **Wynik polowy:** `v04_1_A_sleep_gate_cisza_2026-04-11.txt` = **PASS** (sleep-path), ale `v04_1_B_impulsy_po_Apass_2026-04-11.txt` = **FAIL** (`ERR:CAN:HANG`). W praktyce efekt końcowy jest **równoważny v01** (nie ma jednocześnie „sleep + odporność B”).

### Ocena postępu v02 → v03 względem zamierzonego celu

**Realnie nie uzyskano postępu w rozwiązaniu głównego problemu** (współpraca ze snem przy wpiętym urządzeniu w warunkach zbliżonych do OE): zachowanie **rdzeniowo pozostaje w tym samym kompromisie** co v02 — węzeł **nadal** utrzymuje pierścień, a **ścieżka snu na serialu przy wpiętym Arduino nie została potwierdzona**. v03 to **większa złożoność kodu** (tryby, lustro bitów, logika HANG w SLEEP_COOP) **bez** przełożenia na **zaliczony** Test A w polu. Jedyny wyraźny zysk techniczny względem v01 to **stabilność bez HANG** w scenariuszu B — to nadal **leczenie objawowe** w sensie architektury snu, nie „naprawa” podtrzymywania magistrali.

### Kolejność i sens dalszych testów (stanowisko autora)

Jeśli **celem merytorycznym** jest magistrala **niezakłamana** przez **sztuczne utrzymywanie** węzła w NM, uznajemy za **sensowną bramę**: **najpierw** osiągnąć **Test A / uśpienie** (`sleep-path` lub równoważny, powtarzalny dowód na żywym węźle przy założonej polityce firmware). **Dopiero wtedy** wyniki testów **B** i **C** można interpretować w kontekście „prawdziwego” stanu busu. **Bez przejścia testu uśpienia** testy B/C nadal mają wartość jako **regresja inżynierska** (watchdog, pompa `0x661`), ale **nie** jako potwierdzenie, że system zachowuje się **właściwie** w sensie pełnego cyklu życia magistrali — wynik jest **przez ten warunek zawężony** i można go uznać za **wprowadzający w błąd**, jeśli mylnie utożsamia się „brak HANG” z sukcesem produktowym.

### Kierunki na kolejną iterację (skrót)

- Świadoma **zmiana polityki NM** (np. **okresowe lub warunkowe milczenie TX** w fazie gotowości do snu, ścisła synchronizacja z `SleepInd` / watchdogiem — wysokie ryzyko HANG przy błędnej implementacji).
- Albo **jawna dekompozycja produktu**: tryb **tylko telemetria** (akceptacja braku snu przy wpiętym urządzeniu) vs osobny **eksperyment** pod sen, bez mieszania interpretacji wyników.

### Zasada anty-regresji (obowiązkowa)

Nie wolno ponownie wprowadzać wzorców błędów znanych z poprzednich iteracji (w szczególności klasy **v01/v4.1**: utrata odporności w Teście B po `WAKE_END`, HANG przy ponownym wybudzeniu oraz błędne/niejednoznaczne przejścia stanu wake). Każda kolejna zmiana firmware musi jawnie wykazać, że:

1. nie wraca błąd „B FAIL / `ERR:CAN:HANG` po impulsych po `WAKE_END`”,
2. przejście `WAKE_END -> kolejne wybudzenie` działa poprawnie stanowo,
3. poprawka snu nie degraduje stabilności, a poprawka stabilności nie degraduje snu.

### Krytyczny warunek watchdoga (obowiązkowy)

Watchdog (`ERR:CAN:HANG`) może być **uśpiony / wygaszony wyłącznie** po otrzymaniu **jawnej informacji o pełnym uśpieniu magistrali**. Ten warunek jest jedyną poprawną definicją pełnego snu i **żaden inny stan pośredni** (np. `AUTO_SLEEP_PREP`, `AUTO_SILENT_LISTEN`, cisza po `WAKE_END`, brak ramek chwilowo) **nie może** wyłączać watchdoga.

### Zasady projektowe NM (obowiązkowe)

1. **Przejścia stanów NM są wyłącznie zdarzeniowe** — zmiana stanu jest dozwolona tylko po jawnym zdarzeniu z magistrali (ramka/sygnał), nie na podstawie upływu czasu.
2. **Zakaz timerów sterujących logiką stanów** — timery nie mogą inicjować ani wymuszać przejść `AUTO_ACTIVE` / `AUTO_SLEEP_PREP` / `AUTO_SILENT_LISTEN`.
3. **Priorytet sygnału nad predykcją** — decyzje o stanie i odpowiedzi NM muszą wynikać z aktualnie odebranych danych (`0x42B`, Sleep/Token), a nie z domyślania się zachowania Gatewaya.
4. **Watchdog jest jedynym wyjątkiem czasowym** — próg czasowy może być używany wyłącznie do wykrywania utraty komunikacji (`ERR:CAN:HANG`), nie do sterowania polityką NM.
5. **Próg 2 s pozostaje tymczasowo bez zmian** — obecnie nie jest to przedmiot tej iteracji; krytyczny jest brak maskowania zerwania komunikacji.

### Reguły werdyktu (uzupełnienie, obowiązkowe)

1. **PASS walidatora + FAIL systemowy = FAIL końcowy** — jeśli check skryptu jest `OK`, ale log ujawnia regresję zachowania magistrali (np. pętla wybudzania po `SLEEP_IND`), iteracja jest niezaliczona.
2. **Przedwczesne urwanie komunikacji bez `ERR:CAN:HANG` = błąd krytyczny** — brak alarmu watchdoga przy utracie komunikacji traktujemy jako maskowanie awarii i automatyczny FAIL.

### Reguła analizy przed zmianą polityki NM (obowiązkowa)

Przed wdrożeniem każdej kolejnej wersji firmware wykonujemy **obowiązkowy checkpoint porównawczy**:

- jeśli istnieje ryzyko **sztucznie utrzymywanej komunikacji**, ponownie analizujemy logi i zachowanie **v02** oraz **v03** (żeby nie powielić błędów klasy „brak domknięcia snu przez aktywne NM”),
- jeśli istnieje ryzyko **zerwania komunikacji / HANG**, ponownie analizujemy logi i zachowanie **v01** oraz **v4.1** (żeby nie powielić błędów klasy „B FAIL po WAKE_END / błędna re-aktywacja”).

Brak takiego checkpointu oznacza, że iteracja nie jest gotowa do testów polowych.

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

### v03 — `hardware_v03_serial_modes_sleep_coop.ino`

- **Tryby Serial (bez rekompilacji):**
  - `MODE:KEEPALIVE` — zachowanie jak **v02** (odpowiedź `0x40B` bez bitów Sleep w bajcie 1; domyślne po starcie — linia `SYS:CAN:NM_MODE_KEEPALIVE`).
  - `MODE:SLEEP_COOP` — w odpowiedzi NM **lustruje** bity **SleepInd** (`0x10`) i **SleepAck** (`0x20`) z ramki Gatewaya `0x42B` do bajtu 1 ramki `0x40B`, zgodnie z układem sygnałów **NWM_Radio** w [`data/id_ramek_tylko_radio.txt`](../../data/id_ramek_tylko_radio.txt) (startbity 12–13, jak w `mNM_Gateway_I`).
- **Watchdog HANG:** w `SLEEP_COOP` krótkie wyciszenie fałszywego HANG w oknie **równym Grace po `WAKE_END`** (`hadWakeEndForGrace` + `!isSleepIndicated`), żeby nie karać przejścia tuż po zaniku wake.
- **Status empiryczny (zapisane logi):** `v03_A_KA_cisza` / `v03_A_SC_cisza` — **`sleep-path` FAIL** (brak `SLEEP_IND`). **`v03_B_KA_impulsy`** / **`v03_B_SC_impulsy`:** skrypt `no-hang`+`resilience` → OK — **bez** zmiany diagnozy z sekcji [Wnioski ostateczne](#wnioski-ostateczne-stan-na-2026-04-11): **ten sam rdzeniowy problem co v02** względem celu snu przy wpiętym węźle.

### v04 / v4.1 — `hardware_v04_auto_nm_sleep_gate.ino` / `hardware_v04_1_sleep_hard_silent.ino`

- **Brak ręcznego przełączania:** usunięto `MODE:KEEPALIVE` / `MODE:SLEEP_COOP`; firmware emituje `SYS:CAN:NM_MODE_AUTO`.
- **Auto-NM sleep-first:** stan `AUTO_ACTIVE` odpowiada NM jak dotąd, `AUTO_SLEEP_PREP` ogranicza odpowiedzi tylko do ramek związanych ze snem (`SleepInd/SleepAck`), `AUTO_SILENT_LISTEN` celowo milczy (bez sztucznego trzymania pierścienia).
- **Watchdog HANG świadomy stanu:** HANG nie zgłasza awarii podczas kontrolowanego wyciszenia poza `AUTO_ACTIVE`.
- **v04 (pierwsza iteracja):** logi v03 nie były dowodem skuteczności v04; potrzebna była nowa seria v04.
- **v4.1 (druga iteracja):**
  - `v04_1_A_sleep_gate_cisza_2026-04-11.txt` -> **A PASS** (sleep-path + no-hang),
  - `v04_1_B_impulsy_po_Apass_2026-04-11.txt` -> **B FAIL** (`ERR:CAN:HANG`).
- **Wniosek:** udało się wrócić do snu, ale kosztem odporności po impulsach po `WAKE_END`; to praktycznie ten sam problem dualny co w v01 (tyle że osiągnięty inną polityką NM).

### Kompromis projektowy

| Cel | v01 | v02 | v03 | v04/v4.1 |
|-----|-----|-----|-----|-----|
| Ścieżka snu widoczna w logu (Test A / `sleep-path`) | Tak (przy sprzyjających warunkach auta) | Zwykle nie przy ciągłej odpowiedzi NM | FAIL na zapisanych logach v03 | **v4.1: PASS (A)** |
| Odporność po impulsach po `WAKE_END` (Test B / skrypt) | Nie (HANG w `v01_B_*`) | OK skryptu (`v02_B_KA_*`) | OK skryptu (`v03_B_*`) | **v4.1: FAIL (B, HANG)** |
| `no-hang` | `v01_A_*` OK; `v01_B_*` FAIL | `v02_*` OK | `v03_*` OK dla B/C | **v4.1: A OK / B FAIL** |
| Ustawienie bez flash | — | — | `MODE:*` po Serialu | Auto-NM (brak `MODE:*`) |

### Skrypt walidacji

- Ścieżka: `scripts/validate_nm_serial_log.py` (z katalogu głównego repo).
- Dla **v02/v03** checki `no-hang` + `resilience` traktuj jako regresję techniczną (bez wnioskowania o śnie).
- Dla **v04** obowiązuje brama: najpierw `sleep-path` na logu `v04_A_*`, dopiero potem `v04_B_*` / `v04_C_*`.
- **Fixture CI / smoke:** `scripts/fixtures/nm_min_sleep_path.txt` — minimalny syntetyczny log; `python scripts/validate_nm_serial_log.py scripts/fixtures/nm_min_sleep_path.txt --check sleep-path --check no-hang` musi zwracać `OK`.
- Pełny **`sleep-path`** na materiale rzeczywistym: logi **v01** (`v01_A_*_sleep_ok_2026-04-11.txt`) lub nagranie **bez** podtrzymującego węzła.

### Test B: skrypt vs intencja magistrali

1. **Warstwa skryptu** (`--check no-hang --check resilience`): sprawdza wyłącznie, czy **nie ma** `ERR:CAN:HANG` i czy **po ostatnim** `SYS:CAN:WAKE_END` nadal jest w logu **wystarczająco dużo** ruchu (regresja względem **v01**, gdzie pierścień się rwał i pojawiał się HANG). To jest **minimalny test techniczny** — „czy telemetria się nie wywala”.
2. **Warstwa merytoryczna (produkt / OE):** jeśli uznajesz za właściwe, żeby magistrala **nie była bez końca podtrzymywana** przez wpięty węzeł odpowiadający na każdy token NM, to **sam wynik OK ze skryptu nie znaczy sukcesu scenariusza B w pełnym sensie**. Nadal działa **świadomy kompromis** v02/v03 **KEEPALIVE** (i częściowo **SLEEP_COOP**, dopóki węzeł aktywnie uczestniczy w pierścieniu): **leczenie objawowe** — usuwasz HANG i utrzymujesz pierścień, **bez** rozwiązania problemu „jak fabryczne radio + sen przy wpiętym urządzeniu”.  
   **W praktyce:** możesz traktować Test B jako **zaliczony technicznie** (skrypt) i **niezaliczony** pod kątem docelowej architektury snu — obie oceny są spójne z tym dokumentem.

## Ważne: polityka NM a pełna sekwencja snu (Test A)

Przy polityce typu **„zawsze odpowiadaj NM”** (v02/v03 KEEPALIVE) magistrala pozostaje aktywna z punktu widzenia NM i zwykle nie domyka pełnego snu. Przy polityce **„hard silence po SleepInd”** (v4.1) możliwe jest domknięcie snu, ale rośnie ryzyko HANG przy późniejszych impulsach po `WAKE_END`.

Skutek praktyczny (zależny od polityki NM):

- Przy polityce utrzymującej odpowiedzi NM log może wyglądać jak nieskończony strumień po `WAKE_END` (bez domknięcia snu).
- Przy polityce hard silence po `SleepInd` możliwe jest przejście `sleep-path`, ale może wrócić `ERR:CAN:HANG` po impulsach po `WAKE_END` (potwierdzone w `v04_1_B_impulsy_po_Apass_2026-04-11.txt`).

**Test A (`sleep-path` w skrypcie)** można zaliczyć zarówno na logu bez podtrzymującego węzła, jak i na firmware z agresywną polityką ciszy po `SleepInd` (v4.1). To samo nie gwarantuje jeszcze zaliczenia Testu B.

Przy **v03** i trybie **`MODE:SLEEP_COOP`** celem jest **zbliżyć się** do zachowania fabrycznego radia (zgłaszanie gotowości do snu w NM) — nadal możliwe jest, że Gateway nie domknie snu (zależność od konfiguracji pojazdu / innych węzłów).

Checki **`no-hang`** i **`resilience`** dla **KEEPALIVE** (i częściowo **SLEEP_COOP**) warto traktować jako **konieczne, lecz niewystarczające**: potwierdzają stabilność watchdogu i ciągłość NM po impulsach, **nie** że magistrala zachowuje się „jak bez emulatora” ani że problem sztucznego podtrzymania zniknął. Dla **SLEEP_COOP** nadal potrzebna jest **walidacja w polu** pod kątem snu (brak gwarancji z samego lustra bitów).

## Kiedy plan jest uznany za ukończony

Implementacja w repozytorium to tylko część pracy — **zamknięcie w sensie produktowym** wymaga jasnego **wyboru celu** (telemetria vs sen przy wpiętym węźle). Przy celu „**nie zakłamywać** wyniku sztucznym podtrzymaniem” przyjmuje się **bramę**: **najpierw Test A / uśpienie** — patrz [Wnioski ostateczne](#wnioski-ostateczne-stan-na-2026-04-11).

1. **Scenariusz A (`sleep-path`) — brama (gdy ten cel ma znaczenie):** log z wpiętym urządzeniem i przyjętą polityką firmware; walidator: `--check sleep-path` (+ `--check no-hang`). **Bez sensownego przejścia tej bramy** wyniki testów B/C **nie** świadczą o „właściwości” pełnego cyklu magistrali — jedynie o regresji technicznej (HANG, pompa).
2. **Scenariusz B (warstwa techniczna, opcjonalna po bramie):** jak dotąd — `WAKE_START` → `WAKE_END` → impulsy. W v04 nie ma `MODE:*`; firmware działa w Auto-NM. Walidator:

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
| **v04** | `hardware_v04_auto_nm_sleep_gate.ino` | Auto-NM bez `MODE:*`; stany `AUTO_ACTIVE` / `AUTO_SLEEP_PREP` / `AUTO_SILENT_LISTEN`; ograniczenie odpowiedzi NM po `WAKE_END` i kontrolowane milczenie pod bramę Testu A. |
| **v4.1** | `hardware_v04_1_sleep_hard_silent.ino` | Hard sleep silence: po `SleepInd` brak odpowiedzi NM (`0x40B`) bez wyjątków. A PASS, B FAIL (HANG) na logach v4.1. |

Odtworzenie v01 z innego miejsca:  
`git show aba4daa:hardware/hardware.ino`

## Odniesienia

- Bity `0x42B` (mNM_Gateway_I): `data/id_ramek.txt`
- Logi porównawcze **v01:** `v01_B_zamek_hang_2026-04-11.txt`, `v01_B_swiatla_hang_2026-04-11.txt`, `v01_A_zamek_sleep_ok_2026-04-11.txt`, `v01_A_swiatla_sleep_ok_2026-04-11.txt` (nagłówki wskazują firmware **v01**)

## Tryby Serial (v03 — archiwum)

| Komenda (linia + Enter, 115200) | Odpowiedź firmware | Zachowanie NM `0x40B` |
|----------------------------------|--------------------|------------------------|
| `MODE:KEEPALIVE` | `SYS:CAN:NM_MODE_KEEPALIVE` | Jak v02 — tylko Ring / Alive / Limp w bajcie 1 |
| `MODE:SLEEP_COOP` | `SYS:CAN:NM_MODE_SLEEP_COOP` | Dodatkowo OR z bitami SleepInd/SleepAck z `0x42B` bajt 1 |

**Ryzyko:** tłumienie HANG tylko w pierwszych **2 s** po `WAKE_END` w SLEEP_COOP — jeśli Gateway ma dłuższą fazę przejściową, nadal możliwy HANG lub konieczność dalszego strojenia.

## Kryteria sukcesu (ogólne)

1. **v4.1 / produkcja (pełny warunek):** jednocześnie zaliczone **A (`sleep-path`) i B (`no-hang`+`resilience`)**. Sam PASS w A (jak w v4.1) bez PASS w B nie spełnia celu końcowego.
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

## Test B — scenariusz „impulsy po WAKE_END” (wzór: `v01_B_*_hang_2026-04-11.txt`; na v4.1 ponownie obserwowany HANG)

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
