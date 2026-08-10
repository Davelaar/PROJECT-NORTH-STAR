/** Placeholder / zero-padded identifiers that must not be shown as real data. */
export function isPlaceholderId(value: string | null | undefined): boolean {
  if (!value) return true;
  const v = value.trim();
  if (!v) return true;
  if (/^0+$/.test(v)) return true;
  const digits = v.replace(/\D/g, "");
  if (digits.length >= 8 && /^0+$/.test(digits)) return true;
  return false;
}
