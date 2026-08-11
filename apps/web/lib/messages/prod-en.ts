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
  support: "Support",
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
  wizardLead:
    "Choose brand and material from the catalog, then product and colour. Search first; add “Other” only when the item is truly missing.",
  catalogRequired:
    "Select brand, material, product and colour from the catalog before saving.",
  existingRollWarn:
    "You already have {count} roll(s) of this colour in My Spools. Save only if this is another physical spool.",
  editSpool: "Edit spool",
  cancel: "Cancel",
  showArchived: "Show archived",
  usageLabel: "Used after print (g)",
  usagePlaceholder: "e.g. 42",
  usageSubmit: "Subtract usage",
  usageAddSubmit: "Add grams",
  usageSaved: "Usage logged and remaining amount updated.",
  usageError: "Enter a positive amount of grams used.",
  usageNeedsWeights: "Add initial and current weight to track print usage.",
};

export const accountEn = {
  heading: "Account",
  sessions: "Active sessions",
  revokeSession: "Revoke",
  revokeOthers: "Revoke other sessions",
  exportData: "Export my data",
  deleteAccount: "Delete my account",
  deleteWarn:
    "This permanently deletes private spools and sessions. Public contributions may be anonymized rather than removed.",
  deleteConfirmLabel: 'Type DELETE to confirm',
  privacyPrefs: "Privacy preferences",
  register: "Create account",
  logout: "Log out",
};

export const legalPagesEn = {
  privacyTitle: "Privacy policy",
  privacyMetaDescription:
    "How OpenFilament processes account email, Stripe payments, My Spools and cookies.",
  cookiesTitle: "Cookie policy",
  termsTitle: "Terms of use",
  securityTitle: "Security",
  trustTitle: "Trust center",
  placeholderNotice:
    "This page includes owner placeholders marked clearly. They are release blockers until replaced.",
  effective: "Effective date",
  operator: "Operator",
  privacyContact: "Privacy contact",
  hosting: "Hosting",
  contact: "Contact",
  openSourceRepository: "Open-source repository",
  cookieSettingsHint:
    "You can change analytics and preference cookies any time with Cookie settings. Consent version:",
  sections: {
    privacy: [
      {
        heading: "Accounts — what we store",
        paragraphs: [
          "Creating an account only requires an email address and a password. We store that email so you can sign in, receive payment receipts and reset your password. We do not ask for your real name; an internal username is generated automatically. Passwords are stored as scrypt hashes — never in plain text.",
          "We do not use your email for marketing. Account recovery and essential service messages (for example payment or security notices) are the intended uses.",
        ],
      },
      {
        heading: "Payments (Stripe)",
        paragraphs: [
          "Optional My Spools Cloud purchases are paid through Stripe Checkout. You enter card or wallet details on Stripe’s hosted payment pages. Stripe is the payment processor: OpenFilament never receives or stores your full card number, CVC or equivalent wallet secrets.",
          "On our side we keep only what is needed to deliver Cloud access and accounting: amount, currency, payment status, Stripe session/payment identifiers, timestamps and your Cloud entitlement period. Stripe processes payment data under Stripe’s own terms and privacy policy.",
          "Cloud access is a one-time prepaid period (currently 12 months). There is no automatic renewal and no off-session charge unless you start a new Checkout yourself.",
        ],
      },
      {
        heading: "What else we process",
        items: [
          "Authentication sessions (httpOnly cookies) and security logs.",
          "My Spools Cloud inventory, private notes and QR/RFID identities only when you explicitly sync to Cloud.",
          "Local My Spools stays in your browser until you sync or export it — signing in does not upload local spools by itself.",
          "Public community contributions you choose to publish (calibrations, catalog tips).",
          "Consent preferences and optional Google Analytics 4 only after you opt in.",
        ],
      },
      {
        heading: "Legal bases",
        items: [
          "Contract / requested service for accounts, Cloud, exports and downloads.",
          "Legitimate interest for security, abuse prevention and service integrity.",
          "Consent for analytics cookies/storage — withdrawable via Cookie settings on this site.",
          "Legal obligation where security or accounting records must be retained.",
        ],
      },
      {
        heading: "My Spools",
        paragraphs: [
          "Local My Spools is free and stays on your device. Clearing site data, losing the device or switching browsers can remove it.",
          "My Spools Cloud is optional paid hosting for inventory sync and backup. Public QR resolution does not expose private notes, locations or account identifiers.",
        ],
      },
      {
        heading: "Your rights and retention",
        paragraphs: [
          "You can request access, correction, deletion, restriction, portability and objection, and withdraw consent. Use Account export/delete, Cookie settings or email the privacy contact. You may complain to the supervisory authority listed for this site.",
          "Soft-deleted Cloud spools are purged on a schedule. Payment and security records may be kept longer where required for accounting or fraud prevention. Backups may retain deleted data until backup expiry.",
        ],
      },
      {
        heading: "International transfers and changes",
        paragraphs: [
          "Hosting for the application and database is on our EU VPS as shown above. If you enable analytics, Google may process analytics data outside the EEA under its safeguards. Stripe may process payment data in regions where Stripe operates. Material policy changes update the consent version and may re-prompt for consent.",
        ],
      },
    ],
    terms: [
      {
        heading: "Community platform",
        paragraphs: [
          "OpenFilament provides an open catalog, identification tools and community calibrations. Profiles are community or catalog-derived and are not a print-safety guarantee. You remain responsible for validating settings on your printer.",
        ],
      },
      {
        heading: "Accounts and My Spools",
        paragraphs: [
          "Accounts are optional for browsing and downloads. My Spools Local is free and stored in your browser. My Spools Cloud is an optional prepaid service: €19.99 for 12 months as a one-time Stripe payment, with no automatic renewal or future charge unless you start a new Checkout.",
          "After expiry, a grace period and read-only export window apply before Cloud inventory deletion. Refunds and disputes follow the Cloud refund policy. Stripe processes payment data; OpenFilament does not store card numbers.",
        ],
      },
      {
        heading: "Contributions",
        paragraphs: [
          "By submitting calibrations you accept the contribution terms shown at submit time and license the contribution for public display under the project’s open terms. Contributor emails stay private.",
        ],
      },
      {
        heading: "Availability and liability",
        paragraphs: [
          "The service is provided as-is without warranty of uninterrupted availability. To the extent permitted by law, liability is limited for free community tooling. My Spools Cloud is offered in beta.",
        ],
      },
    ],
    cookies: [
      {
        heading: "Necessary storage",
        paragraphs: [
          "Required for the site to work: language (of_locale), consent choice (of_consent), signed-in session (of_session, httpOnly), CSRF protection (of_csrf), and local My Spools data in IndexedDB. A service worker / Cache Storage may keep the PWA shell offline-capable. These are not used for advertising.",
        ],
      },
      {
        heading: "Optional analytics",
        paragraphs: [
          "Only if you accept analytics we load privacy-conscious Google Analytics 4, which may set first-party cookies such as _ga. Rejecting analytics leaves search, My Spools, accounts, QR, RFID and downloads fully usable. Marketing cookies are not used.",
        ],
      },
      {
        heading: "Change your choice",
        paragraphs: [
          "Open Cookie settings from the footer or the privacy policy page any time. Changing your mind updates storage immediately and turns analytics off when you withdraw consent.",
        ],
      },
    ],
    security: [
      {
        heading: "What we protect",
        items: [
          "Account credentials with scrypt password hashes.",
          "Session tokens hashed at rest and sent to the browser as httpOnly cookies.",
          "Private My Spools with server-side ownership checks.",
          "Public QR projections that omit notes, locations and account identifiers.",
          "Payment card data handled by Stripe — not stored on OpenFilament servers.",
        ],
      },
      {
        heading: "Responsible disclosure",
        paragraphs: [
          "Report vulnerabilities privately to the configured security contact. Do not publicly disclose secrets, exploits against live users or production credentials. Allow reasonable time for remediation before public discussion.",
        ],
      },
    ],
  },
};

export const supportEn = {
  title: "Support",
  metaDescription:
    "What OpenFilament is, what you can do, and how free My Spools differs from paid Cloud sync (beta).",
  lead:
    "Short operator-to-customer help: what this site is for, and how My Spools Local vs Cloud works — including that paid Cloud is still beta.",
  productHeading: "What OpenFilament is",
  productBody:
    "OpenFilament is a browser-first filament catalog and calibration hub. Find filament data, download starter or measured profiles for your slicer, identify spools with QR or RFID, and keep an optional inventory with My Spools — without installing a desktop app for the core product.",
  productItems: [
    "Search brands, materials and colours; use manufacturer ranges as a strong first setting.",
    "Download slicer presets (measured community profiles when available, otherwise manufacturer-based starters).",
    "Print QR labels and use RFID flows when you have compatible hardware.",
    "Contribute calibrations so others print better.",
    "Optional account for Cloud inventory sync — browsing and Local My Spools work without paying.",
  ],
  mySpoolsHeading: "My Spools — free vs paid",
  mySpoolsLocalTitle: "My Spools Local (free)",
  mySpoolsLocalBody:
    "Full inventory on this device: notes, drying, QR/RFID links, import/export. No account required. Data stays in your browser — export backups if you clear site data or switch devices.",
  mySpoolsCloudTitle: "My Spools Cloud (paid, beta)",
  mySpoolsCloudBody:
    "Optional prepaid hosting (€19.99 for 12 months, one-time via Stripe, no auto-renewal). An account (email + password) is required so we can attach Cloud inventory and recover access.",
  mySpoolsDiffItems: [
    "Free Local: complete inventory tools on one browser/device.",
    "Paid Cloud: the only extras are synchronising spools across devices and keeping server-side stock/backup on our VPS.",
    "Cloud does not unlock better profiles, catalog privileges, RFID/QR features, or other inventory tools beyond what Local already has.",
    "After the paid period ends you get a grace/export window; Local My Spools remains fully usable without Cloud.",
  ],
  betaNote:
    "My Spools Cloud is in beta. Expect rough edges while we harden sync and billing. The paid product’s purpose remains narrow: spool sync and stock backup — nothing more.",
  contactHeading: "Contact",
  contactBody:
    "Questions about privacy, billing or Cloud beta: email us. For cookie choices, use Cookie settings on the privacy policy page.",
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
  checkoutTestMode:
    "Checkout is running in Stripe test mode. Real payments are not enabled yet.",
  checkoutLiveBlocked:
    "Live Stripe keys are configured, but live payments are still blocked by the production safety flag.",
  checkoutMissingConfig:
    "Checkout is not available yet because Stripe configuration is incomplete.",
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
