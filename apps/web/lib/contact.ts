/** Public inbox for brand sample / loan-printer outreach. */
export const CONTACT_EMAIL = "info@openfilament.nl";

export function samplesMailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
