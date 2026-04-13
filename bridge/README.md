# Mostek Python (bridge) — GOLF MASTER

## Rola
`bridge.py` łączy Arduino (Serial) z Web UI (WebSocket) i przekazuje:
- ramki CAN (`0x...`),
- komunikaty systemowe (`SYS:*`) i błędy (`ERR:*`),
- komendy klienta (`CMD:*`) jako wejście sterujące.

## Konfiguracja
- `GOLF_SERIAL_PORT` (domyślnie `COM7`)
- `GOLF_BAUD_RATE` (domyślnie `115200`)
- `GOLF_WS_HOST` (domyślnie `localhost`)
- `GOLF_WS_PORT` (domyślnie `8765`)

## Uruchomienie
```bash
pip install -r requirements.txt
python bridge/bridge.py
```

## Symulator
`bridge/test_simulation.py` emituje ramki z osi czasu (`can_drive_timeline.txt`) do tego samego endpointu WebSocket.
