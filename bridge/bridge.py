import serial
import asyncio
import websockets
import serial.tools.list_ports
import time
import os  # NOWOŚĆ: Potrzebne do twardego zamykania procesu

# --- KONFIGURACJA ---
SERIAL_PORT = 'COM7'
BAUD_RATE = 115200
WS_HOST = 'localhost'
WS_PORT = 8765

connected_clients = set()
has_connected_once = False  # Flaga, by nie wyłączać się przed pierwszym połączeniem
shutdown_task = None        # Zadanie odliczające do wyłączenia
tx_queue = asyncio.Queue()  # Kolejka komend do wysłania
rx_queue = asyncio.Queue()  # Kolejka nasłuchująca do analizy ramek TP 2.0

async def auto_shutdown_timer():
    """Odlicza 2 sekundy i zabija proces, jeśli nikogo nie ma"""
    print("SYS:PY:NO_CLIENTS_WAITING_2S")
    await asyncio.sleep(2)
    if len(connected_clients) == 0:
        print("--- SYS:PY:AUTO_SHUTDOWN ---")
        os._exit(0)  # Skuteczne zamknięcie całego procesu Pythona i portu COM

async def handle_serial():
    """Funkcja odpowiedzialna za czytanie z Arduino i rozsyłanie do przeglądarek"""
    while True:
        ser = None
        try:
            ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=0.1)
            print(f"SYS:PY:CONNECTED_TO_{SERIAL_PORT}")
            await broadcast("SYS:PY:SERIAL_READY")

            while True:
                # --- WYSYŁANIE KOMEND DO ARDUINO (TX) ---
                if not tx_queue.empty():
                    msg_to_send = tx_queue.get_nowait()
                    ser.write(msg_to_send.encode('ascii'))
                    print(f"SYS:PY:TX_SENT_TO_AUTO: {msg_to_send.strip()}")

                # --- ODBIERANIE DANYCH Z ARDUINO (RX) ---
                if ser.in_waiting > 0:
                    try:
                        line = ser.readline().decode('utf-8').strip()
                        if line:
                            await broadcast(line)
                            await rx_queue.put(line) # Kopia ramki dla maszyny stanów TP 2.0
                    except UnicodeDecodeError:
                        pass
                await asyncio.sleep(0.001)

        except (serial.SerialException, FileNotFoundError):
            error_msg = f"ERR:PY:SERIAL_LOST:{SERIAL_PORT}"
            print(error_msg)
            await broadcast(error_msg)
            
            if ser:
                ser.close()
            
            await asyncio.sleep(3)

async def broadcast(message):
    """Wysyła wiadomość do wszystkich otwartych kart w przeglądarce"""
    if connected_clients:
        await asyncio.gather(*(client.send(message) for client in connected_clients), return_exceptions=True)

async def tp20_read_dtc(addr_hex, name, websocket):
    """Przeprowadza pełny 4-etapowy Handshake TP 2.0 z jednym modułem"""
    addr_int = int(addr_hex, 16)
    rx_id_expected = f"0x{200 + addr_int:03X}" # Np. dla 01 to będzie 0x201
    
    # 1. Czyszczenie starych ramek z kolejki RX
    while not rx_queue.empty():
        rx_queue.get_nowait()
        
    # 2. NAWIĄZANIE SESJI (Channel Setup)
    await websocket.send(f"SYS:PYTHON: [1/4] Łączenie z {name} (0x{addr_hex})...")
    await tx_queue.put(f"TX:200:7:{addr_hex} C0 00 10 00 03 01\n")
    
    tx_channel = None
    
    # 3. CZEKAMY NA ODPOWIEDŹ GATEWAYA (np. 0x201)
    try:
        # Czekamy max 1.5 sekundy na odpowiedź od Gatewaya
        while True:
            line = await asyncio.wait_for(rx_queue.get(), timeout=1.5)
            if line.startswith(rx_id_expected):
                # Oczekujemy: 0x201: 00 D0 00 03 40 07 01
                parts = line.split(":")
                if len(parts) >= 2:
                    data_bytes = parts[1].strip().split()
                    if len(data_bytes) >= 7 and data_bytes[1] == "D0":
                        # Format Little-Endian: 40 07 -> 0740
                        tx_channel = f"{data_bytes[5]}{data_bytes[4]}".lstrip('0')
                        break
    except asyncio.TimeoutError:
        await websocket.send(f"SYS:PYTHON: ❌ Brak odpowiedzi od {name}. Moduł uśpiony lub nieobecny.")
        return

    if not tx_channel:
        return

    await websocket.send(f"SYS:PYTHON: [2/4] Zgoda! Nasz kanał TX to 0x{tx_channel}")
    
    # 4. CZEKAMY NA PROŚBĘ O TIMINGI (0x300: A8)
    try:
        while True:
            line = await asyncio.wait_for(rx_queue.get(), timeout=1.0)
            if line.startswith("0x300:"):
                data_bytes = line.split(":")[1].strip().split()
                if data_bytes[0] == "A8":
                    break
    except asyncio.TimeoutError:
        # Czasami moduł nie pyta, tylko czeka na parametry - idziemy dalej
        pass

    # 5. POTWIERDZAMY TIMING PARAMETERS
    await websocket.send(f"SYS:PYTHON: [3/4] Potwierdzam Timingi (A0)...")
    await tx_queue.put(f"TX:{tx_channel}:6:A0 0F 8A FF 32 FF\n")
    await asyncio.sleep(0.1)
    
    # 6. WYSYŁAMY ŻĄDANIE KWP2000 (0x18 - Read DTC by Status)
    # 11 = Ramka SF (Single Frame), 04 = Długość danych KWP2000, 18 = Read DTC
    await websocket.send(f"SYS:PYTHON: [4/4] Żądam Kody DTC KWP2000...")
    await tx_queue.put(f"TX:{tx_channel}:6:11 04 18 00 00 00\n")
    
    # 7. ODBIERAMY BŁĘDY NA KANALE 0x300
    dtc_frames = 0
    try:
        # Czekamy na pakiety z danymi DTC (ignorujemy sterujące A8, B1 itp.)
        while True:
            line = await asyncio.wait_for(rx_queue.get(), timeout=1.0)
            if line.startswith("0x300:"):
                data_bytes = line.split(":")[1].strip().split()
                if data_bytes[0] not in ["A8", "B1", "B2", "B3", "B4", "B5", "A0", "A1"]:
                    dtc_frames += 1
    except asyncio.TimeoutError:
        pass # Koniec transmisji
        
    if dtc_frames > 0:
        await websocket.send(f"SYS:PYTHON: ✅ Odebrano {dtc_frames} ramek z kodami DTC z {name}!")
    else:
        await websocket.send(f"SYS:PYTHON: ✅ {name} jest czysty (Brak DTC).")
        
    # 8. ZAMKNIĘCIE KANAŁU (Disconnect - A4)
    await tx_queue.put(f"TX:{tx_channel}:1:A4\n")
    await websocket.send(f"SYS:PYTHON: Sesja zamknięta. Przechodzę dalej...\n")
    await asyncio.sleep(0.5) # Oddech przed kolejnym modułem


async def perform_full_scan(websocket):
    """Zarządza sekwencyjnym odpytywaniem modułów"""
    modules = {
        "01": "Silnik (Engine)",
        "02": "Skrzynia Biegów (Auto Trans)",
        "03": "ABS / ESP / Hamulce",
        "08": "Klimatyzacja (Climatronic)",
        "09": "Centralna Elektryka (Bordnetz)",
        "15": "Poduszki Powietrzne (Airbag)",
        "16": "Koło Kierownicy (Steering Wheel)",
        "17": "Zestaw Wskaźników (Instrument Cluster)",
        "19": "Gateway CAN (J533)",
        "25": "Immobilizer",
        "37": "Nawigacja",
        "42": "Elektronika Drzwi Kierowcy",
        "44": "Wspomaganie Kierownicy (Steering Assist)",
        "46": "Moduł Komfortu (Central Convenience)",
        "52": "Elektronika Drzwi Pasażera",
        "56": "Radio / Infotainment",
        "62": "Elektronika Drzwi Tylnych Lewych",
        "72": "Elektronika Drzwi Tylnych Prawych",
        "77": "Telefon / Bluetooth"
    }
    
    await websocket.send("SYS:PYTHON: --- START AUTO-SKAN (KWP2000 over TP2.0) ---")
    
    for addr, name in modules.items():
        # Uruchamiamy proces uścisku dłoni dla pojedynczego modułu
        await tp20_read_dtc(addr, name, websocket)
        
    await websocket.send("SYS:PYTHON: --- AUTO-SKAN ZAKOŃCZONY ---")

async def ws_handler(websocket):
    """Obsługa nowych połączeń z przeglądarki"""
    global has_connected_once, shutdown_task
    
    connected_clients.add(websocket)
    has_connected_once = True
    
    # Anulowanie odliczania (np. jeśli użytkownik tylko odświeżył stronę)
    if shutdown_task is not None and not shutdown_task.done():
        shutdown_task.cancel()
        print("SYS:PY:SHUTDOWN_CANCELLED")

    print(f"SYS:PY:BROWSER_CONNECTED (Total: {len(connected_clients)})")
    
    try:
        # Pętla nasłuchująca wiadomości od przeglądarki (Smart UI)
        async for message in websocket:
            if message.startswith("CMD:"):
                command = message.split(":")[1]
                
                if command == "REQ_FULL_SCAN":
                    print("[DIAG] Otrzymano żądanie Auto-Scan z UI.")
                    
                    # Tworzymy asynchroniczne zadanie w tle, żeby nie zablokować nasłuchiwania WebSocketa
                    asyncio.create_task(perform_full_scan(websocket))
    finally:
        connected_clients.remove(websocket)
        print(f"SYS:PY:BROWSER_DISCONNECTED (Total: {len(connected_clients)})")
        
        # Inicjacja procesu zamykania po utracie ostatniego klienta
        if len(connected_clients) == 0:
            shutdown_task = asyncio.create_task(auto_shutdown_timer())

async def main():
    print(f"--- GOLF MASTER BRIDGE STARTING ON ws://{WS_HOST}:{WS_PORT} ---")
    
    server = websockets.serve(ws_handler, WS_HOST, WS_PORT)
    await asyncio.gather(server, handle_serial())

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n--- BRIDGE CLOSED BY USER ---")