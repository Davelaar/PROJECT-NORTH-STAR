/**
 * Parse OpenFilament QR payloads into a variant UUID.
 * Accepts /f/{uuid}, /variants/{uuid}, openfilament://…, absolute site URLs, or bare UUIDs.
 */
export function parseOpenFilamentQrPayload(raw: string): string | null {
  // Strip BOM / zero-width chars some phone cameras append to decoded text.
  const text = raw.trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
  if (!text) return null;

  const uuidRe =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  const fMatch = text.match(/\/f\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (fMatch?.[1]) return fMatch[1].toLowerCase();

  const variantPath = text.match(
    /\/variants\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );
  if (variantPath?.[1]) return variantPath[1].toLowerCase();

  const schemeMatch = text.match(
    /^openfilament:\/\/(?:spool|variant)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );
  if (schemeMatch?.[1]) return schemeMatch[1].toLowerCase();

  const compact = text.replace(/\s+/g, "");
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      compact,
    )
  ) {
    return compact.toLowerCase();
  }

  // Absolute OpenFilament URLs that embed a UUID somewhere in the path.
  try {
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text)
      ? text
      : `https://${text}`;
    const url = new URL(withScheme);
    const host = url.hostname.toLowerCase();
    if (
      host.includes("openfilament") ||
      host === "localhost" ||
      host.endsWith(".local")
    ) {
      const inPath = url.pathname.match(uuidRe);
      if (inPath?.[0]) return inPath[0].toLowerCase();
    }
  } catch {
    /* not a URL */
  }

  return null;
}
