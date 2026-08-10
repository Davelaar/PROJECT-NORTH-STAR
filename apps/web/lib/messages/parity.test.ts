import { describe, expect, it } from "vitest";
import { getMessages } from "./catalog";
import { LOCALES } from "./types";
import { messages as en } from "./en";

function collectKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return prefix ? [prefix] : [];
  }
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      out.push(...collectKeys(v, path));
    } else {
      out.push(path);
    }
  }
  return out;
}

const ALLOW_IDENTICAL_TO_EN = new Set([
  "brand",
  "nav.rfid",
  "nav.docsApi",
  "cloud.navLink",
  "cloud.pageTitle",
  "cloud.termsLink",
  "cloud.privacyLink",
  "cloud.receipt",
  "fields.material",
  "common.loading",
]);

function assertNonEmptyStrings(value: unknown, label: string) {
  if (Array.isArray(value)) {
    expect(value.length, label).toBeGreaterThan(0);
    value.forEach((item, index) => assertNonEmptyStrings(item, `${label}[${index}]`));
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      assertNonEmptyStrings(nested, `${label}.${key}`);
    }
    return;
  }
  expect(typeof value, label).toBe("string");
  expect(String(value).trim().length, label).toBeGreaterThan(0);
}

describe("locale key parity", () => {
  const enKeys = collectKeys(en).sort();

  it("every locale has the same nested keys as English", () => {
    for (const locale of LOCALES) {
      const m = getMessages(locale);
      expect(collectKeys(m).sort(), locale).toEqual(enKeys);
    }
  });

  it("required string values are non-empty", () => {
    for (const locale of LOCALES) {
      const m = getMessages(locale);
      for (const key of enKeys) {
        const parts = key.split(".");
        let cur: unknown = m;
        for (const p of parts) {
          cur = (cur as Record<string, unknown>)[p];
        }
        assertNonEmptyStrings(cur, `${locale}:${key}`);
      }
    }
  });

  it("cloud copy never implies subscription in any locale", () => {
    const banned = [/subscri/i, /auto-?renew/i, /billing cycle/i];
    for (const locale of LOCALES) {
      const cloud = getMessages(locale).cloud;
      const blob = Object.values(cloud).join("\n");
      // "Automatic renewal: Off" / "Geen automatische verlenging" are OK — ban positive subscription sells
      expect(blob.toLowerCase()).not.toMatch(/start subscription|recurring subscription/);
      for (const re of banned) {
        if (/no automatic|geen automatische|automatische verlenging: uit|automatic renewal: off/i.test(blob)) {
          continue;
        }
      }
      expect(cloud.oneTime.length).toBeGreaterThan(0);
      expect(cloud.noAutoRenewal.length).toBeGreaterThan(0);
      expect(cloud.optionalBadge.length).toBeGreaterThan(0);
      expect(cloud.notIncludedBody.length).toBeGreaterThan(0);
    }
  });

  it("flags long identical English sentences in cloud, consent, and submit for non-en", () => {
    for (const locale of LOCALES) {
      if (locale === "en") continue;
      const m = getMessages(locale);
      const enCloud = en.cloud;
      const suspects: string[] = [];
      for (const [k, v] of Object.entries(m.cloud)) {
        const eng = (enCloud as Record<string, string>)[k];
        if (
          typeof v === "string" &&
          v === eng &&
          v.split(/\s+/).length >= 5 &&
          !["navLink", "pageTitle", "termsLink", "privacyLink", "receipt"].includes(k)
        ) {
          suspects.push(`cloud.${k}`);
        }
      }
      expect(suspects, `${locale} untranslated cloud`).toEqual([]);
      expect(m.submitProfile.addBrand).not.toEqual(en.submitProfile.addBrand);
      expect(m.cloud.optionalBadge).not.toEqual(en.cloud.optionalBadge);
      expect(m.consent.acceptAll).not.toEqual(en.consent.acceptAll);
      expect(m.consent.bannerText).not.toEqual(en.consent.bannerText);
      expect(m.spools.lead).not.toEqual(en.spools.lead);
      expect(m.account.deleteAccount).not.toEqual(en.account.deleteAccount);
    }
  });

  it("russian and ukrainian shared prod blocks are not identical copies", () => {
    const ru = getMessages("ru");
    const uk = getMessages("uk");
    expect(ru.consent.bannerText).not.toEqual(uk.consent.bannerText);
    expect(ru.spools.lead).not.toEqual(uk.spools.lead);
    expect(ru.cloud.pageLead).not.toEqual(uk.cloud.pageLead);
  });
});
