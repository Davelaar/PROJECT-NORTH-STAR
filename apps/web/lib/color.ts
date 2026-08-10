/** Color helpers for variant matching and hex inputs. */

export function normalizeHex(input: string): string | null {
  const raw = input.trim();
  const m = raw.match(/^#?([0-9a-fA-F]{6})$/);
  if (!m?.[1]) return null;
  return `#${m[1].toUpperCase()}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = normalizeHex(hex);
  if (!n) return null;
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

export function colorDistance(a: string, b: string): number {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  if (!A || !B) return Number.POSITIVE_INFINITY;
  const dr = A.r - B.r;
  const dg = A.g - B.g;
  const db = A.b - B.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function nearestByHex<T extends { hex: string | null | undefined }>(
  targetHex: string,
  items: T[],
  maxDistance = 48,
): T | null {
  let best: T | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const item of items) {
    if (!item.hex) continue;
    const d = colorDistance(targetHex, item.hex);
    if (d < bestDist) {
      bestDist = d;
      best = item;
    }
  }
  if (!best || bestDist > maxDistance) return null;
  return best;
}
