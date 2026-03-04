import { BrandResult, FontInfo } from "@/api/jobs";
import type { ScrapeResult } from "./scraper";

// ── Logo extraction ──────────────────────────────────────────────

function extractLogo(html: string, baseUrl: string, ogImageFromMeta?: string): string | null {
  const candidates: { url: string; score: number }[] = [];

  if (ogImageFromMeta) {
    candidates.push({ url: ogImageFromMeta, score: 12 });
  }

  const ogPatterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  ];
  for (const re of ogPatterns) {
    const m = html.match(re);
    if (m && m[1]) { candidates.push({ url: m[1], score: 10 }); break; }
  }

  const linkIconRe = /<link[^>]+rel=["']([^"']*(icon|apple-touch-icon)[^"']*)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let linkMatch;
  while ((linkMatch = linkIconRe.exec(html)) !== null) {
    const rel = linkMatch[1].toLowerCase();
    const href = linkMatch[3];
    let score = 3;
    if (rel.includes("apple-touch-icon")) score = 6;
    const sizeMatch = linkMatch[0].match(/sizes=["'](\d+)x(\d+)["']/i);
    if (sizeMatch && parseInt(sizeMatch[1]) >= 128) score += 2;
    candidates.push({ url: href, score });
  }
  const linkIconRe2 = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']([^"']*(icon|apple-touch-icon)[^"']*)["'][^>]*>/gi;
  while ((linkMatch = linkIconRe2.exec(html)) !== null) {
    const href = linkMatch[1];
    const rel = linkMatch[2].toLowerCase();
    let score = 3;
    if (rel.includes("apple-touch-icon")) score = 6;
    const sizeMatch = linkMatch[0].match(/sizes=["'](\d+)x(\d+)["']/i);
    if (sizeMatch && parseInt(sizeMatch[1]) >= 128) score += 2;
    candidates.push({ url: href, score });
  }

  const imgRegex = /<img[^>]*>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const tag = imgMatch[0];
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    const src = srcMatch[1];
    if (src.startsWith("data:") && src.length < 100) continue;
    const tagLower = tag.toLowerCase();
    let score = 0;
    if (/logo/i.test(tagLower)) score += 8;
    if (/brand/i.test(tagLower)) score += 5;
    if (/site[-_]?icon/i.test(tagLower)) score += 4;
    if (/header/i.test(tagLower)) score += 2;
    if (/\.svg/i.test(src)) score += 3;
    const altMatch = tag.match(/alt=["']([^"']+)["']/i);
    if (altMatch && /logo/i.test(altMatch[1])) score += 6;
    const classMatch = tag.match(/class=["']([^"']+)["']/i);
    if (classMatch && /logo/i.test(classMatch[1])) score += 5;
    const idMatch = tag.match(/id=["']([^"']+)["']/i);
    if (idMatch && /logo/i.test(idMatch[1])) score += 5;
    if (score > 0) candidates.push({ url: src, score });
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0].url;
  if (best.startsWith("data:") || best.startsWith("http")) return best;
  try { return new URL(best, baseUrl).href; } catch { return best; }
}

// ── Color utilities ──────────────────────────────────────────────

const HEX_RE = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
const RGB_RE = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*[,/]\s*[\d.]+%?)?\s*\)/g;
const HSL_RE = /hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%(?:\s*[,/]\s*[\d.]+%?)?\s*\)/g;
const RGB_MODERN_RE = /rgba?\(\s*(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})(?:\s*\/\s*[\d.]+%?)?\s*\)/g;

function normalizeToHex(color: string): string | null {
  if (!color.startsWith("#")) return null;
  const hex = color.slice(1);
  if (hex.length === 3) return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
  if (hex.length === 4) return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
  if (hex.length === 6) return `#${hex}`.toLowerCase();
  if (hex.length === 8) return `#${hex.slice(0, 6)}`.toLowerCase();
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, "0")).join("")}`;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)));
  };
  return rgbToHex(f(0), f(8), f(4));
}

function getBrightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function getSaturation(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return 0;
  const l = (max + min) / 2;
  return (max - min) / (l > 0.5 ? (2 - max - min) : (max + min));
}

function isNearBlackOrWhite(hex: string): boolean {
  const b = getBrightness(hex);
  return b < 15 || b > 245;
}

interface ColorEntry { hex: string; count: number; context: string }

function collectColors(css: string, context: string, entries: ColorEntry[]) {
  let match;
  HEX_RE.lastIndex = 0; RGB_RE.lastIndex = 0;
  RGB_MODERN_RE.lastIndex = 0; HSL_RE.lastIndex = 0;

  while ((match = HEX_RE.exec(css)) !== null) {
    const hex = normalizeToHex(match[0]);
    if (hex) entries.push({ hex, count: 1, context });
  }
  while ((match = RGB_RE.exec(css)) !== null) {
    entries.push({ hex: rgbToHex(+match[1], +match[2], +match[3]), count: 1, context });
  }
  while ((match = RGB_MODERN_RE.exec(css)) !== null) {
    entries.push({ hex: rgbToHex(+match[1], +match[2], +match[3]), count: 1, context });
  }
  while ((match = HSL_RE.exec(css)) !== null) {
    entries.push({ hex: hslToHex(+match[1], +match[2], +match[3]), count: 1, context });
  }
}

// ── Color extraction with categories ─────────────────────────────

interface ColorCategories {
  primary: string[];
  secondary: string[];
  accent: string[];
  background: string[];
}

function extractColors(html: string, externalCss: string): ColorCategories {
  const entries: ColorEntry[] = [];

  // Inline CSS from HTML
  let m;
  const styleTagRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  while ((m = styleTagRe.exec(html)) !== null) collectColors(m[1], "style", entries);
  const inlineRe = /style=["']([^"']+)["']/gi;
  while ((m = inlineRe.exec(html)) !== null) collectColors(m[1], "inline", entries);

  // CSS custom properties from HTML
  const cssVarRe = /--[\w-]+\s*:\s*([^;}"]+)/gi;
  while ((m = cssVarRe.exec(html)) !== null) collectColors(m[1], "cssvar", entries);

  // External CSS
  if (externalCss) {
    collectColors(externalCss, "external", entries);

    // Brand-named CSS vars get extra weight
    const brandVarRe = /--([\w-]*(?:brand|primary|accent|main|theme|color)[\w-]*)\s*:\s*([^;}"]+)/gi;
    while ((m = brandVarRe.exec(externalCss)) !== null) {
      const varName = m[1].toLowerCase();
      const hex = normalizeToHex(m[2].trim());
      if (hex) {
        const ctx = varName.includes("accent") ? "accent-var"
          : varName.includes("background") || varName.includes("bg") ? "bg-var"
          : "brand-var";
        entries.push({ hex, count: 10, context: ctx });
      }
    }
  }

  // meta theme-color
  const themeColorRe = /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i;
  const themeMatch = html.match(themeColorRe);
  if (themeMatch) {
    const hex = normalizeToHex(themeMatch[1]);
    if (hex) entries.push({ hex, count: 20, context: "theme-color" });
  }

  // Background-context colors from CSS
  const bgRe = /background(?:-color)?\s*:\s*([^;}"]+)/gi;
  const allCss = externalCss + "\n" + extractInlineCss(html);
  while ((m = bgRe.exec(allCss)) !== null) {
    const val = m[1].trim();
    const hex = normalizeToHex(val.split(/\s/)[0]);
    if (hex) entries.push({ hex, count: 2, context: "background" });
  }

  // Aggregate by hex
  const colorMap = new Map<string, { count: number; contexts: Set<string> }>();
  for (const e of entries) {
    const existing = colorMap.get(e.hex);
    if (existing) {
      existing.count += e.count;
      existing.contexts.add(e.context);
    } else {
      colorMap.set(e.hex, { count: e.count, contexts: new Set([e.context]) });
    }
  }

  // Categorize
  const backgrounds: string[] = [];
  const accents: string[] = [];
  const primaries: string[] = [];
  const secondaries: string[] = [];
  const seen = new Set<string>();

  const sorted = [...colorMap.entries()].sort((a, b) => b[1].count - a[1].count);

  for (const [hex, info] of sorted) {
    if (seen.has(hex)) continue;
    const brightness = getBrightness(hex);
    const saturation = getSaturation(hex);

    // Background colors: very dark or very light
    if (brightness < 20 || brightness > 235) {
      if (backgrounds.length < 3) { backgrounds.push(hex); seen.add(hex); }
      continue;
    }

    // Accent: from accent-named vars, or high saturation + low frequency
    if (info.contexts.has("accent-var")) {
      if (accents.length < 3) { accents.push(hex); seen.add(hex); continue; }
    }

    // Background from context
    if (info.contexts.has("background") || info.contexts.has("bg-var")) {
      if (saturation < 0.15 && backgrounds.length < 3) {
        backgrounds.push(hex); seen.add(hex); continue;
      }
    }
  }

  // Remaining chromatic colors → primary then secondary
  for (const [hex, info] of sorted) {
    if (seen.has(hex)) continue;
    const brightness = getBrightness(hex);
    const saturation = getSaturation(hex);
    if (brightness < 20 || brightness > 235) continue;
    if (saturation < 0.1) continue; // skip grays

    if (saturation > 0.6 && info.count <= 3 && accents.length < 3) {
      accents.push(hex); seen.add(hex);
    } else if (primaries.length < 4) {
      primaries.push(hex); seen.add(hex);
    } else if (secondaries.length < 4) {
      secondaries.push(hex); seen.add(hex);
    }
  }

  return {
    primary: primaries,
    secondary: secondaries,
    accent: accents,
    background: backgrounds,
  };
}

function extractInlineCss(html: string): string {
  const parts: string[] = [];
  let m;
  const styleTagRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  while ((m = styleTagRe.exec(html)) !== null) parts.push(m[1]);
  const inlineRe = /style=["']([^"']+)["']/gi;
  while ((m = inlineRe.exec(html)) !== null) parts.push(m[1]);
  return parts.join("\n");
}

// ── Font extraction with weights ─────────────────────────────────

function extractFonts(html: string, externalCss: string): FontInfo[] {
  const fontData = new Map<string, Set<string>>();
  const allCss = extractInlineCss(html) + "\n" + externalCss;

  // font-family declarations — track which fonts are used
  let m;
  const ffRe = /font-family\s*:\s*([^;}"]+)/gi;
  while ((m = ffRe.exec(allCss)) !== null) {
    const families = m[1].split(",").map((f) => f.trim().replace(/^["']|["']$/g, "").trim());
    for (const f of families) {
      if (f && !isGenericFont(f)) {
        if (!fontData.has(f)) fontData.set(f, new Set());
      }
    }
  }

  // @font-face — extract family + weight
  const fontFaceBlockRe = /@font-face\s*\{([^}]+)\}/gi;
  while ((m = fontFaceBlockRe.exec(allCss)) !== null) {
    const block = m[1];
    const familyMatch = block.match(/font-family\s*:\s*["']?([^"';}\n]+)["']?/i);
    if (!familyMatch) continue;
    const family = familyMatch[1].trim().replace(/^["']|["']$/g, "");
    if (!family || isGenericFont(family)) continue;

    if (!fontData.has(family)) fontData.set(family, new Set());
    const weights = fontData.get(family)!;

    const weightMatch = block.match(/font-weight\s*:\s*([^;}"]+)/i);
    if (weightMatch) {
      const val = weightMatch[1].trim();
      // Handle ranges like "100 900" or single values
      if (/^\d+\s+\d+$/.test(val)) {
        const [lo, hi] = val.split(/\s+/).map(Number);
        for (const w of [100, 200, 300, 400, 500, 600, 700, 800, 900]) {
          if (w >= lo && w <= hi) weights.add(String(w));
        }
      } else {
        weights.add(normalizeWeight(val));
      }
    } else {
      weights.add("400"); // default
    }
  }

  // Google Fonts links — parse weights from URL
  const gfRe = /fonts\.googleapis\.com\/css2?\?family=([^"'&\s]+)/gi;
  while ((m = gfRe.exec(html)) !== null) {
    const decoded = decodeURIComponent(m[1]);
    const families = decoded.split("|");
    for (const f of families) {
      const [nameRaw, params] = f.split(":");
      const name = nameRaw.replace(/\+/g, " ").trim();
      if (!name || isGenericFont(name)) continue;
      if (!fontData.has(name)) fontData.set(name, new Set());
      const weights = fontData.get(name)!;

      if (params) {
        // Parse "wght@400;700" or "ital,wght@0,400;0,700;1,400"
        const wghtMatch = params.match(/(?:wght@|@)([\d;,]+)/);
        if (wghtMatch) {
          const vals = wghtMatch[1].split(";");
          for (const v of vals) {
            const parts = v.split(",");
            const w = parts[parts.length - 1];
            if (/^\d+$/.test(w)) weights.add(w);
          }
        }
      }
      if (weights.size === 0) weights.add("400");
    }
  }

  // Sort by number of weights (more weights = more important font)
  const sorted = [...fontData.entries()]
    .sort((a, b) => b[1].size - a[1].size);

  return sorted.slice(0, 10).map(([family, weights]) => ({
    family,
    weights: [...weights].sort((a, b) => Number(a) - Number(b)),
  }));
}

function normalizeWeight(val: string): string {
  const map: Record<string, string> = {
    thin: "100", hairline: "100", extralight: "200", ultralight: "200",
    light: "300", normal: "400", regular: "400", medium: "500",
    semibold: "600", demibold: "600", bold: "700", extrabold: "800",
    ultrabold: "800", black: "900", heavy: "900",
  };
  const num = parseInt(val);
  if (!isNaN(num)) return String(num);
  return map[val.toLowerCase().replace(/[-_\s]/g, "")] || "400";
}

const GENERIC_FONTS = new Set([
  "serif", "sans-serif", "monospace", "cursive", "fantasy",
  "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded",
  "inherit", "initial", "unset", "revert", "none",
  "-apple-system", "blinkmacsystemfont", "segoe ui", "helvetica",
  "arial", "sans", "times", "times new roman", "courier", "courier new",
]);

function isGenericFont(name: string): boolean {
  return GENERIC_FONTS.has(name.toLowerCase());
}

// ── Exported extraction functions ────────────────────────────────

export function extractLogoOnly(html: string, baseUrl: string, ogImage?: string): string | null {
  return extractLogo(html, baseUrl, ogImage);
}

export function extractColorsOnly(html: string, externalCss: string): {
  primaryColors: string[]; secondaryColors: string[]; accentColors: string[]; backgroundColors: string[];
} {
  const c = extractColors(html, externalCss);
  return { primaryColors: c.primary, secondaryColors: c.secondary, accentColors: c.accent, backgroundColors: c.background };
}

export function extractFontsOnly(html: string, externalCss: string): FontInfo[] {
  return extractFonts(html, externalCss);
}

export function extractBrandAssets(scrapeResult: ScrapeResult): BrandResult {
  const { html, finalUrl, metadata, externalCss } = scrapeResult;
  const logoUrl = extractLogo(html, finalUrl, metadata?.og_image ?? undefined);
  const colors = extractColors(html, externalCss);
  const fonts = extractFonts(html, externalCss);

  return {
    logoUrl,
    primaryColors: colors.primary,
    secondaryColors: colors.secondary,
    accentColors: colors.accent,
    backgroundColors: colors.background,
    fonts,
  };
}
