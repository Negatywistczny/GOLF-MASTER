@echo off
echo Uruchamianie systemu GOLF MASTER...

:: Uruchom Pythona w tle
start python bridge/bridge.py

:: Poczekaj 2 sekundy, żeby Python zdążył otworzyć port
timeout /t 2 /nobreak > NUL

:: Otwórz przeglądarkę Chrome z Twoim linkiem (zezwoleniem na brak HTTPS)
start chrome "https://negatywistczny.github.io/GOLF-MASTER/web" --allow-running-insecure-content