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
  });

  it("rejects unrelated text", () => {
    expect(parseOpenFilamentQrPayload("hello")).toBeNull();
  });
});

describe("buildSpoolLabelSvg", () => {
  it("embeds manufacturer and escapes markup", () => {
    const svg = buildSpoolLabelSvg({
      qrSvg: '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>',
      manufacturer: 'Flash<script>',
      material: "ASA",
      variant: "Burnt Titanium",
      shortId: "OF-33333333",
      url: "https://example/f/x",
    });
    expect(svg).toContain("Flash&lt;script&gt;");
    expect(svg).toContain("OPENFILAMENT");
    expect(svg).toContain("ASA");
  });
});
