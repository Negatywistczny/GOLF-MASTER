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
| v02 | Brak HANG po impulsach, ale brak `SLEEP_IND` | potwierdzono |
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
- Iteracja implementacyjna firmware: **otwarta** (wymaga nowych logów A/B/C + sniffer).

