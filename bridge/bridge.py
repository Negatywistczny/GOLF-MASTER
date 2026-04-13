import asyncio
import os

import serial
import websockets

SERIAL_PORT = os.getenv("GOLF_SERIAL_PORT", "COM7")
BAUD_RATE = int(os.getenv("GOLF_BAUD_RATE", "115200"))
WS_HOST = os.getenv("GOLF_WS_HOST", "localhost")
WS_PORT = int(os.getenv("GOLF_WS_PORT", "8765"))

connected_clients = set()
shutdown_task = None
tx_queue = None


async def auto_shutdown_timer() -> None:
    print("SYS:PY:NO_CLIENTS_WAITING_2S")
    await asyncio.sleep(2)
    if len(connected_clients) == 0:
        print("--- SYS:PY:AUTO_SHUTDOWN ---")
        os._exit(0)


async def broadcast(message: str) -> None:
    if not connected_clients:
        return
    disconnected = set()
    for client in connected_clients:
        try:
            await client.send(message)
        except websockets.exceptions.ConnectionClosed:
            disconnected.add(client)
    connected_clients.difference_update(disconnected)


async def handle_serial() -> None:
    while True:
        ser = None
        try:
            buffer = bytearray()
            ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=0)
            print(f"SYS:PY:CONNECTED_TO_{SERIAL_PORT}")
            await broadcast("SYS:PY:SERIAL_READY")

            while True:
                while not tx_queue.empty():
                    msg_to_send = tx_queue.get_nowait()
                    ser.write(msg_to_send.encode("ascii"))
                    print(f"SYS:PY:TX_SENT_TO_AUTO: {msg_to_send.strip()}")

                waiting = ser.in_waiting
                if waiting > 0:
                    buffer.extend(ser.read(waiting))
                    while b"\n" in buffer:
                        line_bytes, buffer = buffer.split(b"\n", 1)
                        line = line_bytes.decode("utf-8", errors="ignore").strip()
                        if line:
                            await broadcast(line)
                await asyncio.sleep(0.005)

        except (serial.SerialException, FileNotFoundError):
            error_msg = f"ERR:PY:SERIAL_LOST:{SERIAL_PORT}"
            print(error_msg)
            await broadcast(error_msg)
            if ser:
                ser.close()
            await asyncio.sleep(3)


async def ws_handler(websocket) -> None:
    global shutdown_task

    connected_clients.add(websocket)
    if shutdown_task is not None and not shutdown_task.done():
        shutdown_task.cancel()
        print("SYS:PY:SHUTDOWN_CANCELLED")

    print(f"SYS:PY:BROWSER_CONNECTED (Total: {len(connected_clients)})")
    try:
        async for message in websocket:
            if message.startswith("CMD:"):
                print(f"SYS:PY:IGNORED_CMD:{message[4:].strip()}")
    finally:
        connected_clients.discard(websocket)
        print(f"SYS:PY:BROWSER_DISCONNECTED (Total: {len(connected_clients)})")
        if len(connected_clients) == 0:
            shutdown_task = asyncio.create_task(auto_shutdown_timer())


async def main() -> None:
    global tx_queue
    tx_queue = asyncio.Queue()

    print(f"--- GOLF MASTER BRIDGE STARTING ON ws://{WS_HOST}:{WS_PORT} ---")
    print(f"SYS:PY:CONFIG PORT={SERIAL_PORT} BAUD={BAUD_RATE}")

    async with websockets.serve(ws_handler, WS_HOST, WS_PORT):
        await handle_serial()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n--- BRIDGE CLOSED BY USER ---")
