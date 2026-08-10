import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CrealityCfsCodec,
  MemoryTagTransport,
  encryptPayload,
  decryptPayload,
  deriveUidKeyA,
  encodePlaintext,
  decodePlaintext,
  fromHex,
  toHex,
  CFS_DATA_KEY_HEX,
} from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, "../fixtures");

describe("CrealityCfsCodec", () => {
  const codec = new CrealityCfsCodec();

  it("encrypts the community-known HyperPLA vector", () => {
    // From flamebarke/creality_rfid README — plaintext ASCII → AES-ECB blocks
    const plaintext = Buffer.from(
      "1A5241201B3D010010000000033000000100000000000000",
      "ascii",
    );
    const ct = encryptPayload(plaintext);
    expect(toHex(ct.subarray(0, 16))).toBe("07881a468b7d754a76a07c9ebb452b63");
    expect(toHex(ct.subarray(16, 32))).toBe("e07623e57aa4dfc8f23bb22f645dc64b");
    expect(toHex(ct.subarray(32, 48))).toBe("fac8f07509292df943d4cdf64cba06a1");
    expect(toHex(decryptPayload(ct))).toBe(toHex(plaintext));
  });

  it("derives UID Key A for known UID 35B94A19", () => {
    expect(toHex(deriveUidKeyA("35B94A19"))).toBe("239e7fe23653");
  });

  it("builds ASA plaintext and encrypts to fixed fixture vector", () => {
    const fixture = JSON.parse(
      readFileSync(path.join(fixturesDir, "asa-burnt-titanium.json"), "utf8"),
    ) as {
      plaintextAscii: string;
      ciphertextHex: string;
      fields: Record<string, string>;
    };

    const { ascii, bytes } = encodePlaintext({
      material: "ASA",
      color: "#A52A2A",
      weightOrLength: "1kg",
      serial: "000001",
      batch: "OF1",
      date: "24120",
      supplier: "0A2",
      reserve: "00000000000000",
    });
    expect(ascii).toBe(fixture.plaintextAscii);
    expect(ascii.length).toBe(48);
    expect(decodePlaintext(bytes).material).toBe("100007");
    expect(toHex(encryptPayload(bytes))).toBe(fixture.ciphertextHex);
  });

  it("round-trips encode/decode/verify", () => {
    const encoded = codec.encode({
      material: "ASA",
      color: "#A52A2A",
      weightOrLength: 1000,
      serial: "219722",
      batch: "56D",
      date: "24120",
      supplier: "0A2",
      uid: "3A14ACF1",
    });
    expect(encoded.format).toBe("creality-cfs-v1");
    expect(encoded.fields.material).toBe("100007");
    expect(encoded.fields.color).toBe("#A52A2A");
    expect(encoded.uidKeyAHex).toHaveLength(12);

    const verified = codec.verify(encoded.ciphertextHex);
    expect(verified.ok).toBe(true);
    expect(verified.plaintextAscii).toBe(encoded.plaintextAscii);
    expect(verified.fields.materialName).toBe("ASA");
  });

  it("MemoryTagTransport write+readback+verify succeeds", () => {
    const { bytes } = encodePlaintext({
      material: "PETG",
      color: "FEFF01",
      weightOrLength: "500g",
      serial: "000042",
      batch: "AB1",
      date: "24120",
      supplier: "0A2",
    });
    const ct = encryptPayload(bytes);
    const tag = new MemoryTagTransport("35B94A19");
    const result = tag.writeAndVerify(bytes, ct);
    expect(result.ok).toBe(true);
    expect(result.keyAHex).toBe("239e7fe23653");
    expect(result.decryptedAscii).toBe(Buffer.from(bytes).toString("ascii"));
  });

  it("codec.simulateWrite succeeds", () => {
    const result = codec.simulateWrite({
      material: "PLA",
      color: "#FFFFFF",
      uid: "35B94A19",
    });
    expect(result.ok).toBe(true);
    expect(result.fields.material).toBe("100001");
  });

  it("exposes data key constant used by fixtures", () => {
    expect(CFS_DATA_KEY_HEX).toBe("484043466B526E7A404B4174424A7032");
    expect(fromHex(CFS_DATA_KEY_HEX).length).toBe(16);
  });
});
