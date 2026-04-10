import {
    decodeAirbagData,
    decodeGateway1Data,
    decodeNMGatewayIData,
    decodeKDErrorData,
    decodeSysteminfo1Data,
    decodeGateway551RawData,
    decodeSollverbauData,
    decodeFzgIdentData
} from "./decoders/system.js";
import {
    decodeZKEData,
    decodeManetkiData,
    decodeZASData,
    decodeClima1Data,
    decodeClima2Data,
    decodeBSGKombiData,
    decodeLicht1AltData,
    decodeBSG3Data,
    decodeDimmungData
} from "./decoders/comfort.js";
import {
    decodeBremseGetriebeData,
    decodeMotorData,
    decodeLenkwinkelData,
    decodeMotor7Data,
    decodeBSG2Data,
    decodeKombiK1Data
} from "./decoders/drive.js";
import {
    decodeGWKombiData,
    decodeEinheitenData,
    decodeDisplay1Data,
    decodeGateway3Data,
    decodeDiagnose1Data
} from "./decoders/media.js";

const frameRegistry = Object.freeze({
    "0x151": { name: "AIRBAG (mAirbag_1)", zone: "system", decoder: decodeAirbagData },
    "0x291": { name: "ZAMEK / KOMFORT (mZKE_1)", zone: "komfort", decoder: decodeZKEData },
    "0x2C1": { name: "MANETKI (mLSM_1)", zone: "komfort", decoder: decodeManetkiData },
    "0x2C3": { name: "STACYJKA (mZAS_Status)", zone: "naped", decoder: decodeZASData },
    "0x351": { name: "GATEWAY (mGateway_1)", zone: "system", decoder: decodeGateway1Data },
    "0x359": { name: "HAMULCE / BIEGI (mGW_Bremse)", zone: "naped", decoder: decodeBremseGetriebeData },
    "0x35B": { name: "SILNIK (mGW_Motor)", zone: "naped", decoder: decodeMotorData },
    "0x3C3": { name: "KĄT SKRĘTU (mLenkwinkel)", zone: "naped", decoder: decodeLenkwinkelData },
    "0x3E1": { name: "CLIMATRONIC 1 (mClima_1)", zone: "komfort", decoder: decodeClima1Data },
    "0x3E3": { name: "CLIMATRONIC 2 (mClima_2)", zone: "komfort", decoder: decodeClima2Data },
    "0x42B": { name: "SLEEP / WAKE (mNM_Gateway)", zone: "system", decoder: decodeNMGatewayIData },
    "0x470": { name: "DRZWI / ŚWIATŁA (mBSG_Kombi)", zone: "komfort", decoder: decodeBSGKombiData },
    "0x531": { name: "ŚWIATŁA / KOMBI (mLicht_1_alt)", zone: "komfort", decoder: decodeLicht1AltData },
    "0x527": { name: "TEMP. ZEWN. (mGW_Kombi)", zone: "media", decoder: decodeGWKombiData },
    "0x551": { name: "GATEWAY — NIEZMAP. (0x551)", zone: "system", decoder: decodeGateway551RawData },
    "0x555": { name: "TURBO / OLEJ (mMotor7)", zone: "naped", decoder: decodeMotor7Data },
    "0x557": { name: "BŁĘDY MODUŁÓW (mKD_Error)", zone: "system", decoder: decodeKDErrorData },
    "0x571": { name: "ZASILANIE / AKU (mBSG_2)", zone: "naped", decoder: decodeBSG2Data },
    "0x575": { name: "STATUS ŚWIATEŁ (mBSG_3)", zone: "komfort", decoder: decodeBSG3Data },
    "0x60E": { name: "JEDNOSTKI (mEinheiten)", zone: "media", decoder: decodeEinheitenData },
    "0x621": { name: "PALIWO / RĘCZNY (mKombi_K1)", zone: "naped", decoder: decodeKombiK1Data },
    "0x62F": { name: "WYŚWIETLACZ MFA (mDisplay_1)", zone: "media", decoder: decodeDisplay1Data },
    "0x635": { name: "ŚCIEMNIANIE DESKI (mDimmung)", zone: "komfort", decoder: decodeDimmungData },
    "0x651": { name: "FLAGI SYSTEMU (mSysteminfo)", zone: "system", decoder: decodeSysteminfo1Data },
    "0x653": { name: "REGION / JĘZYK (mGateway_3)", zone: "media", decoder: decodeGateway3Data },
    "0x655": { name: "LISTA MODUŁÓW (mVerbauliste)", zone: "system", decoder: decodeSollverbauData },
    "0x65D": { name: "CZAS / PRZEBIEG (mDiagnose_1)", zone: "media", decoder: decodeDiagnose1Data },
    "0x65F": { name: "VIN POJAZDU (mFzg_Ident)", zone: "system", decoder: decodeFzgIdentData }
});

const canDictionary = Object.freeze(
    Object.fromEntries(Object.entries(frameRegistry).map(([id, def]) => [id, { name: def.name, zone: def.zone }]))
);

const decoderRouter = Object.freeze(
    Object.fromEntries(Object.entries(frameRegistry).map(([id, def]) => [id, def.decoder]))
);

export { frameRegistry, canDictionary, decoderRouter };
