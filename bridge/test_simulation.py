import asyncio
import json
import websockets
import os
from pathlib import Path

# --- KONFIGURACJA ---
WS_HOST = 'localhost'
WS_PORT = 8765

# Oś jazdy: dosłowne ramki z 7 logów terminala (2026-04-10), zob. bridge/can_drive_timeline.txt
_TIMELINE_PATH = Path(__file__).resolve().parent / "can_drive_timeline.txt"

# Gdy brak pliku osi czasu — statyczna lista (ostatnia znana symulacja „snapshot”).
_FALLBACK_FRAMES = [
    "0x151: 00 F0 18 E8",
    "0x291: 08 00 00 00 00",
    "0x2C1: 00 00 80 00 00",
    "0x2C3: 07",
    "0x351: 00 00 00 00 00 00 00 00",
    "0x359: 18 01 00 79 08 2B 00 00",
    "0x35B: 00 04 0D B8 02 1A C2 BD",
    "0x3C3: 10 81 00 00 80 60 00 0E",
    "0x3E1: 20 00 0C 00 00 00 00 00",
    "0x3E3: 00 00 00 00 00 00 00 00",
    "0x42B: 0B 01 00 00 00 00",
    "0x470: 00 00 00 00 00",
    "0x531: 00 00 40 40",
    "0x527: 10 01 00 60 7A 71 71 00",
    "0x551: 02",
    "0x555: E8 5B 7E 00 67 00 00 94",
    "0x557: 25 00 00 3F 4C 00 00 00",
    "0x571: BC 00 00 00 00 00",
    "0x575: 47 20 00 80",
    "0x60E: 08 00",
    "0x621: 00 70 2F 0E 02",
    "0x62F: 00 00 00 00",
    "0x635: 00 00 00",
    "0x651: 80 03 59 AF 29 48",
    "0x653: 81 00 A4",
    "0x655: 75 00 60 3F 5C 10 00 00",
    "0x65D: BF 90 78 04 00 40 AF 11",
    "0x65F: 01 5A 5A 5A 31 4B 5A 36",
]


def _load_can_timeline():
    """
    Zwraca listę (opóźnienie_ms, ramka_str).
    Plik: linie „delay|0xID: ...”, # = komentarz.
    """
    if not _TIMELINE_PATH.is_file():
        return [(10, f) for f in _FALLBACK_FRAMES]

    out = []
    for line in _TIMELINE_PATH.read_text(encoding="utf-8", errors="replace").splitlines():
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        if "|" not in s:
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

async def send_scan_event(websocket, event: str, payload: dict):
    try:
        await websocket.send(json.dumps({
            "type": "dtc_scan",
            "event": event,
            "payload": payload
        }, ensure_ascii=False))
    except websockets.exceptions.ConnectionClosed:
        pass

async def simulate_can_bus():
    """
    Odtwarza zarejestrowaną historię jazdy (ramki + odstępy z logów), w pętli.
    Po jednym pełnym przejeździe krótka pauza przed kolejną „pętlą”.
    """
    print("SYS:PY:SIMULATOR_STARTED")
    if _TIMELINE_PATH.is_file():
        print(f"SYS:PY:DRIVE_TIMELINE frames={len(CAN_TIMELINE)} file={_TIMELINE_PATH.name}")
    else:
        print("SYS:PY:DRIVE_TIMELINE fallback (_FALLBACK_FRAMES — brak can_drive_timeline.txt)")

    while True:
        if connected_clients:
            for delay_ms, frame in CAN_TIMELINE:
                if not connected_clients:
                    break
                await asyncio.sleep(delay_ms / 1000.0)
                await broadcast(frame)
            # Koniec zapisanego przejazdu — krótka pauza przed powtórką „dnia z logów”
            await asyncio.sleep(0.2)
        else:
            await asyncio.sleep(1)

async def simulate_tp20_read_dtc(addr_hex: str, protocol: str) -> dict:
    """
    Symulacja odpowiednika tp20_read_dtc() z bridge.py.
    Nie komunikuje się z hardware — emituje te same pola co bridge (w tym kanał TX).
    """
    await asyncio.sleep(0.08)
    tx_channel = 0x600 + int(addr_hex, 16)
    await asyncio.sleep(0.13)

    # Prosta, deterministyczna symulacja: niektóre moduły zwracają DTC.
    has_dtc = int(addr_hex, 16) % 3 == 0
    if has_dtc:
        dtc_frame = f"0x300: 58 04 {addr_hex} 00 11 22 33"
        await broadcast(dtc_frame)
        dtcs = [{"code": f"{int(addr_hex, 16):04X}", "statusByte": "0x2F", "statusFlags": ["confirmedDtc"], "source": protocol.upper()}]
    else:
        dtcs = []

    await asyncio.sleep(0.12)
    return {
        "status": "ok" if dtcs else "clean",
        "protocol": protocol.upper(),
        "txChannel": tx_channel,
        "txChannelHex": f"0x{tx_channel:X}",
        "dtcCount": len(dtcs),
        "dtcs": dtcs,
        "errors": [],
        "rawFrames": ["58 04 00 11 22 33"] if dtcs else [],
        "payloadsHex": ["58 04 00 11 22 33"] if dtcs else [],
    }

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

        started_at = int(asyncio.get_running_loop().time() * 1000)
        scan_id = f"sim-{started_at}"
        await send_scan_event(websocket, "start", {
            "scanId": scan_id,
            "moduleTotal": len(modules),
            "startedAt": started_at
        })
        module_results = []
        for idx, (addr, name) in enumerate(modules.items(), start=1):
            protocol = "uds" if int(addr, 16) % 2 == 0 else "kwp"
            await send_scan_event(websocket, "progress", {
                "index": idx,
                "total": len(modules),
                "module": {"addr": addr, "name": name},
                "protocol": protocol.upper()
            })
            result = await simulate_tp20_read_dtc(addr, protocol)
            payload = {
                "index": idx,
                "total": len(modules),
                "module": {"addr": addr, "name": name},
                **result
            }
            module_results.append(payload)
            await send_scan_event(websocket, "module_result", payload)

        module_errors = sum(1 for r in module_results if r["status"] == "comm_error")
        modules_with_dtc = sum(1 for r in module_results if r["dtcCount"] > 0)
        total_dtcs = sum(r["dtcCount"] for r in module_results)
        finished_at = int(asyncio.get_running_loop().time() * 1000)
        await send_scan_event(websocket, "complete", {
            "scanId": scan_id,
            "startedAt": started_at,
            "finishedAt": finished_at,
            "durationMs": finished_at - started_at,
            "moduleTotal": len(modules),
            "moduleErrors": module_errors,
            "modulesWithDtc": modules_with_dtc,
            "totalDtcs": total_dtcs
        })
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
