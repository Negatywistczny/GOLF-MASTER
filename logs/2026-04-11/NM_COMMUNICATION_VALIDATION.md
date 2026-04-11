# Walidacja komunikacji NM (PQ35 Infotainment) — checklista

Kryteria odnoszą się do firmware w `hardware/hardware.ino` (obecnie **v02** — patrz tabela archiwum).

## Wnioski (wersje firmware i logi)

### v01 — `hardware_v01_aba4daa__tests-1-4.ino` (git `aba4daa`)

- **test3 / test4:** pełna sekwencja snu na magistrali (m.in. `SLEEP_IND`, `0x42B` z `0B 14…`). Skrypt: wszystkie trzy checki (`no-hang`, `sleep-path`, `resilience`) → **OK**.
- **test1 / test2:** po `WAKE_END` powtarzane impulsy użytkownika → **`ERR:CAN:HANG`**; brak domknięcia snu w logu. Przyczyna: NM było nadawane tylko przy `isBusActive` i tylko dla `CmdRing`/`CmdAlive` — **brak odpowiedzi na `CmdLimpHome` (`0x04`)**, więc pierścień się rwał.
- Wniosek: **v01** jest dobrym referencją do walidacji **ścieżki snu** na zapisanych logach, ale **nie** spełnia wymogu stabilności po impulsach po `WAKE_END`.

### v02 — `hardware_v02_nm_netstate_plan.ino` / `hardware/hardware.ino`

- **testA / testB (pole):** **`no-hang`** i **`resilience`** → **OK** — problem HANG z test1/2 jest adresowany (odpowiedź NM na Ring|Alive|Limp bez gatingu `isBusActive`; pompa `0x661` tylko w `NET_ACTIVE`).
- **`sleep-path`** na logu **z wpiętym** Arduino i **obecną** polityką „zawsze odpowiadaj na token NM” → zwykle **FAIL** (brak `SLEEP_IND`): węzeł **nadal uczestniczy w pierścieniu**, więc Gateway **nie domyka** pełnej procedury usypiania Infotainment „obok” tego urządzenia. Log **nie ma naturalnego końca** — to oczekiwane przy ręcznym zatrzymaniu nagrywania, nie „ucięty plik”.
- Wniosek: **v02** realizuje cel **stabilnej komunikacji i braku HANG**; **wyklucza to samo** co jednoczesne łatwe uzyskanie **pełnego snu magistrali na serialu** bez zmiany polityki (np. celowe wyciszenie NM w fazie gotowości do snu / test bez aktywnego węzła).

### Kompromis projektowy

| Cel | v01 | v02 |
|-----|-----|-----|
| Ścieżka snu widoczna w logu (Test A / `sleep-path`) | Tak (przy sprzyjających warunkach auta) | Zwykle nie przy ciągłej odpowiedzi NM |
| Odporność po impulsach po `WAKE_END` (Test B / `resilience`) | Nie (HANG w test1/2) | Tak (testA/B) |
| `no-hang` | test3/4 OK; test1/2 FAIL | testA/B OK |

### Skrypt walidacji

- Ścieżka: `scripts/validate_nm_serial_log.py` (z katalogu głównego repo).
- Dla **v02** sensowny zestaw po polu: `--check no-hang --check resilience`.
- Pełny **`sleep-path`** weryfikuj na logach **v01** (test3/4) lub na nagraniu **bez** podtrzymującego węzła / innym firmware testowym.

## Ważne: obecny firmware a pełna sekwencja snu (Test A)

Przy **aktualnej** logice Arduino magistrala jest **dalej aktywna z punktu widzenia NM**, dopóki Gateway adresuje węzeł `0x0B`: firmware **zawsze** odpowiada ramką `0x40B` (przekazanie tokenu), a w fazie `NET_ACTIVE` dodatkowo nadaje `0x661`. To **sztucznie utrzymuje udział węzła w pierścieniu** i sprawia, że Gateway **zwykle nie zakończy** pełnej procedury usypiania Infotainment w obecności tego urządzenia.

Skutek praktyczny:

- Log seriala **może nie mieć „naturalnego końca”** — strumień `0x42B` / `0x65F` itd. trwa dalej; to **nie** jest błąd zapisu ani „ucięty plik”, jeśli nagrywanie zatrzymałeś ręcznie.
- **`SYS:CAN:SLEEP_IND` oraz ramka `0x42B` z `0B 14…` (LimpHome + SleepInd) w tej konfiguracji raczej się nie pojawią** — dopóki nie wprowadzisz osobnej polityki (np. celowe wyciszenie TX NM / symulacja gotowości do snu zgodnie z OSEK, albo test bez podłączonego węzła „radio”).

**Test A (`sleep-path` w skrypcie)** da się zaliczyć na logu **bez** obecnego węzła podtrzymującego pierścień, albo z **innym** firmware testowym, albo z nagraniem z samego auta **przed** wpięciem Arduino / z wersją która nie odpowiada na token.

Pozostałe checki (`no-hang`, `resilience`) nadal mają sens przy obecnym kodzie — sprawdzają stabilność NM bez zrywania komunikacji po `WAKE_END`.

## Kiedy plan jest uznany za ukończony

Implementacja w repozytorium to tylko część pracy — **plan zamykamy po testach w aucie** z firmware **v02**.

1. **Scenariusz B (obowiązkowy dla v02):** log seriala (115200), `WAKE_START` → `WAKE_END` → wiele impulsów po `WAKE_END` → brak `ERR:CAN:HANG`.
2. Walidator musi przejść co najmniej:

```text
python scripts/validate_nm_serial_log.py TWOJ_LOG_B.txt --check no-hang --check resilience
```

3. **Scenariusz A (`sleep-path`)** przy **v02** i wpiętym, odpowiadającym węźle **nie jest** warunkiem zamknięcia planu (patrz wnioski powyżej). Ten check nadal służy regresji na archiwum **v01** (`test3.txt`, `test4.txt`) lub do przyszłej wersji firmware z polityką snu.

Opcjonalnie pełne trzy checki na starym materiale:

```text
python scripts/validate_nm_serial_log.py logs/2026-04-11/test4.txt
```

**Archiwum logów (v01):**

- `test3.txt`, `test4.txt` — wszystkie trzy checki **OK**.
- `test1.txt`, `test2.txt` — **FAIL** (`HANG`, brak pełnej ścieżki snu) — dokumentuje problem **v01**, naprawiony w **v02** pod kątem `resilience`.

## Archiwum wersji firmware (numeracja)

| Wersja | Plik w `logs/2026-04-11/` | Opis |
|--------|---------------------------|------|
| **v01** | `hardware_v01_aba4daa__tests-1-4.ino` | Odtworzone z gita: `hardware/hardware.ino` @ commit **aba4daa** — **to jest firmware referencyjny do logów test1–test4** (przed planem NetState / bezwarunkowego NM na Limp). |
| **v02** | `hardware_v02_nm_netstate_plan.ino` | Kopia roboczego planu NM (NetState, Grace, odpowiedź NM na Ring\|Alive\|Limp, `0x661` tylko w `NET_ACTIVE`). Powinna odpowiadać `hardware/hardware.ino` w drzewie roboczym. |

Odtworzenie v01 z innego miejsca:  
`git show aba4daa:hardware/hardware.ino`

## Odniesienia

- Bity `0x42B` (mNM_Gateway_I): `data/id_ramek.txt`
- Logi porównawcze: `logs/2026-04-11/test1.txt` … `test4.txt` (nagłówek w każdym logu wskazuje **v01**)

## Kryteria sukcesu (ogólne)

1. **v02 / produkcja:** brak `ERR:CAN:HANG` po wielokrotnych impulsach użytkownika **po** `SYS:CAN:WAKE_END`, o ile Gateway nadal adresuje węzeł `0x0B`.
2. **v01 lub autobus bez podtrzymującego węzła:** powtarzalne dojście do `SYS:CAN:SLEEP_IND` i sekwencji z `0x42B` typu `0B 14 …` (wzór: `test3`/`test4`).
3. **v02:** po `WAKE_END` brak ciągłego nadawania `0x661` (pompa tylko w `NET_ACTIVE`).
4. **v02:** odpowiedzi `0x40B` przy tokenie do `0x0B` także przy `CmdLimpHome` (`0x04` / `0x14` w bajcie 1 — `id_ramek.txt`).

## Test A — scenariusz „udany sen” (wzór: test3, test4)

| Krok | Akcja | Oczekiwane na serialu / CAN |
|------|--------|-----------------------------|
| A1 | Jedno wybudzenie (np. światła / zamek) | `SYS:CAN:WAKE_START`, potem ruch `0x42B` z `02 80 02` (para z `01`) |
| A2 | Odczekać naturalny koniec cyklu | `SYS:CAN:WAKE_END`, potem `0x42B` z `02 00 00 …` |
| A3 | Bez dodatkowych impulsów | `0x42B:0B 04 …`, `SYS:CAN:SLEEP_IND`, `0x42B:0B 14 …` |
| A4 | — | Brak `ERR:CAN:HANG` |

## Test B — scenariusz „impulsy po WAKE_END” (wzór: test1, test2 — wcześniej HANG)

| Krok | Akcja | Oczekiwane |
|------|--------|------------|
| B1 | `WAKE_START` → `WAKE_END` jak w teście A | Jak wyżej |
| B2 | Wielokrotne impulsy zamka `0x291` lub manetki `0x2C1` **po** `WAKE_END` | Nadal odpowiedzi NM na `0x42B→0x0B`; **brak** `ERR:CAN:HANG` |
| B3 | Monitorować `0x661` | Brak ciągłej pompy po `WAKE_END` (stan `NET_GRACE` / `NET_SLEEP_READY` / `NET_SLEEP`) |

## Test C — regresja radia (`0x661`)

| Krok | Akcja | Oczekiwane |
|------|--------|------------|
| C1 | Trwanie w fazie między `WAKE_START` a `WAKE_END` | Okresowe ramki `0x661` (~co 150 ms) |
| C2 | Po `WAKE_END` | Ustanie pompy `0x661` do następnego `WAKE_START` |

## Notatki

- Ponowne wejście w `NET_ACTIVE` jest **tylko** przy `WAKE_START` (przejście `wakeCombo` z 0 na ≠0 w ramce Alive z Gatewaya) — impulsy komfortu same w sobie nie włączają pompy `0x661`.
- Stałe czasowe (`GRACE_AFTER_WAKE_END_MS`, `SLEEP_READY_TO_SLEEP_MS`) można stroić pod konkretny pojazd po logach.
