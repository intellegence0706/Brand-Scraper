import type { BusinessType } from "@/api/jobs";

const SPIDER_API_URL = "https://api.spider.cloud/scrape";
const TIMEOUT_MS = 25_000;
const MAX_RETRIES = 2;
const MAX_SUBPAGES = 4;

interface SpiderMetadata {
  title?: string;
  description?: string;
  og_image?: string;
  domain?: string;
  final_url?: string;
  [key: string]: unknown;
}

interface SpiderResponse {
  content: string;
  url: string;
  status: number;
  error: string | null;
  metadata?: SpiderMetadata;
}

export interface ScrapeResult {
  html: string;
  finalUrl: string;
  metadata: SpiderMetadata | null;
  externalCss: string;
}

export interface MultiPageScrapeResult {
  primary: ScrapeResult;
  subpages: ScrapeResult[];
  mergedHtml: string;
  mergedCss: string;
}

// Subpages worth crawling per business type
const SUBPAGE_PATTERNS: Record<BusinessType, RegExp[]> = {
  products: [
    /\/products?\b/i, /\/shop\b/i, /\/collections?\b/i, /\/catalog\b/i, /\/store\b/i,
  ],
  saas: [
    /\/pricing\b/i, /\/features?\b/i, /\/about\b/i, /\/product\b/i,
  ],
  services: [
    /\/about\b/i, /\/services?\b/i, /\/contact\b/i, /\/team\b/i, /\/work\b/i, /\/portfolio\b/i,
  ],
};

// Generic patterns that are useful for any type
const GENERIC_PATTERNS = [/\/about\b/i, /\/contact\b/i];

/** Scrape a single URL (unchanged core logic) */
export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const apiKey = process.env.SPIDER_API_KEY;
  if (!apiKey) throw new Error("SPIDER_API_KEY is not configured");

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(SPIDER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url,
          limit: 1,
          return_format: "raw",
          request: "smart",
          block_stylesheets: false,
          block_ads: true,
          block_analytics: true,
          filter_output_main_only: false,
          metadata: true,
          readability: false,
          cache: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Spider API error ${res.status}: ${text}`);
      }

      const data: SpiderResponse[] = await res.json();
      if (!data.length || !data[0].content) {
        throw new Error("Spider returned empty content");
      }

      if (data[0].error) {
        throw new Error(`Spider page error: ${data[0].error}`);
      }

      const html = data[0].content;
      const finalUrl = data[0].url || url;
      const metadata = data[0].metadata || null;

      const externalCss = await fetchExternalCss(html, finalUrl);

      return { html, finalUrl, metadata, externalCss };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("Scraping failed after retries");
}

/** Scrape the main page, discover internal links, then scrape relevant subpages */
export async function scrapeMultiplePages(
  url: string,
  businessType: BusinessType,
): Promise<MultiPageScrapeResult> {
  // 1. Scrape the primary page
  const primary = await scrapeUrl(url);

  // 2. Discover internal links from the homepage HTML
  const baseOrigin = new URL(primary.finalUrl).origin;
  const internalLinks = extractInternalLinks(primary.html, primary.finalUrl, baseOrigin);

  // 3. Pick the most relevant subpages for this business type
  const targetUrls = pickSubpages(internalLinks, businessType, baseOrigin);

  // 4. Scrape subpages in parallel (best-effort, don't fail the whole job)
  const subpages: ScrapeResult[] = [];
  if (targetUrls.length > 0) {
    const results = await Promise.allSettled(
      targetUrls.map((subUrl) => scrapeUrl(subUrl)),
    );
    for (const r of results) {
      if (r.status === "fulfilled") subpages.push(r.value);
    }
  }

  // 5. Merge HTML and CSS for extraction
  const allHtml = [primary.html, ...subpages.map((s) => s.html)];
  const allCss = [primary.externalCss, ...subpages.map((s) => s.externalCss)];

  return {
    primary,
    subpages,
    mergedHtml: allHtml.join("\n<!-- PAGE_BREAK -->\n"),
    mergedCss: deduplicateCss(allCss),
  };
}

/** Extract same-origin links from HTML */
function extractInternalLinks(html: string, pageUrl: string, origin: string): string[] {
  const linkRe = /<a[^>]+href=["']([^"'#]+)["'][^>]*>/gi;
  const seen = new Set<string>();
  const links: string[] = [];
  let m;

  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1].trim();
    if (!href || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;

    let absolute: string;
    try {
      absolute = new URL(href, pageUrl).href;
    } catch {
      continue;
    }

    // Same origin only
    if (!absolute.startsWith(origin)) continue;

    // Strip query/hash for dedup
    const clean = absolute.split("?")[0].split("#")[0];
    if (seen.has(clean) || clean === pageUrl.split("?")[0].split("#")[0]) continue;

    // Skip assets, feeds, auth pages
    if (/\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|xml|rss|json|css|js)$/i.test(clean)) continue;
    if (/\/(login|signin|signup|register|auth|logout|admin|wp-admin|feed)\b/i.test(clean)) continue;

    seen.add(clean);
    links.push(clean);
  }

  return links;
}

/** Pick the best subpages to scrape based on business type */
function pickSubpages(links: string[], businessType: BusinessType, origin: string): string[] {
  const patterns = [...SUBPAGE_PATTERNS[businessType], ...GENERIC_PATTERNS];
  const scored: { url: string; score: number }[] = [];

  for (const link of links) {
    const path = link.slice(origin.length);
    let score = 0;

    for (const pattern of patterns) {
      if (pattern.test(path)) {
        score += 10;
        break;
      }
    }

    // Prefer shorter paths (top-level pages over deep nested ones)
    const depth = path.split("/").filter(Boolean).length;
    if (depth === 1) score += 5;
    else if (depth === 2) score += 2;

    if (score > 0) scored.push({ url: link, score });
  }

  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score);

  // Deduplicate by pattern — don't scrape /about and /about-us
  const selected: string[] = [];
  const matchedPatterns = new Set<string>();

  for (const { url } of scored) {
    if (selected.length >= MAX_SUBPAGES) break;
    const path = url.slice(origin.length);
    const matchedPattern = patterns.find((p) => p.test(path))?.source ?? path;
    if (matchedPatterns.has(matchedPattern)) continue;
    matchedPatterns.add(matchedPattern);
    selected.push(url);
  }

  return selected;
}

/** Merge CSS arrays, removing exact duplicates */
function deduplicateCss(cssArray: string[]): string {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const css of cssArray) {
    if (!css) continue;
    // Use first 200 chars as a fingerprint to avoid comparing huge strings
    const fingerprint = css.slice(0, 200);
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    unique.push(css);
  }
  return unique.join("\n");
}

async function fetchExternalCss(html: string, baseUrl: string): Promise<string> {
  // Find all <link rel="stylesheet" href="..."> in the HTML
  const cssLinkRe = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi;
  const cssLinkRe2 = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["'][^>]*>/gi;

  const cssUrls = new Set<string>();
  let m;
  while ((m = cssLinkRe.exec(html)) !== null) cssUrls.add(m[1]);
  while ((m = cssLinkRe2.exec(html)) !== null) cssUrls.add(m[1]);

  if (cssUrls.size === 0) return "";

  const results: string[] = [];

  const urls = [...cssUrls].slice(0, 5);
  await Promise.allSettled(
    urls.map(async (cssHref) => {
      try {
        const cssUrl = new URL(cssHref, baseUrl).href;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(cssUrl, {
          signal: controller.signal,
          headers: { "Accept": "text/css,*/*" },
        });
        clearTimeout(timer);
        if (res.ok) {
          const text = await res.text();
          // Cap at 500KB per file to avoid memory issues
          results.push(text.slice(0, 500_000));
        }
      } catch {
        // Ignore failed CSS fetches — best effort
      }
    })
  );

  return results.join("\n");
}
