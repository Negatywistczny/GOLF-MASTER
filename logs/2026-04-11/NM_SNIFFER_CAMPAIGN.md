# NM Sniffer Campaign (serial + CAN)

## Zakres

Kampania obejmuje równoległy zapis:

- serial firmware (`SYS:*`, dekodowane `0x42B`),
- surowy CAN ze sniffera dla ID: `0x42B`, `0x40B`, `0x661`, `0x2C1`, `0x291`.

## Status wdrożenia w repo

- [x] Zdefiniowano wymagane ID i zdarzenia synchronizacyjne.
- [x] Zdefiniowano format artefaktów i nazewnictwo sesji.
- [x] Dodano szablon wyników do uzupełniania po każdej próbie.
- [ ] Wykonanie pomiarów na pojeździe (poza repo, do uzupełnienia).

## Nazewnictwo sesji

`nm_sniff_<test>_<firmware>_<yyyy-mm-dd>_<run-id>`

Przykład: `nm_sniff_A_v06_2026-04-11_r01`

## Procedura każdej próby

1. Uruchom serial logowanie i zanotuj znacznik `SYS:HW:READY`.
2. Uruchom sniffer w trybie listen-only.
3. Wykonaj scenariusz:
   - **A**: naturalne wygaszanie do snu,
   - **B**: impulsy `0x2C1`/`0x291` po `WAKE_END`,
   - **C**: obserwacja `0x661` względem faz NM.
4. Zatrzymaj oba logi i zapisz metadane sesji.
5. Uzupełnij tabelę z `NM_SNIFFER_CAPTURE_TEMPLATE.csv`.

## Punkty synchronizacji czasu

- `WAKE_START` (serial) <-> pierwszy burst `0x42B` aktywny (`0B 02 80 02 ...`).
- `WAKE_END` (serial) <-> przejście `0x42B` na `0B 02 00 00 ...`.
- `SLEEP_IND` (serial) <-> `0x42B` z `0B 14 00 00 ...`.
- `ERR:CAN:HANG` (serial) <-> luka >2 s w spodziewanym cyklu tokena.

## Kryteria akceptacji kampanii

1. Każdy log A/B/C ma parę `serial + raw CAN`.
2. Da się wskazać realne TX `0x40B` i `0x661` dla każdej fazy S1/S2/S3.
3. Hipotezy z raportu są oznaczone jako potwierdzone albo odrzucone.
4. Materiał wejściowy wystarcza do finalnej tabeli decyzji.

