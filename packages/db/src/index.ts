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
export {
  listUserSpools,
  getOwnedSpool,
  upsertUserSpool,
  softDeleteUserSpool,
  hardDeleteUserSpool,
  resolvePublicSpoolByIdentity,
  purgeAllUserSpools,
} from "./user-spools.js";
export type {
  SpoolWriteInput,
  PublicSpoolProjection,
} from "./user-spools.js";
export {
  exportUserData,
  deleteUserAccount,
  listActiveSessions,
  revokeSession,
  revokeOtherSessions,
  upsertPrivacyPrefs,
  recordContributionTerms,
  purgeSoftDeletedSpools,
  revokeExpiredTokens,
} from "./account-privacy.js";
export {
  addPurchaseLinkToVariant,
  resolveOrCreateManufacturer,
  resolveOrCreateFilamentProduct,
  resolveOrCreateFilamentVariant,
} from "./community-catalog.js";
export type { PurchaseLinkRecord } from "./community-catalog.js";
export {
  COMMUNITY_VERIFIED_THRESHOLD,
  castProfileVote,
  getProfileVoteSummary,
  hashAnonVoterFingerprint,
  profileVoteOrderSql,
  voterKeyForAnon,
  voterKeyForUser,
} from "./profile-votes.js";
export type { ProfileVoteSummary } from "./profile-votes.js";
export { searchAutocomplete } from "./autocomplete.js";
export type { AutocompleteHit } from "./autocomplete.js";
export {
  addCalendarMonthsUtc,
  addDaysUtc,
  applyPaidCloudPayment,
  createPendingCloudPayment,
  deriveEntitlementStatus,
  ensureCloudEntitlementRow,
  findOpenPendingCheckout,
  getCloudEntitlementView,
  getPaymentByCheckoutId,
  getPaymentByUuid,
  grantManualCloudAccess,
  listCloudEntitlementsForAdmin,
  listCloudPaymentsForAdmin,
  listCloudPaymentsForUser,
  loadCloudConfigFromEnv,
  markPaymentDisputed,
  markPaymentRefunded,
  recomputeCloudEntitlement,
  recordAdminCloudAction,
  revokeGrantForPayment,
  revokeManualCloudAccess,
} from "./cloud-entitlement.js";
export type {
  CloudAccessMode,
  CloudConfig,
  CloudEntitlementView,
} from "./cloud-entitlement.js";
export {
  beginWebhookEvent,
  countCloudSpools,
  finishWebhookEvent,
  listEntitlementsNeedingReminders,
  markReminderSent,
  purgeExpiredCloudInventories,
} from "./cloud-lifecycle.js";
export type { ReminderKind } from "./cloud-lifecycle.js";

