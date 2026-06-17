import asyncio
import os
from pathlib import Path

import websockets

WS_HOST = "localhost"
WS_PORT = 8765
_TIMELINE_PATH = Path(__file__).resolve().parent / "can_drive_timeline.txt"

connected_clients = set()
shutdown_task = None

_FALLBACK_FRAMES = [
    "0x151: 00 F0 18 E8",
    "0x2C1: 00 00 80 00 00",
    "0x351: 00 00 00 00 00 00 00 00",
    "0x359: 18 01 00 79 08 2B 00 00",
    "0x3C3: 10 81 00 00 80 60 00 0E",
    "0x42B: 0B 01 00 00 00 00",
    "0x527: 10 01 00 60 7A 71 71 00",
    "0x555: E8 5B 7E 00 67 00 00 94",
    "0x557: 25 00 00 3F 4C 00 00 00",
    "0x651: 80 03 59 AF 29 48",
]


def _load_can_timeline():
    if not _TIMELINE_PATH.is_file():
        return [(10, f) for f in _FALLBACK_FRAMES]
    out = []
    for line in _TIMELINE_PATH.read_text(encoding="utf-8", errors="replace").splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "|" not in s:
            continue
        delay_s, frame = s.split("|", 1)
        try:
            delay_ms = int(delay_s.strip())
        except ValueError:
            continue
        frame = frame.strip()
        if frame:
            out.append((delay_ms, frame))
    return out if out else [(10, f) for f in _FALLBACK_FRAMES]


CAN_TIMELINE = _load_can_timeline()


async def auto_shutdown_timer():
    await asyncio.sleep(2)
    if len(connected_clients) == 0:
        print("--- SYS:PY:AUTO_SHUTDOWN (SIMULATOR) ---")
        os._exit(0)


async def broadcast(message):
    if connected_clients:
        disconnected = set()
        for client in connected_clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(client)
        connected_clients.difference_update(disconnected)


async def simulate_can_bus():
    print("SYS:PY:SIMULATOR_STARTED")
    while True:
        if connected_clients:
            for delay_ms, frame in CAN_TIMELINE:
                if not connected_clients:
                    break
                await asyncio.sleep(delay_ms / 1000.0)
                await broadcast(frame)
            await asyncio.sleep(0.2)
        else:
            await asyncio.sleep(1)


async def ws_handler(websocket):
    global shutdown_task
    connected_clients.add(websocket)

    if shutdown_task is not None and not shutdown_task.done():
        shutdown_task.cancel()
        print("SYS:PY:SHUTDOWN_CANCELLED")

    print(f"SYS:PY:BROWSER_CONNECTED (Total: {len(connected_clients)})")
    try:
        await websocket.send("SYS:PY:SERIAL_READY")
        async for message in websocket:
            if message.startswith("CMD:"):
                print(f"SYS:PY:IGNORED_CMD:{message[4:].strip()}")
    finally:
        connected_clients.discard(websocket)
        print(f"SYS:PY:BROWSER_DISCONNECTED (Total: {len(connected_clients)})")
        if len(connected_clients) == 0:
            shutdown_task = asyncio.create_task(auto_shutdown_timer())


async def main():
    print(f"--- GOLF MASTER SIMULATOR STARTING ON ws://{WS_HOST}:{WS_PORT} ---")
    async with websockets.serve(ws_handler, WS_HOST, WS_PORT):
        await simulate_can_bus()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n--- SIMULATOR CLOSED BY USER ---")
