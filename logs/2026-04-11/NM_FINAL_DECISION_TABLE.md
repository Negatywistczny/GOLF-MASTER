# NM Final Decision Table (evidence-driven)

## Założenia

- Semantyka bitów `0x42B` zgodnie z `logs/2026-04-11/NM_CANONICAL_BASELINE.md`.
- Odpowiedź `0x40B` tylko dla tokena z `Receiver=0x0B`.
- Watchdog może być wygaszony wyłącznie po jawnym pełnym śnie magistrali.

## Tabela decyzji

| Wejście (zdarzenie z `0x42B` / magistrali) | Klasyfikacja dowodu | Dozwolona odpowiedź TX (`0x40B`) | Watchdog | Uzasadnienie |
|---|---|---|---|---|
| `CmdAlive` (`0x02`) + token do `0x0B` | fakt + inferencja | odpowiedź Alive/Ring bez Sleep | aktywny, resetowany | start/utrzymanie ringu |
| `CmdRing` (`0x01`) + aktywne wake-cause | fakt + inferencja | odpowiedź ringowa bez Sleep | aktywny, resetowany | faza S1 |
| `WAKE_END` + token do `0x0B` | fakt | nadal odpowiadać tokenowo (bez wymuszonej ciszy timerem) | aktywny | sama cisza po wake to nie pełny sen |
| `CmdLimpHome` (`0x04`) + token do `0x0B` | fakt + inferencja | obowiązkowa odpowiedź rekonfiguracyjna (nie milczeć) | aktywny | eliminuje E1 (HANG po impulsach) |
| `SleepInd` globalne (`0x10`) + domykanie sekwencji | fakt + inferencja | odpowiedź zgodna z polityką snu (minimalna, bez sztucznego keepalive) | aktywny do pełnego potwierdzenia | etap przejściowy, jeszcze nie pełny sleep |
| pełny sen potwierdzony przez gateway (`SleepInd/SleepAck` w cyklu końcowym) | fakt + inferencja (finalny firmware) | brak podtrzymywania NM po domknięciu | można wygasić | jedyny legalny moment wygaszenia watchdog |
| brak `0x42B` > 2000 ms poza stanem pełnego snu | fakt | brak „nadawania na ślepo” jako substytutu stanu | `ERR:CAN:HANG` | wykrycie utraty komunikacji |

## Reguły zakazane

1. Timerowe przejścia stanów Auto-NM.
2. Wygaszanie watchdoga w stanach pośrednich (`AUTO_SLEEP_PREP`, `AUTO_SILENT_LISTEN`, chwilowa cisza po `WAKE_END`).
3. Bezwarunkowe `always-keepalive` blokujące naturalny sen.
4. Trwałe milczenie przy aktywnym tokenie i `CmdLimpHome`.

## Co warto okresowo potwierdzać kampanią sniffer (monitoring regresji)

- Realny moment ostatniego `0x40B` przed snem.
- Czy `0x661` gaśnie zgodnie z fazą NM (C).
- Czy po impulsach B nie ma luk tokenowych i nie pojawia się E1/E4.

