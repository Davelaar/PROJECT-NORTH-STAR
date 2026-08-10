import { describe, expect, it } from "vitest";
import {
  MemoryBrowserTransport,
  browserWriteAndVerify,
} from "./browser-transport";

describe("MemoryBrowserTransport write+verify", () => {
  it("only succeeds when read-back matches and verify returns ok", async () => {
    const hex =
      "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";
    const transport = new MemoryBrowserTransport();
    const result = await browserWriteAndVerify({
      transport,
      encode: async () => ({ ciphertextHex: hex }),
      verify: async (ciphertextHex) => ({
        ok: ciphertextHex === hex.replace(/\s+/g, "").toLowerCase(),
        plaintextAscii: "ok",
        fields: {},
      }),
    });
    expect(result.ok).toBe(true);
    expect(result.kind).toBe("memory");
    expect(result.ciphertextHexRead).toBe(hex);
  });

  it("fails when verify rejects", async () => {
    const hex =
      "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";
    await expect(
      browserWriteAndVerify({
        transport: new MemoryBrowserTransport(),
        encode: async () => ({ ciphertextHex: hex }),
        verify: async () => ({
          ok: false,
          plaintextAscii: "",
          fields: {},
        }),
      }),
    ).rejects.toThrow(/verify/i);
  });
});
