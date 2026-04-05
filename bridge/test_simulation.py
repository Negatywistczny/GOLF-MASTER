import asyncio
import websockets
import os
import time

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
has_connected_once = False 
shutdown_task = None        

async def auto_shutdown_timer():
    """Zamyka proces, jeśli nikt nie jest podłączony przez 2 sekundy"""
    await asyncio.sleep(2)
    if len(connected_clients) == 0:
        print("--- SYS:PY:AUTO_SHUTDOWN (SIMULATOR) ---")
        os._exit(0)

async def broadcast(message):
    """Rozsyła wiadomość do wszystkich odbiorców"""
    if connected_clients:
        await asyncio.gather(*(client.send(message) for client in connected_clients), return_exceptions=True)

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

async def ws_handler(websocket):
    """Obsługa połączeń z przeglądarki"""
    global has_connected_once, shutdown_task
    
    connected_clients.add(websocket)
    has_connected_once = True
    
    if shutdown_task is not None and not shutdown_task.done():
        shutdown_task.cancel()
        print("SYS:PY:SHUTDOWN_CANCELLED")

    print(f"SYS:PY:BROWSER_CONNECTED (Total: {len(connected_clients)})")
    
    try:
        # Wysyłamy status gotowości zaraz po połączeniu
        await websocket.send("SYS:PY:SERIAL_READY")
        await websocket.wait_closed()
    finally:
        connected_clients.remove(websocket)
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