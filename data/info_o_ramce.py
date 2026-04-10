import importlib
import sys
from pathlib import Path

try:
    cantools = importlib.import_module("cantools")
except ModuleNotFoundError:
    print("BŁĄD: Brak modułu 'cantools'. Zainstaluj go poleceniem: python3 -m pip install cantools")
    sys.exit(1)

# 1. Nazwa Twojego pliku DBC
nazwa_pliku = str(Path(__file__).with_name('PQ35_46_ICAN_V3_6_9_F_20081104_ASR_V1_2.dbc'))

# Wczytanie bazy danych
db = cantools.database.load_file(nazwa_pliku)

# ==========================================
# 2. TUTAJ WPISZ NAZWĘ RAMKI LUB JEJ ID
# ==========================================
szukana_nazwa = "BAP_AUDIO" # Zmień na nazwę ramki, której szukasz

try:
    # Szukamy wiadomości po nazwie
    msg = db.get_message_by_name(szukana_nazwa)
    
    print("=" * 50)
    print(f"=== INFORMACJE O RAMCE: {msg.name} ===")
    print("=" * 50)
    print(f"ID (Dziesiętne):  {msg.frame_id}")
    print(f"ID (Szesnastkowe): {hex(msg.frame_id)}")
    print(f"Długość (DLC):    {msg.length} bajtów")
    print(f"Nadawca (Tx):     {', '.join(msg.senders) if msg.senders else 'Brak przypisanego nadawcy'}")
    # Czas cyklu (Cycle Time) czasami bywa ukryty, sprawdzamy to:
    cycle_time = msg.send_type if hasattr(msg, 'send_type') else msg.cycle_time
    print(f"Czas cyklu:       {cycle_time} ms (0 = wysyłane przy zmianie, OnChange)")
    print(f"Opis (Komentarz): {msg.comment if msg.comment else 'Brak opisu'}")
    print("\n" + "=" * 50)
    print("=== SYGNAŁY W TEJ RAMCE ===")
    print("=" * 50)
    
    for sig in msg.signals:
        print(f"-> SYGNAŁ: {sig.name}")
        if sig.comment:
            print(f"   Opis:           {sig.comment}")
        print(f"   Startbit:       {sig.start}")
        print(f"   Długość:        {sig.length} bitów")
        print(f"   Kolejność bajtów:{'Motorola (Big-endian)' if sig.byte_order == 'big_endian' else 'Intel (Little-endian)'}")
        print(f"   Typ:            {'Ze znakiem (Signed)' if sig.is_signed else 'Bez znaku (Unsigned)'}")
        print(f"   Przelicznik:    Wartość = (Dane x {sig.scale}) + ({sig.offset})")
        print(f"   Zakres fizyczny:{sig.minimum} do {sig.maximum}")
        print(f"   Jednostka:      {sig.unit if sig.unit else 'Brak'}")
        
        # Wypisanie Value Table (Tabeli Wartości)
        if sig.choices:
            print(f"   Znaczenie wartości (Value Table):")
            for val, desc in sig.choices.items():
                print(f"      {val} = {desc}")
        print("   " + "." * 40)

except KeyError:
    print(f"BŁĄD: Nie znaleziono ramki o nazwie '{szukana_nazwa}' w pliku DBC.")
    print("Upewnij się, że wpisałeś poprawną nazwę (uwzględnij wielkość liter!).")