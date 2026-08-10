/** Shared English copy for production-readiness surfaces (localized overrides welcome). */
export const consentEn = {
  bannerAria: "Cookie consent",
  bannerText:
    "We use necessary storage to run the site. Optional analytics help us improve OpenFilament. You can reject non-essential cookies without losing search, My Spools, downloads, QR or RFID.",
  acceptAll: "Accept all",
  rejectNonEssential: "Reject non-essential",
  manage: "Manage preferences",
  cookiePolicy: "Cookie policy",
  privacyPolicy: "Privacy policy",
  prefsTitle: "Cookie preferences",
  prefsLead:
    "Necessary storage stays on. Analytics and marketing stay off unless you enable them.",
  necessary: "Necessary",
  necessaryHelp: "Session, security, consent choice, language, local My Spools.",
  preferences: "Preferences",
  preferencesHelp: "Remember non-essential UI preferences.",
  analytics: "Analytics",
  analyticsHelp: "Privacy-conscious Google Analytics 4 after consent only.",
  marketing: "Marketing",
  marketingHelp: "Not used. Remains disabled.",
  savePrefs: "Save preferences",
  cancel: "Cancel",
};

export const footerEn = {
  navAria: "Site and legal",
  privacy: "Privacy",
  cookies: "Cookies",
  cookieSettings: "Cookie settings",
  terms: "Terms",
  security: "Security",
  trust: "Trust center",
  mySpools: "My Spools",
  tagline: "OpenFilament — browser-first filament intelligence.",
  legalPlaceholderWarn:
    "Legal owner details are still placeholders — see docs/PRODUCTION_LAUNCH_CHECKLIST.md before launch.",
};

export const spoolsEn = {
  heading: "My Spools",
  lead:
    "Track physical spools on this device. Cloud sync is optional and never starts just because you sign in.",
  localMode: "Local-only (this browser)",
  localWarn:
    "Local data can be lost if you clear site data or switch devices. Export a backup regularly.",
  cloudMode: "Cloud sync (account)",
  create: "Add spool",
  export: "Export JSON",
  import: "Import JSON",
  clearAll: "Clear all local data",
  clearConfirm: "Delete all local spool records on this device? This cannot be undone.",
  syncPreview: "Preview sync",
  syncConfirm: "Upload selected spools",
  syncKeepLocal: "Keep local copy after sync",
  syncRemoveLocal: "Remove local copy after sync",
  empty: "No spools yet. Add your first physical roll.",
  status: "Status",
  weight: "Current weight (g)",
  tare: "Tare / empty spool (g)",
  initial: "Initial net (g)",
  remaining: "Remaining %",
  location: "Storage location",
  notes: "Notes (private)",
  batch: "Batch / lot",
  purchase: "Purchase date",
  opened: "Opened date",
  archive: "Archive",
  restore: "Restore",
  delete: "Delete",
  duplicate: "Duplicate for new roll",
  drying: "Add drying event",
  qr: "Attach QR identity",
  rfid: "Attach RFID identity",
  save: "Save spool",
  syncNeverAuto:
    "Signing in does not upload local spools. You must confirm sync explicitly.",
  conflictPolicy:
    "Conflicts use last-write-wins by sync version. Re-import skips older duplicates.",
};

export const accountEn = {
  heading: "Account",
  sessions: "Active sessions",
  revokeOthers: "Revoke other sessions",
  exportData: "Export my data",
  deleteAccount: "Delete my account",
  deleteWarn:
    "This permanently deletes private spools and sessions. Public contributions may be anonymized rather than removed.",
  deleteConfirmLabel: 'Type DELETE to confirm',
  privacyPrefs: "Privacy preferences",
  register: "Create account",
};

export const legalPagesEn = {
  privacyTitle: "Privacy policy",
  cookiesTitle: "Cookie policy",
  termsTitle: "Terms of use",
  securityTitle: "Security",
  trustTitle: "Trust center",
  placeholderNotice:
    "This page includes owner placeholders marked clearly. They are release blockers until replaced.",
  effective: "Effective date",
};

export const cloudEn = {
  navLink: "Cloud",
  billingLink: "Billing history",
  pageTitle: "My Spools Cloud",
  pageLead:
    "Optional cloud backup and sync for people who do not want to risk losing local inventory. Local My Spools stays free and complete — Cloud does not unlock extra inventory features.",
  optionalBadge: "Optional luxury — not required",
  localTitle: "My Spools Local — free",
  localBody:
    "Full inventory on this device (IndexedDB): notes, drying, QR/RFID, import/export. No account required. Export backups regularly — clearing browser data can remove local inventory.",
  cloudTitle: "My Spools Cloud — €19.99 for 12 months",
  cloudWhyTitle: "What Cloud adds",
  cloudWhyBody:
    "Only hosting on our VPS, sync across your devices, and server-side backup/recovery. The same spool tools exist in Local; Cloud is for peace of mind, not extra capabilities.",
  priceLine: "€19.99 for 12 months",
  oneTime: "One-time payment",
  noAutoRenewal: "No automatic renewal",
  neverCharge:
    "We will never charge you again unless you choose to purchase another 12 months.",
  includesTitle: "Included with Cloud",
  includeSync: "Synchronisation across devices",
  includeBackup: "Server-side backups on our VPS",
  includeRecovery: "Account recovery for Cloud inventory",
  includeExport: "Cloud JSON export during access, grace and retention",
  notIncludedTitle: "Not included",
  notIncludedBody:
    "No extra inventory tools beyond Local. Cloud does not add RFID/QR features, smarter profiles, or catalog privileges — only storage and sync.",
  statusLabel: "Cloud status",
  statusInactive: "Inactive",
  statusPending: "Pending",
  statusActive: "Active",
  statusGrace: "Grace period",
  statusReadOnly: "Read-only",
  statusExpired: "Expired",
  statusRefunded: "Refunded",
  statusDisputed: "Disputed",
  statusRevoked: "Revoked",
  validUntil: "Cloud access valid until",
  graceUntil: "Grace period until",
  readOnlyFrom: "Read-only from",
  deletionAt: "Cloud data deletion scheduled around",
  buyCta: "Buy 12 months of Cloud — €19.99",
  extendCta: "Extend Cloud by 12 months — €19.99",
  extendHint:
    "Purchasing another 12 months extends access from the current expiry date.",
  loginRequired: "Sign in to buy or manage My Spools Cloud.",
  checkoutUnavailable: "Checkout is not available yet (configuration pending).",
  termsLink: "Terms",
  privacyLink: "Privacy",
  retentionHint:
    "After expiry you keep a grace window, then a read-only export window, then Cloud inventory deletion. Local My Spools remains fully usable.",
  vatUnspecified:
    "Tax presentation is not yet configured by the operator (VAT inclusive/exclusive).",
  vatNotApplicable: "VAT not applicable — price shown is the amount charged.",
  successTitle: "Payment status",
  verifying:
    "We are verifying your payment with Stripe. Cloud access will activate after payment confirmation.",
  activatedTitle: "My Spools Cloud is active",
  paidOnce: "Paid once",
  autoRenewalOff: "Automatic renewal: Off",
  pendingPayment:
    "Your payment is still processing. We will activate Cloud after Stripe confirms it.",
  failedPayment:
    "Payment was not completed. No Cloud access was added and no future payment will be attempted.",
  billingTitle: "Cloud billing history",
  billingLead:
    "One-time payments only. These are not recurring invoices. OpenFilament does not store card details.",
  receipt: "Receipt",
  accessPeriod: "Access period",
  exportCloud: "Export Cloud spools (JSON)",
  backToSpools: "Back to My Spools",
  syncRequiresCloud:
    "Cloud sync is optional and needs an active prepaid Cloud period (or grace). Local inventory stays free and complete without Cloud.",
  billingColDate: "Date",
  billingColAmount: "Amount",
  billingColStatus: "Status",
  paymentStatusCreated: "Created",
  paymentStatusPending: "Pending",
  paymentStatusPaid: "Paid",
  paymentStatusFailed: "Failed",
  paymentStatusExpired: "Expired",
  paymentStatusRefunded: "Refunded",
  paymentStatusPartialRefund: "Partially refunded",
  paymentStatusDisputed: "Disputed",
  paymentStatusCancelled: "Cancelled",
};
