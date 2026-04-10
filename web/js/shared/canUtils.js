import { getCachedFrameHex, getCachedFrameBigInt, setCachedFrame } from "../state/index.js";

function extractCANSignal(hexString, startBit, length, multiplier = 1, offset = 0, isSigned = false) {
    let dataBigInt;
    if (typeof hexString === "bigint") {
        dataBigInt = hexString;
    } else if (hexString === getCachedFrameHex()) {
        dataBigInt = getCachedFrameBigInt();
    } else {
        const bytes = hexString.trim().split(" ").map((x) => BigInt("0x" + x));
        dataBigInt = 0n;
        for (let i = 0; i < bytes.length; i++) {
            dataBigInt |= bytes[i] << BigInt(i * 8);
        }
        setCachedFrame(hexString, dataBigInt);
    }

    const mask = (1n << BigInt(length)) - 1n;
    let rawValue = Number((dataBigInt >> BigInt(startBit)) & mask);

    if (isSigned) {
        const signBit = 1 << (length - 1);
        if (rawValue & signBit) {
            rawValue -= 1 << length;
        }
    }

    return rawValue * multiplier + offset;
}

function parseHexToBigInt(hexString) {
    const bytes = hexString.trim().split(" ").map((x) => BigInt("0x" + x));
    let dataBigInt = 0n;
    for (let i = 0; i < bytes.length; i++) {
        dataBigInt |= bytes[i] << BigInt(i * 8);
    }
    return dataBigInt;
}

function ensureFrameBigInt(hexData) {
    if (getCachedFrameHex() !== hexData) {
        setCachedFrame(hexData, parseHexToBigInt(hexData));
    }
    return getCachedFrameBigInt();
}

function formatSignalValue(meta, value) {
    if (meta.states && meta.states[value] !== undefined) {
        return meta.states[value];
    }
    const num = typeof value === "number" && !Number.isInteger(value) ? value.toFixed(2) : value;
    return `${num}${meta.unit || ""}`;
}

export { extractCANSignal, parseHexToBigInt, ensureFrameBigInt, formatSignalValue };
