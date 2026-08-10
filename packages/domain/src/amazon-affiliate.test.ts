import { describe, expect, it } from "vitest";
import {
  DEFAULT_AMAZON_NL_AFFILIATE_TAG,
  applyAmazonAffiliateToPurchaseLinks,
  isAmazonBuyUrl,
  withAmazonAffiliateTag,
} from "./amazon-affiliate.js";

describe("amazon affiliate tagging", () => {
  it("detects amazon.nl and amzn short links", () => {
    expect(isAmazonBuyUrl("https://www.amazon.nl/dp/B0TEST")).toBe(true);
    expect(isAmazonBuyUrl("https://amzn.eu/d/abc")).toBe(true);
    expect(isAmazonBuyUrl("https://www.gadgethuset.dk/x")).toBe(false);
  });

  it("adds tag to amazon.nl URLs", () => {
    const out = withAmazonAffiliateTag(
      "https://www.amazon.nl/dp/B0ABCDEF12",
      "3dapeldoorn-21",
    );
    expect(out).toContain("tag=3dapeldoorn-21");
    expect(out).toContain("/dp/B0ABCDEF12");
  });

  it("replaces an existing tag", () => {
    const out = withAmazonAffiliateTag(
      "https://www.amazon.nl/dp/B0ABCDEF12?tag=someone-else-21&th=1",
      "3dapeldoorn-21",
    );
    const u = new URL(out);
    expect(u.searchParams.get("tag")).toBe("3dapeldoorn-21");
    expect(u.searchParams.get("th")).toBe("1");
  });

  it("leaves non-amazon links alone", () => {
    const url = "https://www.gadgethuset.dk/shop/pla";
    expect(withAmazonAffiliateTag(url)).toBe(url);
  });

  it("maps purchase link arrays", () => {
    const links = applyAmazonAffiliateToPurchaseLinks([
      { storeName: "Amazon", url: "https://amazon.nl/dp/B01" },
      { storeName: "Other", url: "https://example.com/x" },
    ]);
    expect(links[0]!.url).toContain(`tag=${DEFAULT_AMAZON_NL_AFFILIATE_TAG}`);
    expect(links[1]!.url).toBe("https://example.com/x");
  });
});
