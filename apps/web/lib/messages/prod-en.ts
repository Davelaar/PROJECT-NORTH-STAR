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
