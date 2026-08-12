import { describe, expect, it } from "vitest";
import {
  hreflangCode,
  htmlLang,
  localizedPath,
  stripLocalePrefix,
} from "./routing";

describe("i18n routing", () => {
  it("prefixes non-English locales", () => {
    expect(localizedPath("en", "/identify")).toBe("/identify");
    expect(localizedPath("nl", "/identify")).toBe("/nl/identify");
    expect(localizedPath("nl", "/")).toBe("/nl");
    expect(localizedPath("zh", "/search")).toBe("/zh/search");
  });

  it("strips locale prefixes", () => {
    expect(stripLocalePrefix("/nl/identify")).toBe("/identify");
    expect(stripLocalePrefix("/de")).toBe("/");
    expect(stripLocalePrefix("/identify")).toBe("/identify");
  });

  it("maps zh to zh-Hans for lang/hreflang", () => {
    expect(hreflangCode("zh")).toBe("zh-Hans");
    expect(htmlLang("nl")).toBe("nl");
  });
});
