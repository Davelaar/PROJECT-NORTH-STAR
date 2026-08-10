/**
 * Amazon Associates (NL) — rewrite buy links with the site affiliate tag.
 * Default tag: 3dapeldoorn-21 (amazon.nl). Override with AMAZON_AFFILIATE_TAG.
 */

export const DEFAULT_AMAZON_NL_AFFILIATE_TAG = "3dapeldoorn-21";

export function amazonAffiliateTag(): string {
  const fromEnv = process.env.AMAZON_AFFILIATE_TAG?.trim();
  return fromEnv && fromEnv.length > 0
    ? fromEnv
    : DEFAULT_AMAZON_NL_AFFILIATE_TAG;
}

export function isAmazonBuyUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return (
      host === "amazon.nl" ||
      host.endsWith(".amazon.nl") ||
      host === "amazon.com" ||
      host.endsWith(".amazon.com") ||
      host === "amazon.de" ||
      host.endsWith(".amazon.de") ||
      host === "amazon.co.uk" ||
      host.endsWith(".amazon.co.uk") ||
      host === "amazon.fr" ||
      host.endsWith(".amazon.fr") ||
      host === "amazon.es" ||
      host.endsWith(".amazon.es") ||
      host === "amazon.it" ||
      host.endsWith(".amazon.it") ||
      host === "amazon.com.be" ||
      host.endsWith(".amazon.com.be") ||
      host === "amzn.to" ||
      host === "amzn.eu" ||
      host === "a.co"
    );
  } catch {
    return false;
  }
}

/**
 * Ensure Amazon where-to-buy URLs carry the affiliate `tag` query param.
 * Non-Amazon URLs are returned unchanged. Invalid URLs are returned unchanged.
 */
export function withAmazonAffiliateTag(
  url: string,
  tag: string = amazonAffiliateTag(),
): string {
  if (!tag || !url) return url;
  try {
    const parsed = new URL(url);
    if (!isAmazonBuyUrl(url)) return url;
    parsed.searchParams.set("tag", tag);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function applyAmazonAffiliateToPurchaseLinks<
  T extends { url: string },
>(links: T[], tag: string = amazonAffiliateTag()): T[] {
  return links.map((link) => ({
    ...link,
    url: withAmazonAffiliateTag(link.url, tag),
  }));
}
