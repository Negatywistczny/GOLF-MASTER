# NM Regression Suite v01-v05

## Cel

Zamknąć iterację przez porównanie zachowania względem profili historycznych `v01-v05`.

## Profil referencyjny

- `v01`: A PASS, B FAIL (HANG)
- `v02/v03`: B PASS techniczny, A FAIL (brak domknięcia snu)
- `v04_1`: A PASS, B FAIL (HANG)
- `v05`: A FAIL krytyczny (E4: urwanie bez HANG)

## Wynik regresji (na podstawie `NM_GATED_VALIDATION_BASELINE.md`)

| Profil | Oczekiwany wzorzec | Potwierdzenie |
|---|---|---|
| v01 | Sleep działa, impuls B zrywa ring (`ERR:CAN:HANG`) | potwierdzono |
| v02 | Brak HANG po impulsach; A FAIL bo **procedura snu nie startuje** (keepalive pierścienia) — w logu często brak `SLEEP_IND`, bo **do tej fazy się nie dochodzi** (≠ „błąd obsługi SleepInd”) | potwierdzono |
| v03 | Jak v02 (warianty KA/SC), C bez pełnej obserwacji serialem | potwierdzono |
| v04_1 | Powrót do A PASS kosztem B FAIL | potwierdzono |
| v05 | Krytyczne maskowanie (urwanie bez HANG) | potwierdzono |

## Anty-regresja do następnego firmware

Nowa wersja jest akceptowalna dopiero gdy jednocześnie:

1. nie odtwarza profilu `v01/v04_1` (B FAIL z HANG),
2. nie odtwarza profilu `v02/v03` (ciągłe podtrzymywanie i A FAIL),
3. nie odtwarza profilu `v05` (E4: urwanie bez alarmu),
4. przechodzi A i B na tym samym buildzie,
5. ma potwierdzenie C w snifferze (nie tylko serial).

## Status zamknięcia iteracji planu

- Zestaw regresyjny `v01-v05` został opisany i usztywniony jako brama wejścia dla kolejnych zmian.
- Iteracja dokumentacyjno-walidacyjna: **zamknięta**.
- Iteracja implementacyjna firmware: **zamknięta** (finalny fix wdrożony w `v10` / `v10-refactor`).

## Domknięcie po finalnym fixie (`v10-refactor`)

- Bieżący profil roboczy nie odtwarza historycznych błędów E1/E2/E3/E4.
- `v01-v05` pozostaje tylko zbiorem anty-regresyjnym i materiałem porównawczym.
- Nowe uruchomienia testów A/B/C traktować jako kontrolę regresji dla kolejnych zmian, nie jako otwarty problem komunikacji.

