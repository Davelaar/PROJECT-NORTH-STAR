import { describe, expect, it } from "vitest";
import { brandedTitle, clipForTitle } from "./titles";
import { languageAlternates } from "./metadata";

describe("seo titles", () => {
  it("brands unique page titles", () => {
    expect(brandedTitle("Identify a spool")).toBe("Identify a spool · OpenFilament");
  });

  it("does not double-brand", () => {
    expect(brandedTitle("Support · OpenFilament")).toBe("Support · OpenFilament");
  });

  it("clips long titles before branding", () => {
    const long =
      "Find filament profiles, starter profiles and QR/RFID spool tools for your printer.";
    const out = brandedTitle(long);
    expect(out.endsWith("· OpenFilament")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(70);
  });

  it("clips without mid-word cuts when possible", () => {
    expect(clipForTitle("Hello world from OpenFilament catalog", 18)).toBe(
      "Hello world from…",
    );
  });
});

describe("hreflang alternates", () => {
  it("emits distinct URLs per locale", () => {
    const alts = languageAlternates("/identify");
    expect(alts.en).toMatch(/\/identify$/);
    expect(alts.nl).toMatch(/\/nl\/identify$/);
    expect(alts["zh-Hans"]).toMatch(/\/zh\/identify$/);
    expect(alts["x-default"]).toBe(alts.en);
    expect(alts.nl).not.toBe(alts.en);
  });
});
