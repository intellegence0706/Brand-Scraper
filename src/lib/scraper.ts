const SPIDER_API_URL = "https://api.spider.cloud/scrape";
const TIMEOUT_MS = 25_000;
const MAX_RETRIES = 2;

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

      // Fetch external CSS files referenced in the HTML
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

  // Fetch up to 5 CSS files with a short timeout
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
