import { describe, expect, it } from "vitest";
import {
  availableIdentificationActions,
  detectBrowserCapabilities,
  slicerSaveMode,
} from "./capabilities";

describe("detectBrowserCapabilities", () => {
  it("returns safe defaults in a minimal environment", () => {
    const caps = detectBrowserCapabilities({} as typeof globalThis);
    expect(caps.download).toBe(false);
    expect(caps.webUsb).toBe(false);
    expect(caps.fileSystemAccess).toBe(false);
  });
});

describe("availableIdentificationActions", () => {
  it("always keeps QR/manual paths and marks RFID planned without hardware APIs", () => {
    const actions = availableIdentificationActions({
      pwaInstall: false,
      camera: false,
      webUsb: false,
      webSerial: false,
      webHid: false,
      webNfc: false,
      fileSystemAccess: false,
      download: true,
      print: true,
    });
    expect(actions).toContain("print_qr");
    expect(actions).toContain("manual_identify");
    expect(actions).toContain("rfid_planned");
    expect(actions).not.toContain("rfid_webusb");
  });

  it("prefers download-only when File System Access is absent", () => {
    expect(
      slicerSaveMode({
        pwaInstall: false,
        camera: false,
        webUsb: false,
        webSerial: false,
        webHid: false,
        webNfc: false,
        fileSystemAccess: false,
        download: true,
        print: true,
      }),
    ).toBe("download_only");
  });
});
