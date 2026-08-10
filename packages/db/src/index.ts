export * from "./schema.js";
export * from "./client.js";
export * from "./migrate.js";
export * from "./password.js";
export {
  rebuildSearchIndex,
  searchDocuments,
  normalizeSearchText,
} from "./search.js";
export { searchVariantsByColor } from "./color-search.js";
export type { ColorSearchHit } from "./color-search.js";
export { seed } from "./seed.js";
export { reset } from "./reset.js";
export { importOfdCatalog } from "./import-ofd.js";
export { importOfdStarterProfiles } from "./import-ofd-starter-profiles.js";
export {
  ensurePrinterCatalog,
  listPrinterBrands,
  resolveOrCreatePrinter,
} from "./printer-catalog.js";
export {
  DEFAULT_NOZZLE_DIAMETERS_MM,
  PRINTER_CATALOG,
} from "./printer-catalog-data.js";
export { importOpenPrinterCatalog } from "./import-open-printers.js";
export {
  dedupeManufacturers,
  dedupePrinterBrands,
  canonicalPrinterBrand,
} from "./dedupe-brands.js";
export { ensureCommunityUser } from "./community-user.js";
export {
  getCatalogPreview,
  searchCatalogProducts,
  publicFilamentsOnly,
  provenanceForProduct,
  provenanceForProfile,
  isPlaceholderIdentifier,
} from "./catalog-public.js";
export type {
  CatalogPreviewItem,
  CatalogPreviewSection,
  CatalogSearchProduct,
  CatalogSearchResult,
  Provenance,
} from "./catalog-public.js";
