# NM Canonical Baseline

## Cel

Ujednolicony punkt odniesienia dla analiz i wdrożeń NM po raporcie `data/Analiza i Rozwiązanie Problemu NM CAN.md`.

## Źródła prawdy (kolejność)

1. `data/id_ramek.txt`
2. `data/PQ35_46_ICAN_V3_6_9_F_20081104_ASR_V1_2.dbc`
3. `hardware/hardware.ino`
4. `logs/2026-04-11/NM_COMMUNICATION_VALIDATION.md`
5. `logs/2026-04-11/NM_STATE_SITUATION_CATALOG.md`
6. `data/Analiza i Rozwiązanie Problemu NM CAN.md` (materiał syntezujący)

## Kanoniczna semantyka `0x42B` (bajt 1)

- `0x01` -> `CmdRing`
- `0x02` -> `CmdAlive`
- `0x04` -> `CmdLimpHome`
- `0x10` -> `SleepInd`
- `0x20` -> `SleepAck`

Token dla badanego węzła: `Receiver == 0x0B` (bajt 0).

## Klasyfikacja stwierdzeń

- **Fakt z logów**: bezpośrednio obserwowalne w serialu (`SYS:*`, `0x42B`, `ERR:CAN:HANG`, obecność/nieobecność wzorców).
- **Inferencja z kodu**: wynik analizy logiki `hardware/hardware.ino` (np. `shouldReplyNm`, `hangSuppressed`).
- **Hipoteza pomiarowa**: wymaga potwierdzenia zewnętrznym snifferem (zwłaszcza `0x40B`, `0x661`, których serial nie pokazuje).

## Zasady spójności terminologii

- W dokumentach i analizach używać nazw bitów zgodnych z listą kanoniczną powyżej.
- Przy konflikcie opisowym (np. w materiałach narracyjnych) obowiązuje `id_ramek.txt`.
- W tabelach decyzji jasno oznaczać, czy dany warunek jest:
  - sygnałem z magistrali,
  - stanem wewnętrznym firmware,
  - hipotezą opartą o efekt pośredni.

## Konsekwencja praktyczna

Każda kolejna iteracja firmware i każda analiza logów musi zaczynać się od tego pliku, żeby uniknąć regresji semantycznych (zwłaszcza zamiany `CmdRing`/`CmdAlive`) i błędnych wniosków o zachowaniu węzła.

