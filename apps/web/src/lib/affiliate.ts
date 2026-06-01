export type AffiliateProgramMeta = {
  id: string;
  name: string;
  network: string;
  affiliateId: string;
  baseUrl: string;
};

const ASIN_RE = /^[A-Z0-9]{10}$/i;

function buildAmazonUrl(input: string, tag: string): string {
  const trimmed = input.trim();
  if (ASIN_RE.test(trimmed)) {
    return `https://www.amazon.com/dp/${trimmed}?tag=${tag}`;
  }
  try {
    const url = new URL(trimmed);
    url.searchParams.set("tag", tag);
    return url.toString();
  } catch {
    return trimmed;
  }
}

export function buildAffiliateUrl(
  program: AffiliateProgramMeta,
  input: string
): string {
  if (program.network === "amazon") return buildAmazonUrl(input, program.affiliateId);
  return input;
}

// Detects whether an article body contains affiliate content requiring FTC disclosure.
// Checks for Amazon links, product-card fences, and nestmargin cross-promo markers.
export function hasAffiliateContent(body: string): boolean {
  return (
    /amazon\.com/i.test(body) ||
    /amzn\.to/i.test(body) ||
    /```product-card/.test(body) ||
    /nestmargin\.com/i.test(body) ||
    /```nestmargin-cta/.test(body)
  );
}

// Parses a simple "key: value" block (used in product-card fences).
export function parseKeyValueBlock(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (key) result[key] = value;
  }
  return result;
}
