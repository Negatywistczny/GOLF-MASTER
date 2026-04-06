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
                if ser.in_waiting > 0:
                    try:
                        line = ser.readline().decode('utf-8').strip()
                        if line:
                            await broadcast(line)
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
        await websocket.wait_closed()
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