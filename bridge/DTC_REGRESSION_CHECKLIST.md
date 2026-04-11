# DTC Regression Checklist (PQ35)

## Cel
Szybka walidacja, że pełny skan DTC działa poprawnie po zmianach bridge/web.

## 1) Test lokalny (bez auta)
- Uruchom `bridge/test_simulation.py`.
- Uruchom Web UI i kliknij `SKANUJ DTC`.
- Zweryfikuj:
  - pojawia się panel wyników DTC,
  - status przechodzi `START -> RUNNING -> DONE`,
  - każdy moduł ma rekord `module_result`,
  - przycisk po zakończeniu wraca do aktywnego stanu.

## 2) Test na aucie — zapłon ON, silnik OFF
- Uruchom `bridge/bridge.py` i UI.
- Wykonaj pełny skan.
- Zweryfikuj:
  - brak zawieszeń sesji (timeouty opisywane per moduł),
  - raport końcowy zawiera liczniki `moduleErrors`, `modulesWithDtc`, `totalDtcs`,
  - przy błędzie komunikacji widoczny jest kod (`gateway_setup_timeout`, `timing_timeout`, `incomplete_payload`).

## 3) Test na aucie — silnik ON (postój)
- Powtórz skan z uruchomionym silnikiem.
- Porównaj zmiany DTC vs test z pkt 2 (czy statusy są spójne i powtarzalne).

## 4) Test na aucie — przejazd
- Wykonaj skan po krótkiej jeździe.
- Zweryfikuj czy:
  - sesje przechodzą bez nadmiarowych timeoutów,
  - kody DTC i statusy są prezentowane w tabeli bez analizy surowego terminala.

## 5) Test po wyjęciu kluczyka / sleep
- Po przejściu auta do stanu sleep uruchom skan.
- Oczekiwane: część modułów może zwrócić `comm_error`; UI ma to jasno oznaczyć, bez mylenia z `clean`.

## 6) Kryteria PASS
- Brak regresji w strumieniu CAN live.
- Skan zwraca strukturalne eventy JSON (`start/progress/module_result/complete/error`).
- UI pokazuje wynik per moduł (adres, protokół, status, liczba DTC, szczegóły).
