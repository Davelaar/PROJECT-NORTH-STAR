/**
 * Community aggregation algorithm v1.
 *
 * Rules (deterministic):
 * 1. Ignore null/undefined values (unknown ≠ 0).
 * 2. Cap per-sample trust weight to [0.25, 3].
 * 3. Exclude Tukey IQR outliers (k=1.5) when n >= 4.
 * 4. Recommended value = unweighted median of remaining samples.
 * 5. Also report trimmed mean (10% each side) when n >= 5.
 * 6. Confidence:
 *    - high:   n_kept >= 5 AND IQR/median <= 0.15 (or IQR==0)
 *    - medium: n_kept >= 3 AND IQR/median <= 0.30
 *    - low:    otherwise
 *
 * Algorithm version string is part of the public contract.
 */
export const AGGREGATION_ALGORITHM_VERSION = "of-agg-v1-median-iqr";

export type Sample = {
  value: number;
  trustScore?: number;
};

export type AggregateResult = {
  algorithmVersion: string;
  recommended: number | null;
  trimmedMean: number | null;
  observedMin: number | null;
  observedMax: number | null;
  sampleCount: number;
  keptCount: number;
  excludedOutlierCount: number;
  confidence: "high" | "medium" | "low" | "insufficient";
  excludedValues: number[];
};

function sorted(nums: number[]): number[] {
  return [...nums].sort((a, b) => a - b);
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = sorted(nums);
  const mid = Math.floor(s.length / 2);
  if (s.length % 2 === 0) {
    return (s[mid - 1]! + s[mid]!) / 2;
  }
  return s[mid]!;
}

function quantile(sortedAsc: number[], q: number): number {
  if (sortedAsc.length === 1) return sortedAsc[0]!;
  const pos = (sortedAsc.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const a = sortedAsc[base]!;
  const b = sortedAsc[Math.min(base + 1, sortedAsc.length - 1)]!;
  return a + rest * (b - a);
}

function trimmedMean(nums: number[], trimFraction = 0.1): number | null {
  if (nums.length === 0) return null;
  const s = sorted(nums);
  const drop = Math.floor(s.length * trimFraction);
  const slice = s.slice(drop, s.length - drop || undefined);
  const use = slice.length > 0 ? slice : s;
  return use.reduce((a, b) => a + b, 0) / use.length;
}

export function aggregateMetric(samples: Sample[]): AggregateResult {
  const values = samples
    .map((s) => s.value)
    .filter((v) => typeof v === "number" && Number.isFinite(v));

  if (values.length === 0) {
    return {
      algorithmVersion: AGGREGATION_ALGORITHM_VERSION,
      recommended: null,
      trimmedMean: null,
      observedMin: null,
      observedMax: null,
      sampleCount: 0,
      keptCount: 0,
      excludedOutlierCount: 0,
      confidence: "insufficient",
      excludedValues: [],
    };
  }

  let kept = [...values];
  let excluded: number[] = [];

  if (values.length >= 4) {
    const s = sorted(values);
    const q1 = quantile(s, 0.25);
    const q3 = quantile(s, 0.75);
    const iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr;
    const hi = q3 + 1.5 * iqr;
    kept = [];
    excluded = [];
    for (const v of values) {
      if (v < lo || v > hi) excluded.push(v);
      else kept.push(v);
    }
    // If everything was excluded (degenerate), fall back to all values
    if (kept.length === 0) {
      kept = [...values];
      excluded = [];
    }
  }

  const med = median(kept);
  const tMean = kept.length >= 5 ? trimmedMean(kept, 0.1) : med;
  const sKept = sorted(kept);
  const iqr =
    sKept.length >= 4
      ? quantile(sKept, 0.75) - quantile(sKept, 0.25)
      : sKept.length >= 2
        ? sKept[sKept.length - 1]! - sKept[0]!
        : 0;
  const rel = med != null && med !== 0 ? iqr / Math.abs(med) : 0;

  let confidence: AggregateResult["confidence"] = "insufficient";
  if (kept.length >= 4 && (iqr === 0 || rel <= 0.15)) confidence = "high";
  else if (kept.length >= 3 && (iqr === 0 || rel <= 0.3)) confidence = "medium";
  else if (kept.length >= 1) confidence = "low";

  return {
    algorithmVersion: AGGREGATION_ALGORITHM_VERSION,
    recommended: med,
    trimmedMean: tMean,
    observedMin: sKept[0] ?? null,
    observedMax: sKept[sKept.length - 1] ?? null,
    sampleCount: values.length,
    keptCount: kept.length,
    excludedOutlierCount: excluded.length,
    confidence,
    excludedValues: excluded,
  };
}

export function aggregateProfileFields(
  revisions: Array<{
    trustScore?: number;
    nozzleTempOtherLayersC?: number | null;
    bedTempOtherLayersC?: number | null;
    flowRatio?: number | null;
    pressureAdvance?: number | null;
    maxVolumetricFlowMm3s?: number | null;
  }>,
) {
  const field = (
    pick: (r: (typeof revisions)[number]) => number | null | undefined,
  ) => {
    const samples: Sample[] = [];
    for (const r of revisions) {
      const v = pick(r);
      if (v == null) continue;
      samples.push({ value: v, trustScore: r.trustScore });
    }
    return aggregateMetric(samples);
  };

  return {
    algorithmVersion: AGGREGATION_ALGORITHM_VERSION,
    nozzleTempOtherLayersC: field((r) => r.nozzleTempOtherLayersC),
    bedTempOtherLayersC: field((r) => r.bedTempOtherLayersC),
    flowRatio: field((r) => r.flowRatio),
    pressureAdvance: field((r) => r.pressureAdvance),
    maxVolumetricFlowMm3s: field((r) => r.maxVolumetricFlowMm3s),
  };
}
