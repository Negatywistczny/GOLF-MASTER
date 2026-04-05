import serial
import asyncio
import websockets
import serial.tools.list_ports
import time

# --- KONFIGURACJA ---
SERIAL_PORT = 'COM3'  # Zmień na swój port (np. /dev/ttyUSB0 na Linux/Mac)
BAUD_RATE = 115200
WS_HOST = 'localhost'
WS_PORT = 8765

# Zbiór połączonych klientów (przeglądarek)
connected_clients = set()

async def handle_serial():
    """Funkcja odpowiedzialna za czytanie z Arduino i rozsyłanie do przeglądarek"""
    while True:
        ser = None
        try:
            # Próba otwarcia portu
            ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=0.1)
            print(f"SYS:PY:CONNECTED_TO_{SERIAL_PORT}")
            
            # Informujemy przeglądarki, że Python połączył się z Arduino
            await broadcast("SYS:PY:SERIAL_READY")

            while True:
                if ser.in_waiting > 0:
                    try:
                        line = ser.readline().decode('utf-8').strip()
                        if line:
                            # Przekazujemy wszystko: ID:DATA, ERR:HW, SYS:HW
                            await broadcast(line)
                    except UnicodeDecodeError:
                        # Ignorujemy śmieci na łączu przy starcie
                        pass
                await asyncio.sleep(0.001) # Minimalny odpoczynek dla procesora

        except (serial.SerialException, FileNotFoundError):
            # BŁĄD: Brak Arduino lub odłączony kabel
            error_msg = f"ERR:PY:SERIAL_LOST:{SERIAL_PORT}"
            print(error_msg)
            await broadcast(error_msg)
            
            if ser:
                ser.close()
            
            # Czekamy 3 sekundy przed próbą ponownego połączenia
            await asyncio.sleep(3)

async def broadcast(message):
    """Wysyła wiadomość do wszystkich otwartych kart w przeglądarce"""
    if connected_clients:
        # Tworzymy kopię zbioru, aby uniknąć błędów podczas iteracji
        await asyncio.gather(*(client.send(message) for client in connected_clients), return_exceptions=True)

async def ws_handler(websocket, path):
    """Obsługa nowych połączeń z przeglądarki"""
    connected_clients.add(websocket)
    print(f"SYS:PY:BROWSER_CONNECTED (Total: {len(connected_clients)})")
    try:
        await websocket.wait_closed()
    finally:
        connected_clients.remove(websocket)
        print(f"SYS:PY:BROWSER_DISCONNECTED (Total: {len(connected_clients)})")

async def main():
    # Uruchamiamy serwer WebSocket i pętlę czytania Serial jednocześnie
    print(f"--- GOLF MASTER BRIDGE STARTING ON ws://{WS_HOST}:{WS_PORT} ---")
    
    server = websockets.serve(ws_handler, WS_HOST, WS_PORT)
    await asyncio.gather(server, handle_serial())

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n--- BRIDGE CLOSED BY USER ---")
