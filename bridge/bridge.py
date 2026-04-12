import asyncio
import json
import os
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set, Tuple

import serial
import websockets

# --- KONFIGURACJA ---
SERIAL_PORT = os.getenv("GOLF_SERIAL_PORT", "COM7")
BAUD_RATE = int(os.getenv("GOLF_BAUD_RATE", "115200"))
WS_HOST = os.getenv("GOLF_WS_HOST", "localhost")
WS_PORT = int(os.getenv("GOLF_WS_PORT", "8765"))

TP_SETUP_TIMEOUT_S = float(os.getenv("GOLF_TP_SETUP_TIMEOUT_S", "2.5"))
TP_TIMING_TIMEOUT_S = float(os.getenv("GOLF_TP_TIMING_TIMEOUT_S", "8.0"))
TP_RESPONSE_WINDOW_S = float(os.getenv("GOLF_TP_RESPONSE_WINDOW_S", "1.6"))
TP_IDLE_GAP_S = float(os.getenv("GOLF_TP_IDLE_GAP_S", "0.35"))
# Pauza między modułami w pełnym skanie DTC — daje czas gateway (J533) między sesjami TP2.0.
DTC_INTER_MODULE_GAP_S = float(os.getenv("GOLF_DTC_INTER_MODULE_GAP_S", "0.25"))
# Ostatnia pełna ramka 0x557 (mKD_Error) z szyny — używana do filtrowania listy modułów w skanie DTC.
last_kd557_bytes: Optional[List[int]] = None
# Gdy 1: skanuj tylko moduły z ustawionym bitem EKD odpowiadającym adresowi (mapa jak web/js/can/decoders/system.js).
KD557_FILTER_ENABLED = os.getenv("GOLF_DTC_KD557_FILTER", "1").lower() in ("1", "true", "yes")

TP_CONTROL_BYTES = {0xA0, 0xA1, 0xA4, 0xA8, 0xB1, 0xB2, 0xB3, 0xB4, 0xB5}

connected_clients = set()
shutdown_task = None
is_scanning = False
tx_queue = None
rx_queue = None


@dataclass(frozen=True)
class ModuleSpec:
    addr_hex: str
    name: str
    protocols: Tuple[str, ...]


MODULES: Tuple[ModuleSpec, ...] = (
    ModuleSpec("01", "Silnik (Engine)", ("uds", "kwp")),
    ModuleSpec("02", "Skrzynia Biegów (Auto Trans)", ("uds", "kwp")),
    ModuleSpec("03", "ABS / ESP / Hamulce", ("uds", "kwp")),
    ModuleSpec("08", "Klimatyzacja (Climatronic)", ("kwp", "uds")),
    ModuleSpec("09", "Centralna Elektryka (Bordnetz)", ("kwp", "uds")),
    ModuleSpec("15", "Poduszki Powietrzne (Airbag)", ("kwp", "uds")),
    ModuleSpec("16", "Koło Kierownicy (Steering Wheel)", ("kwp", "uds")),
    ModuleSpec("17", "Zestaw Wskaźników (Instrument Cluster)", ("kwp", "uds")),
    ModuleSpec("19", "Gateway CAN (J533)", ("uds", "kwp")),
    ModuleSpec("25", "Immobilizer", ("kwp", "uds")),
    ModuleSpec("37", "Nawigacja", ("uds", "kwp")),
    ModuleSpec("42", "Elektronika Drzwi Kierowcy", ("kwp", "uds")),
    ModuleSpec("44", "Wspomaganie Kierownicy (Steering Assist)", ("kwp", "uds")),
    ModuleSpec("46", "Moduł Komfortu (Central Convenience)", ("kwp", "uds")),
    ModuleSpec("52", "Elektronika Drzwi Pasażera", ("kwp", "uds")),
    ModuleSpec("56", "Radio / Infotainment", ("uds", "kwp")),
    ModuleSpec("62", "Elektronika Drzwi Tylnych Lewych", ("kwp", "uds")),
    ModuleSpec("72", "Elektronika Drzwi Tylnych Prawych", ("kwp", "uds")),
    ModuleSpec("77", "Telefon / Bluetooth", ("uds", "kwp")),
)


def _kd557_payload_to_u64(data: List[int]) -> int:
    v = 0
    for i, b in enumerate(data[:8]):
        v |= (int(b) & 0xFF) << (i * 8)
    return v


def _kd557_bit(value: int, bit_index: int) -> bool:
    return bool((value >> bit_index) & 1)


def _addrs_from_kd557(value: int) -> Set[str]:
    """
    Bity EKD jak decodeKDErrorData (0x557) → adresy hex z MODULES.
    Skrót z aktywnych błędów w UI (system.js): silnik/skrezynia/ABS/… + drzwi/infotainment/osobno.
    """
    addrs: Set[str] = set()
    if _kd557_bit(value, 0):
        addrs.add("01")
    if _kd557_bit(value, 1):
        addrs.add("02")
    if _kd557_bit(value, 2):
        addrs.add("03")
    if _kd557_bit(value, 3) or _kd557_bit(value, 22):
        addrs.add("17")
    if _kd557_bit(value, 4) or _kd557_bit(value, 34):
        addrs.add("16")
    if _kd557_bit(value, 5):
        addrs.add("15")
    if _kd557_bit(value, 6):
        addrs.add("44")
    if _kd557_bit(value, 21) or _kd557_bit(value, 53):
        addrs.add("25")
    if _kd557_bit(value, 24):
        addrs.add("09")
    if _kd557_bit(value, 25):
        addrs.add("46")
    if _kd557_bit(value, 26):
        addrs.add("42")
    if _kd557_bit(value, 27):
        addrs.add("52")
    if _kd557_bit(value, 28):
        addrs.add("62")
    if _kd557_bit(value, 29):
        addrs.add("72")
    if _kd557_bit(value, 35):
        addrs.add("19")
    if _kd557_bit(value, 36):
        addrs.add("08")
    if _kd557_bit(value, 56) or _kd557_bit(value, 62):
        addrs.add("56")
    if _kd557_bit(value, 59):
        addrs.add("37")
    if _kd557_bit(value, 63):
        addrs.add("77")
    return addrs


def _capture_kd557_line(line: str) -> None:
    global last_kd557_bytes
    parsed = _parse_can_line(line)
    if not parsed:
        return
    can_id, data = parsed
    if can_id == 0x557 and len(data) >= 8:
        last_kd557_bytes = data[:8]


def _dtc_scan_modules() -> Tuple[ModuleSpec, ...]:
    if not KD557_FILTER_ENABLED:
        return MODULES
    if last_kd557_bytes is None or len(last_kd557_bytes) < 8:
        print("SYS:PY:DTC_KD557_FILTER_SKIP brak_pełnej_ramki_0x557 — pełna lista modułów")
        return MODULES
    want = _addrs_from_kd557(_kd557_payload_to_u64(last_kd557_bytes))
    if not want:
        print("SYS:PY:DTC_KD557_FILTER_SKIP brak_bitów_EKD — pełna lista modułów")
        return MODULES
    filtered = tuple(m for m in MODULES if m.addr_hex in want)
    if not filtered:
        print("SYS:PY:DTC_KD557_FILTER_SKIP brak_dopasowania_do_MODULES — pełna lista modułów")
        return MODULES
    key = lambda h: int(h, 16)
    print(f"SYS:PY:DTC_KD557_FILTER addrs={sorted(want, key=key)} count={len(filtered)}")
    return filtered


class SessionError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


def _now_ms() -> int:
    return int(time.time() * 1000)


def _hex_payload(data: List[int]) -> str:
    return " ".join(f"{b:02X}" for b in data)


def _parse_can_line(line: str) -> Optional[Tuple[int, List[int]]]:
    if not line.startswith("0x") or ":" not in line:
        return None
    can_id_txt, payload_txt = line.split(":", 1)
    try:
        can_id = int(can_id_txt, 16)
    except ValueError:
        return None

    bytes_out: List[int] = []
    for tok in payload_txt.strip().split():
        try:
            bytes_out.append(int(tok, 16))
        except ValueError:
            return None
    return can_id, bytes_out


def _decode_uds_status_bits(status_byte: int) -> List[str]:
    bit_names = (
        "testFailed",
        "testFailedThisOperationCycle",
        "pendingDtc",
        "confirmedDtc",
        "testNotCompletedSinceLastClear",
        "testFailedSinceLastClear",
        "testNotCompletedThisOperationCycle",
        "warningIndicatorRequested",
    )
    flags: List[str] = []
    for bit_idx, name in enumerate(bit_names):
        if status_byte & (1 << bit_idx):
            flags.append(name)
    return flags


def _decode_uds_dtc_payload(payload: bytes) -> List[Dict[str, Any]]:
    if len(payload) < 3 or payload[0] != 0x59:
        return []
    records: List[Dict[str, Any]] = []
    idx = 3
    while idx + 3 < len(payload):
        dtc = (payload[idx] << 16) | (payload[idx + 1] << 8) | payload[idx + 2]
        status = payload[idx + 3]
        records.append(
            {
                "code": f"{dtc:06X}",
                "statusByte": f"0x{status:02X}",
                "statusFlags": _decode_uds_status_bits(status),
                "source": "UDS",
            }
        )
        idx += 4
    return records


def _decode_kwp_dtc_payload(payload: bytes) -> List[Dict[str, Any]]:
    if len(payload) < 3 or payload[0] not in (0x58, 0x59):
        return []
    records: List[Dict[str, Any]] = []
    idx = 2
    while idx + 2 < len(payload):
        dtc = (payload[idx] << 8) | payload[idx + 1]
        status = payload[idx + 2]
        records.append(
            {
                "code": f"{dtc:04X}",
                "statusByte": f"0x{status:02X}",
                "statusFlags": _decode_uds_status_bits(status),
                "source": "KWP",
            }
        )
        idx += 3
    return records


def _decode_dtc_payloads(protocol: str, payloads: List[bytes]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for payload in payloads:
        if protocol == "uds":
            decoded = _decode_uds_dtc_payload(payload)
        else:
            decoded = _decode_kwp_dtc_payload(payload)
        if decoded:
            out.extend(decoded)
    return out


class PayloadAssembler:
    """
    Próbuje złożyć payload wieloramkowy (ISO-TP styl) i jednocześnie wspiera
    fallback na „surowe” ramki TP2.0/legacy.
    """

    def __init__(self) -> None:
        self.expected_len: Optional[int] = None
        self.buffer = bytearray()
        self.payloads: List[bytes] = []

    def feed(self, data: List[int]) -> Optional[bytes]:
        if not data:
            return None

        pci = (data[0] >> 4) & 0x0F

        if pci == 0x0:
            ln = data[0] & 0x0F
            payload = bytes(data[1 : 1 + ln]) if ln > 0 else bytes(data[1:])
            if payload:
                self.payloads.append(payload)
                return payload
            return None

        if pci == 0x1 and len(data) >= 2:
            self.expected_len = ((data[0] & 0x0F) << 8) | data[1]
            self.buffer = bytearray(data[2:])
            if self.expected_len is not None and len(self.buffer) >= self.expected_len:
                payload = bytes(self.buffer[: self.expected_len])
                self.payloads.append(payload)
                self.expected_len = None
                self.buffer = bytearray()
                return payload
            return None

        if pci == 0x2:
            if self.expected_len is None:
                payload = bytes(data)
                self.payloads.append(payload)
                return payload
            self.buffer.extend(data[1:])
            if len(self.buffer) >= self.expected_len:
                payload = bytes(self.buffer[: self.expected_len])
                self.payloads.append(payload)
                self.expected_len = None
                self.buffer = bytearray()
                return payload
            return None

        # Flow-control lub format niestandardowy traktujemy jako surową ramkę danych.
        payload = bytes(data)
        self.payloads.append(payload)
        return payload


async def _send_event(websocket, event: str, payload: Dict[str, Any]) -> None:
    msg = json.dumps(
        {"type": "dtc_scan", "event": event, "payload": payload},
        ensure_ascii=False,
    )
    try:
        await websocket.send(msg)
    except websockets.exceptions.ConnectionClosed:
        pass


async def log_and_send(websocket, message: str):
    print(message)
    try:
        await websocket.send(message)
    except websockets.exceptions.ConnectionClosed:
        pass


async def auto_shutdown_timer():
    print("SYS:PY:NO_CLIENTS_WAITING_2S")
    await asyncio.sleep(2)
    if len(connected_clients) == 0:
        print("--- SYS:PY:AUTO_SHUTDOWN ---")
        os._exit(0)


async def broadcast(message: str):
    if connected_clients:
        disconnected = set()
        for client in connected_clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(client)
        connected_clients.difference_update(disconnected)


async def _queue_can_tx(can_id: int, data: List[int]) -> None:
    payload = _hex_payload(data)
    await tx_queue.put(f"TX:{can_id:X}:{len(data)}:{payload}\n")


def _flush_rx_queue() -> None:
    while not rx_queue.empty():
        rx_queue.get_nowait()


async def handle_serial():
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
                            _capture_kd557_line(line)
                            await rx_queue.put(line)
                await asyncio.sleep(0.005)

        except (serial.SerialException, FileNotFoundError):
            error_msg = f"ERR:PY:SERIAL_LOST:{SERIAL_PORT}"
            print(error_msg)
            await broadcast(error_msg)
            if ser:
                ser.close()
            await asyncio.sleep(3)


async def _wait_for_frame(
    predicate,
    timeout_s: float,
) -> Tuple[int, List[int], str]:
    deadline = time.monotonic() + timeout_s
    while True:
        left = deadline - time.monotonic()
        if left <= 0:
            raise SessionError("timeout", "Przekroczono limit oczekiwania na ramkę")
        try:
            line = await asyncio.wait_for(rx_queue.get(), timeout=min(0.1, left))
        except asyncio.TimeoutError:
            continue
        parsed = _parse_can_line(line)
        if not parsed:
            continue
        can_id, data = parsed
        if predicate(can_id, data, line):
            return can_id, data, line


async def _tp20_open_session(module: ModuleSpec) -> int:
    addr_int = int(module.addr_hex, 16)
    rx_id_expected = 0x200 + addr_int

    _flush_rx_queue()

    await _queue_can_tx(0x200, [addr_int, 0xC0, 0x00, 0x10, 0x00, 0x03, 0x01])

    def setup_predicate(can_id, data, _line):
        return can_id == rx_id_expected and len(data) >= 7 and data[1] == 0xD0

    try:
        _, setup_data, _ = await _wait_for_frame(setup_predicate, TP_SETUP_TIMEOUT_S)
    except SessionError as exc:
        raise SessionError("gateway_setup_timeout", f"Brak D0 z gateway dla {module.addr_hex}") from exc
    tx_channel = (setup_data[5] << 8) | setup_data[4]

    def timing_predicate(can_id, data, _line):
        return can_id == 0x300 and len(data) >= 1 and data[0] == 0xA8

    try:
        await _wait_for_frame(timing_predicate, TP_TIMING_TIMEOUT_S)
    except SessionError as exc:
        raise SessionError("timing_timeout", f"Brak A8 (timing) dla {module.addr_hex}") from exc
    await _queue_can_tx(tx_channel, [0xA0, 0x0F, 0x8A, 0xFF, 0x32, 0xFF])
    await asyncio.sleep(0.05)
    return tx_channel


async def _tp20_close_session(tx_channel: int) -> None:
    await _queue_can_tx(tx_channel, [0xA4])
    await asyncio.sleep(0.04)


def _request_for_protocol(protocol: str) -> List[int]:
    if protocol == "uds":
        # UDS ReadDTCInformation (report DTC by status mask = 0xFF)
        return [0x03, 0x19, 0x02, 0xFF, 0x00, 0x00]
    # KWP ReadDTCByStatus
    return [0x11, 0x04, 0x18, 0x00, 0x00, 0x00]


async def _read_dtc_payloads(protocol: str, tx_channel: int) -> Dict[str, Any]:
    await _queue_can_tx(tx_channel, _request_for_protocol(protocol))

    assembler = PayloadAssembler()
    raw_frames: List[List[int]] = []

    hard_deadline = time.monotonic() + TP_RESPONSE_WINDOW_S
    idle_deadline = hard_deadline

    while time.monotonic() < hard_deadline and time.monotonic() < idle_deadline:
        left = min(hard_deadline - time.monotonic(), idle_deadline - time.monotonic())
        if left <= 0:
            break
        try:
            line = await asyncio.wait_for(rx_queue.get(), timeout=min(0.1, left))
        except asyncio.TimeoutError:
            continue
        parsed = _parse_can_line(line)
        if not parsed:
            continue
        can_id, data = parsed
        if can_id != 0x300 or not data:
            continue
        if data[0] in TP_CONTROL_BYTES:
            continue
        raw_frames.append(data)
        assembler.feed(data)
        idle_deadline = min(hard_deadline, time.monotonic() + TP_IDLE_GAP_S)

    payloads = assembler.payloads[:]
    if assembler.expected_len is not None:
        raise SessionError("incomplete_payload", "Niekompletna odpowiedź wieloramkowa")
    if not payloads:
        payloads = [bytes(frame) for frame in raw_frames]

    dtcs = _decode_dtc_payloads(protocol, payloads)
    return {
        "rawFrames": [_hex_payload(frame) for frame in raw_frames],
        "payloadsHex": [_hex_payload(list(p)) for p in payloads],
        "dtcs": dtcs,
    }


async def _scan_module_protocol(
    module: ModuleSpec,
    protocol: str,
    websocket,
) -> Dict[str, Any]:
    tx_channel = None
    started_ms = _now_ms()
    try:
        tx_channel = await _tp20_open_session(module)
        read_result = await _read_dtc_payloads(protocol, tx_channel)
        await _tp20_close_session(tx_channel)

        dtcs = read_result["dtcs"]
        has_capture = bool(read_result.get("rawFrames")) or bool(
            read_result.get("payloadsHex") and any((p or "").strip() for p in read_result["payloadsHex"])
        )
        if dtcs:
            status = "ok"
        elif has_capture:
            status = "no_dtc"
        else:
            status = "no_data"
        return {
            "status": status,
            "protocol": protocol.upper(),
            "txChannel": tx_channel,
            "txChannelHex": f"0x{tx_channel:X}",
            "dtcs": dtcs,
            "dtcCount": len(dtcs),
            "rawFrames": read_result["rawFrames"],
            "payloadsHex": read_result["payloadsHex"],
            "durationMs": _now_ms() - started_ms,
        }
    except SessionError as exc:
        if tx_channel is not None:
            try:
                await _tp20_close_session(tx_channel)
            except Exception:
                pass
        raise SessionError(exc.code, exc.message) from exc


async def _scan_module_with_fallback(
    module: ModuleSpec,
    websocket,
    idx: int,
    total: int,
) -> Dict[str, Any]:
    protocol_errors: List[Dict[str, str]] = []
    for protocol in module.protocols:
        await _send_event(
            websocket,
            "progress",
            {
                "index": idx,
                "total": total,
                "module": {"addr": module.addr_hex, "name": module.name},
                "protocol": protocol.upper(),
            },
        )
        try:
            result = await _scan_module_protocol(module, protocol, websocket)
            result_payload = {
                "index": idx,
                "total": total,
                "module": {"addr": module.addr_hex, "name": module.name},
                **result,
                "errors": protocol_errors,
            }
            await _send_event(websocket, "module_result", result_payload)
            return result_payload
        except SessionError as exc:
            protocol_errors.append(
                {"protocol": protocol.upper(), "code": exc.code, "message": exc.message}
            )
            continue

    failure_payload = {
        "index": idx,
        "total": total,
        "module": {"addr": module.addr_hex, "name": module.name},
        "status": "comm_error",
        "protocol": module.protocols[0].upper(),
        "txChannel": None,
        "txChannelHex": None,
        "dtcs": [],
        "dtcCount": 0,
        "rawFrames": [],
        "payloadsHex": [],
        "durationMs": 0,
        "errors": protocol_errors,
    }
    await _send_event(websocket, "module_result", failure_payload)
    return failure_payload


async def perform_full_scan(websocket):
    global is_scanning
    if is_scanning:
        await log_and_send(websocket, "SYS:PYTHON: ⚠️ Skanowanie już trwa. Proszę czekać.")
        return

    is_scanning = True
    scan_started = _now_ms()
    scan_id = f"scan-{scan_started}"
    module_list = _dtc_scan_modules()

    try:
        await _send_event(
            websocket,
            "start",
            {
                "scanId": scan_id,
                "moduleTotal": len(module_list),
                "startedAt": scan_started,
            },
        )

        module_results: List[Dict[str, Any]] = []
        total_modules = len(module_list)
        for idx, module in enumerate(module_list, start=1):
            module_result = await _scan_module_with_fallback(module, websocket, idx, total_modules)
            module_results.append(module_result)
            if idx < total_modules and DTC_INTER_MODULE_GAP_S > 0:
                await asyncio.sleep(DTC_INTER_MODULE_GAP_S)

        comm_errors = sum(1 for r in module_results if r["status"] == "comm_error")
        modules_with_dtc = sum(1 for r in module_results if r["dtcCount"] > 0)
        total_dtcs = sum(r["dtcCount"] for r in module_results)
        finished_ms = _now_ms()

        await _send_event(
            websocket,
            "complete",
            {
                "scanId": scan_id,
                "startedAt": scan_started,
                "finishedAt": finished_ms,
                "durationMs": finished_ms - scan_started,
                "moduleTotal": len(module_list),
                "moduleErrors": comm_errors,
                "modulesWithDtc": modules_with_dtc,
                "totalDtcs": total_dtcs,
            },
        )
    except Exception as exc:
        await _send_event(
            websocket,
            "error",
            {
                "scanId": scan_id,
                "errorCode": "scan_failed",
                "message": str(exc),
            },
        )
        await log_and_send(websocket, f"ERR:PY:DTC_SCAN_FAILED:{exc}")
    finally:
        is_scanning = False


async def ws_handler(websocket):
    global shutdown_task

    connected_clients.add(websocket)

    if shutdown_task is not None and not shutdown_task.done():
        shutdown_task.cancel()
        print("SYS:PY:SHUTDOWN_CANCELLED")

    print(f"SYS:PY:BROWSER_CONNECTED (Total: {len(connected_clients)})")

    try:
        async for message in websocket:
            if message.startswith("CMD:"):
                parts = message.split(":", 1)
                if len(parts) >= 2:
                    command = parts[1].strip()
                    if command == "REQ_FULL_SCAN":
                        print("[DIAG] Otrzymano żądanie Auto-Scan z UI.")
                        asyncio.create_task(perform_full_scan(websocket))
    finally:
        connected_clients.discard(websocket)
        print(f"SYS:PY:BROWSER_DISCONNECTED (Total: {len(connected_clients)})")
        if len(connected_clients) == 0:
            shutdown_task = asyncio.create_task(auto_shutdown_timer())


async def main():
    global tx_queue, rx_queue
    tx_queue = asyncio.Queue()
    rx_queue = asyncio.Queue()

    print(f"--- GOLF MASTER BRIDGE STARTING ON ws://{WS_HOST}:{WS_PORT} ---")
    print(f"SYS:PY:CONFIG PORT={SERIAL_PORT} BAUD={BAUD_RATE}")

    async with websockets.serve(ws_handler, WS_HOST, WS_PORT):
        await handle_serial()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n--- BRIDGE CLOSED BY USER ---")