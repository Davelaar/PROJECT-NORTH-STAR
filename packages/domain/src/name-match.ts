/**
 * Normalize brand / model names for matching spelling variants.
 * Strips diacritics, punctuation, and common corporate suffixes.
 */
export function normalizeNameKey(input: string): string {
  let s = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  const suffixes = [
    "3d printing",
    "3d printer",
    "3d",
    "technology",
    "technologies",
    "research",
    "labs",
    "lab",
    "co ltd",
    "co",
    "ltd",
    "inc",
    "gmbh",
    "bv",
    "llc",
  ];
  for (const suf of suffixes) {
    if (s === suf) continue;
    if (s.endsWith(` ${suf}`)) {
      s = s.slice(0, -(suf.length + 1)).trim();
    }
  }
  return s;
}

/** Title-case a free-text brand/model while preserving known tokens like CF / XL. */
export function displayNameFromInput(input: string): string {
  const cleaned = input.trim().replace(/\s+/g, " ");
  if (!cleaned) return cleaned;
  return cleaned
    .split(" ")
    .map((part) => {
      if (/^(CF|GF|HF|XL|MK\d*|X1|P1|A1|K1|K2|CR|SV|V\d+)$/i.test(part)) {
        return part.toUpperCase();
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]!;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[b.length]!;
}

export type NameMatchKind = "exact" | "alias" | "fuzzy" | "none";

export type NameMatchResult = {
  canonical: string | null;
  kind: NameMatchKind;
  distance: number | null;
};

/**
 * Match `input` against canonical names + aliases.
 * Fuzzy only when both sides are long enough and distance is small.
 */
export function matchNormalizedName(
  input: string,
  candidates: Array<{ canonical: string; keys: string[] }>,
): NameMatchResult {
  const key = normalizeNameKey(input);
  if (!key) return { canonical: null, kind: "none", distance: null };

  for (const c of candidates) {
    const canonKey = normalizeNameKey(c.canonical);
    if (key === canonKey) {
      return { canonical: c.canonical, kind: "exact", distance: 0 };
    }
    for (const alias of c.keys) {
      if (key === normalizeNameKey(alias)) {
        return { canonical: c.canonical, kind: "alias", distance: 0 };
      }
    }
  }

  let best: { canonical: string; distance: number } | null = null;
  for (const c of candidates) {
    const keys = [c.canonical, ...c.keys].map(normalizeNameKey);
    for (const k of keys) {
      if (!k) continue;
      const distance = levenshtein(key, k);
      const maxLen = Math.max(key.length, k.length);
      const allowed =
        maxLen <= 4 ? 0 : maxLen <= 8 ? 1 : maxLen <= 14 ? 2 : 3;
      if (distance > allowed) continue;
      if (!best || distance < best.distance) {
        best = { canonical: c.canonical, distance };
      }
    }
  }
  if (best) {
    return {
      canonical: best.canonical,
      kind: best.distance === 0 ? "exact" : "fuzzy",
      distance: best.distance,
    };
  }
  return { canonical: null, kind: "none", distance: null };
}
