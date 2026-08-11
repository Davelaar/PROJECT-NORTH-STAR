import { describe, expect, it } from "vitest";
import { getMessages } from "./messages/catalog";
import { LOCALES } from "./messages/types";
import { messages as en } from "./messages/en";

describe("web-first product copy", () => {
  it("homepage messages stay browser-first", () => {
    expect(en.tagline.toLowerCase()).toMatch(/browser/);
    expect(en.home.lead.toLowerCase()).toMatch(/stay in the browser/);
    expect(en.export.body.toLowerCase()).toMatch(/download/);
    expect(en.export.body.toLowerCase()).not.toMatch(/must install/);
  });

  it("export primary path is download, helper is optional", () => {
    expect(en.export.installBridge.toLowerCase()).toMatch(/optional/);
    expect(en.export.noInstallClaim.toLowerCase()).toMatch(/not installed/);
    expect(en.rfid.warning.toLowerCase()).toMatch(/ndef\/cbor/);
    expect(en.rfid.warning.toLowerCase()).toMatch(/web nfc/);
    expect(en.rfid.warning.toLowerCase()).toMatch(/qr and search stay equal/);
  });

  it("mentions default nozzle guidance on the homepage", () => {
    expect(en.home.nozzlesNote).toContain("0.4");
    expect(en.variant.defaultNozzleNote).toContain("0.4");
  });

  it("ships all supported locales with the same keys", () => {
    const keys = Object.keys(en).sort();
    for (const locale of LOCALES) {
      const m = getMessages(locale);
      expect(Object.keys(m).sort()).toEqual(keys);
      expect(m.nav.language.length).toBeGreaterThan(0);
      expect(m.home.heading.length).toBeGreaterThan(0);
      expect(m.nav.filaments.length).toBeGreaterThan(0);
      expect(m.identify.heading.length).toBeGreaterThan(0);
      expect(m.search.provenance.measured.length).toBeGreaterThan(0);
      expect(m.variant.howCalculatedBody.length).toBeGreaterThan(0);
    }
  });

  it("keeps homepage catalog preview copy bounded", () => {
    expect(en.home.browseFullCatalog.length).toBeGreaterThan(0);
    expect(en.home.heading.toLowerCase()).toMatch(/qr|rfid/);
  });
});
