import { describe, expect, it } from "vitest";
import { parseOpenFilamentQrPayload } from "./qr-parse";
import { buildSpoolLabelSvg } from "./qr-label";

describe("parseOpenFilamentQrPayload", () => {
  it("parses /f/ URLs and bare UUIDs", () => {
    const id = "33333333-3333-4333-8333-333333333301";
    expect(parseOpenFilamentQrPayload(`https://openfilament.nl/f/${id}`)).toBe(
      id,
    );
    expect(parseOpenFilamentQrPayload(id)).toBe(id);
    expect(
      parseOpenFilamentQrPayload(`openfilament://variant/${id}`),
    ).toBe(id);
    expect(
      parseOpenFilamentQrPayload(`https://openfilament.nl/variants/${id}`),
    ).toBe(id);
    expect(parseOpenFilamentQrPayload(`\uFEFFhttps://openfilament.nl/f/${id}`)).toBe(
      id,
    );
    expect(parseOpenFilamentQrPayload(`openfilament.nl/f/${id}`)).toBe(id);
  });

  it("rejects unrelated text", () => {
    expect(parseOpenFilamentQrPayload("hello")).toBeNull();
  });
});

describe("buildSpoolLabelSvg", () => {
  it("embeds manufacturer and escapes markup", () => {
    const svg = buildSpoolLabelSvg({
      qrSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect/></svg>',
      manufacturer: 'Flash<script>',
      material: "ASA",
      variant: "Burnt Titanium",
      shortId: "OF-33333333",
      url: "https://example/f/x",
    });
    expect(svg).toContain("Flash&lt;script&gt;");
    expect(svg).toContain('width="40mm"');
    expect(svg).toContain('height="30mm"');
    expect(svg).toContain("ASA");
    // QR box is 75% of 300 viewBox units
    expect(svg).toMatch(/scale\(0\.87890625\)|scale\(0\.87/);
  });
});
