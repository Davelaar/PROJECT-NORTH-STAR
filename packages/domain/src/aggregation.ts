/**
 * Community aggregation algorithm v1.
 *
 * Rules (deterministic):
 * 1. Ignore null/undefined values (unknown ≠ 0).
 * 2. Cap per-sample trust weight to [0.25, 3].
 * 3. Exclude Tukey IQR outliers (k=1.5) when n >= 4.
 * 4. Recommended value = unweighted median of remaining samples (primary).
 * 5. Also report trimmed mean (10% each side) when n >= 5.
 * 6. Secondary: trustWeightedRecommended = weighted median of kept samples
 *    using capped trustScore weights (default weight 1 when absent).
 * 7. Confidence:
 *    - high:   n_kept >= 5 AND IQR/median <= 0.15 (or IQR==0)
 *    - medium: n_kept >= 3 AND IQR/median <= 0.30
 *    - low:    otherwise
 *
 * Algorithm version string is part of the public contract.
 * Median remains the primary recommended field; trust weighting is secondary.
 */
export const AGGREGATION_ALGORITHM_VERSION = "of-agg-v1-median-iqr";

export type Sample = {
  value: number;
  trustScore?: number;
};

export type AggregateResult = {
  algorithmVersion: string;
  recommended: number | null;
  /** Weighted median after outlier removal; trustScore capped to [0.25, 3]. */
  trustWeightedRecommended: number | null;
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

function capTrust(score: number | undefined): number {
  const raw = typeof score === "number" && Number.isFinite(score) ? score : 1;
  return Math.min(3, Math.max(0.25, raw));
}

/**
 * Weighted median: sort by value, find the smallest value where cumulative
 * weight reaches half of total weight.
 */
export function weightedMedian(
  samples: Array<{ value: number; weight: number }>,
): number | null {
  if (samples.length === 0) return null;
  const ordered = [...samples].sort((a, b) => a.value - b.value);
  const total = ordered.reduce((sum, s) => sum + s.weight, 0);
  if (total <= 0) return median(ordered.map((s) => s.value));
  const half = total / 2;
  let cumulative = 0;
  for (const s of ordered) {
    cumulative += s.weight;
    if (cumulative >= half) return s.value;
  }
  return ordered[ordered.length - 1]!.value;
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
  const finite = samples.filter(
    (s) => typeof s.value === "number" && Number.isFinite(s.value),
  );
  const values = finite.map((s) => s.value);

  if (values.length === 0) {
    return {
      algorithmVersion: AGGREGATION_ALGORITHM_VERSION,
      recommended: null,
      trustWeightedRecommended: null,
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

  let keptSamples = [...finite];
  let excluded: number[] = [];

  if (values.length >= 4) {
    const s = sorted(values);
    const q1 = quantile(s, 0.25);
    const q3 = quantile(s, 0.75);
    const iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr;
    const hi = q3 + 1.5 * iqr;
    keptSamples = [];
    excluded = [];
    for (const sample of finite) {
      if (sample.value < lo || sample.value > hi) excluded.push(sample.value);
      else keptSamples.push(sample);
    }
    // If everything was excluded (degenerate), fall back to all values
    if (keptSamples.length === 0) {
      keptSamples = [...finite];
      excluded = [];
    }
  }

  const kept = keptSamples.map((s) => s.value);
  const med = median(kept);
  const trustWeightedRecommended = weightedMedian(
    keptSamples.map((s) => ({
      value: s.value,
      weight: capTrust(s.trustScore),
    })),
  );
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
    trustWeightedRecommended,
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
