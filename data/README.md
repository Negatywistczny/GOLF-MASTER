# Folder `data` (baza wiedzy) — GOLF MASTER

## 1. Rola w systemie

Folder `data` to baza wiedzy protokołu CAN dla platformy VAG PQ35: definicje ramek i sygnałów oraz narzędzia eksportu. Na tej podstawie powstała logika w frontendzie (`web/js/can/decoders/*.js`, `web/js/can/frameRegistry.js`, `web/js/state/signalMeta.js`).

## 2. Zawartość

### A. Baza DBC

- **`PQ35_46_ICAN_V3_6_9_F_20081104_ASR_V1_2.dbc`** — oficjalna baza wektorowa (Single Source of Truth): startbity, długości, mnożniki, offsety dla magistrali Infotainment.

### B. Wyciągi tekstowe

Czytelne zestawienia bez narzędzi DBC:

- **`IDramek.txt`** — opisy kluczowych ramek (VIN, Airbag, Gateway), tablice wartości (bity).
- **`IDramek-tylko-radio.txt`** — sygnały multimediów, BAP, audio.
- **`ID_po_adresach.txt`** — ramki pogrupowane po końcówkach adresów (OSEK NM).
- **`ID_po_adresach_tylko_pq35.txt`** — ramki specyficzne dla Gatewaya PQ35.

### C. Narzędzia

- **`info_o_ramce.py`** — Python + `cantools`; podaje strukturę ramki po nazwie (np. `BAP_AUDIO`).

## 3. Przepływ pracy (dodawanie wskaźnika)

1. Znajdź funkcję w `ID_po_adresach.txt`.
2. Użyj `info_o_ramce.py` lub `IDramek.txt`, aby ustalić **StartBit** i **długość** sygnału.
3. Przenieś parametry do `web/`:
   - rejestr ramek: `web/js/can/frameRegistry.js` (`canDictionary` / `decoderRouter`);
   - dekodowanie: `web/js/can/decoders/*.js`;
   - opisy i stany: `web/js/state/signalMeta.js` (`signalMeta`).

## 4. Uwagi techniczne

- Kolejność bajtów: **Intel (Little-endian)** — standard PQ35.
- Sygnały typu **VIN** (`0x65F`) mogą używać **multipleksera** — zawartość ramki zależy od bajtu sterującego (Counter/Index).
