import asyncio
import websockets
import os

# --- KONFIGURACJA ---
WS_HOST = 'localhost'
WS_PORT = 8765

# Lista ramek do wysłania (formatowanie zachowane zgodnie z Twoją listą)
CAN_FRAMES = [
    "0x151: 00 F0 C8 38",
    "0x291: 08 00 00 00 00",
    "0x2C1: 00 00 80 00 00",
    "0x2C3: 07",
    "0x351: 00 00 00 00 00 00 00 00",
    "0x359: 18 01 00 01 00 2B 00 00",
    "0x35B: 00 50 0F 61 08 19 C2 4D",
    "0x3C3: A8 00 00 00 80 F0 00 67",
    "0x3E1: 20 00 12 00 00 00 00 00",
    "0x3E3: 00 00 00 00 00 00 00 00",
    "0x42B: 0B 04 00 00 00 00",
    "0x470: 00 00 00 00 00",
    "0x531: 00 00 40 40",
    "0x527: 10 01 00 60 7A 7F 7E 00",
    "0x551: 02",
    "0x555: E9 49 7D 01 64 00 00 60",
    "0x557: 25 00 00 3F 4C 00 00 00",
    "0x571: BD 00 00 00 00 00",
    "0x575: 47 20 00 80",
    "0x60E: 08 00",
    "0x621: 00 70 2F 0E 02",
    "0x62F: 00 00 00 00",
    "0x635: 00 00 00",
    "0x651: 80 03 59 AF 29 48",
    "0x653: 81 00 A4",
    "0x655: 75 00 60 3F 5C 10 00 00",
    "0x65D: B4 8B 76 04 00 30 3F 0A",
    "0x65F: 00 00 00 00 00 57 56 57"
]

connected_clients = set()
shutdown_task = None
is_scanning = False

async def auto_shutdown_timer():
    """Zamyka proces, jeśli nikt nie jest podłączony przez 2 sekundy"""
    await asyncio.sleep(2)
    if len(connected_clients) == 0:
        print("--- SYS:PY:AUTO_SHUTDOWN (SIMULATOR) ---")
        os._exit(0)

async def broadcast(message):
    """Rozsyła wiadomość do wszystkich odbiorców"""
    if connected_clients:
        disconnected = set()
        for client in connected_clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(client)
        connected_clients.difference_update(disconnected)

async def log_and_send(websocket, message: str):
    """Wyświetla log w konsoli i wysyła go do konkretnego klienta"""
    print(message)
    try:
        await websocket.send(message)
    except websockets.exceptions.ConnectionClosed:
        pass

async def simulate_can_bus():
    """Symuluje pracę magistrali CAN - wysyła ramki w pętli"""
    print("SYS:PY:SIMULATOR_STARTED")
    while True:
        if connected_clients:
            # Wysyłamy całą paczkę ramek w jednej serii
            for frame in CAN_FRAMES:
                await broadcast(frame)
                # Krótki odstęp między ramkami, aby nie zablokować bufora przeglądarki
                await asyncio.sleep(0.01) 
            
            # Czekamy 100ms przed kolejnym odświeżeniem całej listy ramek
            await asyncio.sleep(0.1)
        else:
            # Jeśli nikt nie słucha, czekamy sekundę i sprawdzamy ponownie
            await asyncio.sleep(1)

async def simulate_tp20_read_dtc(addr_hex, name, websocket):
    """
    Symulacja odpowiednika tp20_read_dtc() z bridge.py.
    Nie komunikuje się z hardware - jedynie emituje analogiczne logi i ramki.
    """
    await log_and_send(websocket, f"SYS:PYTHON: [1/4] Łączenie z {name} (0x{addr_hex})...")
    await asyncio.sleep(0.08)

    tx_channel = f"{int(addr_hex, 16) + 0x300:03X}".lstrip("0")
    await log_and_send(websocket, f"SYS:PYTHON: [2/4] Zgoda! Kanał TX to 0x{tx_channel}")

    await asyncio.sleep(0.05)
    await log_and_send(websocket, "SYS:PYTHON: [3/4] Potwierdzam Timingi (A0)...")
    await asyncio.sleep(0.05)

    await log_and_send(websocket, "SYS:PYTHON: [4/4] Żądam Kody DTC KWP2000...")
    await asyncio.sleep(0.08)

    # Prosta, deterministyczna symulacja: niektóre moduły zwracają DTC.
    has_dtc = int(addr_hex, 16) % 3 == 0
    if has_dtc:
        dtc_frame = f"0x300: 58 04 {addr_hex} 00 11 22 33"
        await broadcast(dtc_frame)
        await log_and_send(websocket, f"SYS:PYTHON: ⚠️ OTRZYMANO DANE DTC: {dtc_frame}")
        await log_and_send(websocket, f"SYS:PYTHON: ✅ Odebrano 1 ramek z kodami DTC z {name}!")
    else:
        await log_and_send(websocket, f"SYS:PYTHON: ✅ {name} jest czysty (Brak DTC).")

    await log_and_send(websocket, "SYS:PYTHON: Sesja zamknięta. Przechodzę dalej...")
    await asyncio.sleep(0.12)

async def perform_full_scan(websocket):
    """Symulowany auto-skan modułów, zgodny przepływem z bridge.py."""
    global is_scanning
    if is_scanning:
        await log_and_send(websocket, "SYS:PYTHON: ⚠️ Skanowanie już trwa. Proszę czekać.")
        return

    is_scanning = True
    try:
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
            "77": "Telefon / Bluetooth",
        }

        await log_and_send(websocket, "SYS:PYTHON: --- START AUTO-SKAN (KWP2000 over TP2.0) ---")
        for addr, name in modules.items():
            await simulate_tp20_read_dtc(addr, name, websocket)
        await log_and_send(websocket, "SYS:PYTHON: --- AUTO-SKAN ZAKOŃCZONY ---")
    finally:
        is_scanning = False

async def ws_handler(websocket):
    """Obsługa połączeń z przeglądarki"""
    global shutdown_task
    
    connected_clients.add(websocket)
    
    if shutdown_task is not None and not shutdown_task.done():
        shutdown_task.cancel()
        print("SYS:PY:SHUTDOWN_CANCELLED")

    print(f"SYS:PY:BROWSER_CONNECTED (Total: {len(connected_clients)})")
    
    try:
        # Wysyłamy status gotowości zaraz po połączeniu
        await websocket.send("SYS:PY:SERIAL_READY")
        async for message in websocket:
            if message.startswith("CMD:"):
                parts = message.split(":", 1)
                if len(parts) < 2:
                    continue

                command = parts[1].strip()
                if command == "REQ_FULL_SCAN":
                    print("[DIAG] Otrzymano żądanie Auto-Scan z UI (SIM).")
                    asyncio.create_task(perform_full_scan(websocket))
    finally:
        connected_clients.discard(websocket)
        print(f"SYS:PY:BROWSER_DISCONNECTED (Total: {len(connected_clients)})")
        
        if len(connected_clients) == 0:
            shutdown_task = asyncio.create_task(auto_shutdown_timer())

async def main():
    print(f"--- GOLF MASTER SIMULATOR STARTING ON ws://{WS_HOST}:{WS_PORT} ---")
    
    # Uruchomienie serwera WebSocket i pętli symulacji
    async with websockets.serve(ws_handler, WS_HOST, WS_PORT):
        await simulate_can_bus()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n--- SIMULATOR CLOSED BY USER ---")