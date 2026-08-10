/**
 * Catalog list order: letter-leading brands A–Z first, then digit/other brands.
 * Within a bucket: manufacturer, then product (case-insensitive).
 */
export function compareCatalogLabels(
  aMfr: string,
  aProduct: string,
  bMfr: string,
  bProduct: string,
): number {
  const bucket = (name: string) =>
    /^[a-z\u00c0-\u024f\u0400-\u04ff\u4e00-\u9fff]/i.test(name.trim())
      ? 0
      : 1;

  const am = aMfr.trim();
  const bm = bMfr.trim();
  const ba = bucket(am);
  const bb = bucket(bm);
  if (ba !== bb) return ba - bb;

  const mfrCmp = am.localeCompare(bm, undefined, { sensitivity: "base" });
  if (mfrCmp !== 0) return mfrCmp;
  return aProduct
    .trim()
    .localeCompare(bProduct.trim(), undefined, { sensitivity: "base" });
}
