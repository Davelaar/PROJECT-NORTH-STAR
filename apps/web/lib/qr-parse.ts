/**
 * Parse OpenFilament QR payloads into a variant UUID.
 * Accepts full URLs (.../f/{uuid}), openfilament://spool|{variant}/{uuid}, or bare UUIDs.
 */
export function parseOpenFilamentQrPayload(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  const uuidRe =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  const fMatch = text.match(/\/f\/([0-9a-f-]{36})/i);
  if (fMatch?.[1]) return fMatch[1].toLowerCase();

  const schemeMatch = text.match(
    /^openfilament:\/\/(?:spool|variant)\/([0-9a-f-]{36})$/i,
  );
  if (schemeMatch?.[1]) return schemeMatch[1].toLowerCase();

  const bare = text.match(uuidRe);
  if (bare && bare[0].length === text.replace(/\s+/g, "").length) {
    return bare[0].toLowerCase();
  }
  if (bare && /^[0-9a-f-]{36}$/i.test(text)) return text.toLowerCase();

  return null;
}
