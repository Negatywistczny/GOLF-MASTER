import { decodeAirbagData, decodeGateway1Data, decodeNMGatewayIData, decodeKDErrorData, decodeSysteminfo1Data, decodeSollverbauData, decodeFzgIdentData } from "./system.js";
import { decodeZKEData, decodeManetkiData, decodeZASData, decodeClima1Data, decodeClima2Data, decodeBSGKombiData, decodeBSG3Data, decodeDimmungData } from "./comfort.js";
import { decodeBremseGetriebeData, decodeMotorData, decodeLenkwinkelData, decodeMotor7Data, decodeBSG2Data, decodeKombiK1Data } from "./drive.js";
import { decodeGWKombiData, decodeEinheitenData, decodeDisplay1Data, decodeGateway3Data, decodeDiagnose1Data } from "./media.js";

const decoderRouter = {
    "0x151": decodeAirbagData,
    "0x291": decodeZKEData,
    "0x2C1": decodeManetkiData,
    "0x2C3": decodeZASData,
    "0x351": decodeGateway1Data,
    "0x359": decodeBremseGetriebeData,
    "0x35B": decodeMotorData,
    "0x3C3": decodeLenkwinkelData,
    "0x3E1": decodeClima1Data,
    "0x3E3": decodeClima2Data,
    "0x42B": decodeNMGatewayIData,
    "0x470": decodeBSGKombiData,
    "0x527": decodeGWKombiData,
    "0x555": decodeMotor7Data,
    "0x557": decodeKDErrorData,
    "0x571": decodeBSG2Data,
    "0x575": decodeBSG3Data,
    "0x60E": decodeEinheitenData,
    "0x621": decodeKombiK1Data,
    "0x62F": decodeDisplay1Data,
    "0x635": decodeDimmungData,
    "0x651": decodeSysteminfo1Data,
    "0x653": decodeGateway3Data,
    "0x655": decodeSollverbauData,
    "0x65D": decodeDiagnose1Data,
    "0x65F": decodeFzgIdentData,
};

export { decoderRouter };
