/**
 * Legal / privacy configuration.
 * Owner identity must be real before public launch claims.
 * Hosting defaults reflect the known OpenFilament VPS deployment.
 */

export const CONSENT_VERSION = process.env.NEXT_PUBLIC_CONSENT_VERSION ?? "2026-08-10";
export const CONTRIBUTION_TERMS_VERSION =
  process.env.NEXT_PUBLIC_CONTRIBUTION_TERMS_VERSION ?? "2026-08-10";

const PLACEHOLDER = (key: string) => `[OWNER MUST PROVIDE ${key}]`;

export type LegalConfig = {
  ownerName: string;
  privacyEmail: string;
  securityEmail: string;
  hostingRegion: string;
  hostingProvider: string;
  supervisoryAuthority: string;
  supervisoryAuthorityUrl: string;
  publicBaseUrl: string;
  effectiveDate: string;
  placeholdersRemaining: string[];
};

export function getLegalConfig(): LegalConfig {
  const ownerName =
    process.env.NEXT_PUBLIC_LEGAL_OWNER_NAME?.trim() ||
    PLACEHOLDER("LEGAL NAME");
  const privacyEmail =
    process.env.NEXT_PUBLIC_LEGAL_PRIVACY_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "info@openfilament.nl";
  const securityEmail =
    process.env.NEXT_PUBLIC_LEGAL_SECURITY_EMAIL?.trim() || privacyEmail;
  // Known production posture: app+SQLite on the operator VPS (not a SaaS DB).
  const hostingRegion =
    process.env.NEXT_PUBLIC_LEGAL_HOSTING_REGION?.trim() || "EU (Germany)";
  const hostingProvider =
    process.env.NEXT_PUBLIC_LEGAL_HOSTING_PROVIDER?.trim() ||
    "Self-hosted VPS (IONOS), application and SQLite on-server";
  const supervisoryAuthority =
    process.env.NEXT_PUBLIC_LEGAL_SUPERVISORY_AUTHORITY?.trim() ||
    "Autoriteit Persoonsgegevens (NL)";
  const supervisoryAuthorityUrl =
    process.env.NEXT_PUBLIC_LEGAL_SUPERVISORY_URL?.trim() ||
    "https://www.autoriteitpersoonsgegevens.nl/";
  const publicBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://openfilament.nl";
  const effectiveDate =
    process.env.NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE?.trim() || "2026-08-10";

  const placeholdersRemaining: string[] = [];
  if (ownerName.startsWith("[OWNER MUST PROVIDE")) {
    placeholdersRemaining.push("LEGAL_OWNER_NAME");
  }

  return {
    ownerName,
    privacyEmail,
    securityEmail,
    hostingRegion,
    hostingProvider,
    supervisoryAuthority,
    supervisoryAuthorityUrl,
    publicBaseUrl,
    effectiveDate,
    placeholdersRemaining,
  };
}

export function legalHasPlaceholders(): boolean {
  return getLegalConfig().placeholdersRemaining.length > 0;
}

/** Human-readable missing owner fields for ops banners. */
export function legalMissingSummary(): string {
  const missing = getLegalConfig().placeholdersRemaining;
  if (!missing.length) return "";
  return `Missing launch identity: ${missing.join(", ")}. Set NEXT_PUBLIC_LEGAL_OWNER_NAME (legal name / company) and rebuild.`;
}
