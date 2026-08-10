import { describe, expect, it } from "vitest";
import { mapCatalogToOpenPrintTagMain } from "./map.js";
import { deriveBrandUuid } from "./uuid.js";

describe("mapCatalogToOpenPrintTagMain", () => {
  it("prefers OFD brand UUID when provided", () => {
    const ofdBrand = "11111111-1111-4111-8111-111111111111";
    const fields = mapCatalogToOpenPrintTagMain({
      brandName: "Prusament",
      brandUuid: ofdBrand,
      materialCode: "PLA",
      materialDisplayName: "PLA Galaxy Black",
      materialUuid: "22222222-2222-4222-8222-222222222222",
      variantUuid: "33333333-3333-4333-8333-333333333333",
      colorHex: "#3d3e3d",
      ofdVariantUuid: "33333333-3333-4333-8333-333333333333",
    });
    expect(fields.brand_uuid).toBe(ofdBrand);
    expect(fields.status).toBe("fields_ready_encode_planned");
    expect(fields.mime_type).toBe("application/vnd.openprinttag");
  });

  it("derives brand_uuid when OFD uuid missing", () => {
    const fields = mapCatalogToOpenPrintTagMain({
      brandName: "Prusament",
      materialCode: "PLA",
      materialDisplayName: "PLA",
      variantUuid: "33333333-3333-4333-8333-333333333333",
    });
    expect(fields.brand_uuid).toBe(deriveBrandUuid("Prusament"));
  });
});
