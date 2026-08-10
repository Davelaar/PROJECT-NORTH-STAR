# Aggregation

Algorithm: `of-agg-v1-median-iqr` in `@open-filament/domain`.

## Rules

1. Ignore null/undefined (unknown ≠ 0).
2. Cap trust weight conceptually to `[0.25, 3]` (reserved for future weighting).
3. Tukey IQR outlier exclusion when `n >= 4` (k=1.5).
4. Recommended value = median of kept samples.
5. Trimmed mean (10%) when `n >= 5`.
6. Confidence: high / medium / low / insufficient from kept count + relative IQR.

Exposed via `GET /api/v1/variants/:uuid/recommendation`. Responses note when samples include synthetic fixtures.
