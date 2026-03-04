import { BrandResult, FontInfo, BusinessType } from "@/api/jobs";
import type { ScrapeResult } from "./scraper";

// ── Logo extraction ──────────────────────────────────────────────

function extractLogo(html: string, baseUrl: string, businessType: BusinessType, ogImageFromMeta?: string): string | null {
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

    // Business-type-specific logo scoring adjustments
    if (businessType === "products") {
      // E-commerce: boost logos near cart/shop elements
      if (/cart|shop|store|product/i.test(tagLower)) score += 3;
      // Logos in nav/header are strong signals for e-commerce
      if (/nav|header/i.test(tagLower)) score += 2;
    } else if (businessType === "saas") {
      // SaaS sites favor SVG logos heavily
      if (/\.svg/i.test(src)) score += 4;
      // Inline SVG data URIs are common in SaaS
      if (src.startsWith("data:image/svg")) score += 3;
    } else if (businessType === "services") {
      // Services sites often use text-based logos or wordmarks
      // Boost images with "wordmark" or "text" in attributes
      if (/wordmark|text[-_]?logo|logotype/i.test(tagLower)) score += 5;
      // Header images are the strongest signal for services
      if (/header/i.test(tagLower)) score += 3;
    }

    if (score > 0) candidates.push({ url: src, score });
  }

  // SaaS: also look for inline <svg> elements in the header area that might be logos
  if (businessType === "saas") {
    const headerSvgRe = /<(?:header|nav)[^>]*>[\s\S]{0,2000}?<svg[^>]*>([\s\S]*?)<\/svg>/gi;
    let svgMatch;
    while ((svgMatch = headerSvgRe.exec(html)) !== null) {
      // Found an SVG in header/nav — encode as data URI candidate
      const svgContent = svgMatch[0].match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
      if (svgContent) {
        const encoded = `data:image/svg+xml,${encodeURIComponent(svgContent[0])}`;
        candidates.push({ url: encoded, score: 9 });
      }
    }
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

function extractColors(html: string, externalCss: string, businessType: BusinessType): ColorCategories {
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

  // Business-type-specific color context boosting
  if (businessType === "products") {
    // E-commerce: boost colors from CTA/buy buttons and price elements
    const ctaRe = /(?:add[-_]?to[-_]?cart|buy[-_]?now|checkout|price|sale|discount)[^}]*?(?:background(?:-color)?|color)\s*:\s*([^;}"]+)/gi;
    while ((m = ctaRe.exec(allCss)) !== null) {
      const hex = normalizeToHex(m[1].trim().split(/\s/)[0]);
      if (hex) entries.push({ hex, count: 15, context: "product-cta" });
    }
    // Boost colors from elements with shopping-related classes
    const shopClassRe = /\.(?:cart|product|price|sale|badge|btn[-_]?buy)[^{]*\{([^}]+)\}/gi;
    while ((m = shopClassRe.exec(allCss)) !== null) {
      collectColors(m[1], "product-cta", entries);
    }
  } else if (businessType === "saas") {
    // SaaS: boost CTA/signup button colors and gradient endpoints
    const saasCtaRe = /(?:sign[-_]?up|get[-_]?started|free[-_]?trial|cta|hero)[^}]*?(?:background(?:-color)?|color)\s*:\s*([^;}"]+)/gi;
    while ((m = saasCtaRe.exec(allCss)) !== null) {
      const hex = normalizeToHex(m[1].trim().split(/\s/)[0]);
      if (hex) entries.push({ hex, count: 15, context: "saas-cta" });
    }
    // Extract gradient endpoints as accent colors
    const gradientRe = /linear-gradient\s*\([^)]*?(#[0-9a-fA-F]{3,8})[^)]*?(#[0-9a-fA-F]{3,8})/gi;
    while ((m = gradientRe.exec(allCss)) !== null) {
      const hex1 = normalizeToHex(m[1]);
      const hex2 = normalizeToHex(m[2]);
      if (hex1) entries.push({ hex: hex1, count: 8, context: "gradient-endpoint" });
      if (hex2) entries.push({ hex: hex2, count: 8, context: "gradient-endpoint" });
    }
  } else if (businessType === "services") {
    // Services: boost colors from nav, footer, and contact sections
    const servicesRe = /(?:nav|footer|contact|about)[^}]*?(?:background(?:-color)?|color)\s*:\s*([^;}"]+)/gi;
    while ((m = servicesRe.exec(allCss)) !== null) {
      const hex = normalizeToHex(m[1].trim().split(/\s/)[0]);
      if (hex) entries.push({ hex, count: 12, context: "services-structural" });
    }
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

  // Category limits vary by business type
  const limits = businessType === "products"
    ? { primary: 5, secondary: 5, accent: 4, background: 4 }
    : businessType === "services"
    ? { primary: 3, secondary: 3, accent: 2, background: 3 }
    : { primary: 4, secondary: 4, accent: 3, background: 3 }; // saas

  // Saturation threshold for "gray" — services sites use more muted tones
  const grayThreshold = businessType === "services" ? 0.08 : 0.1;

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
      if (backgrounds.length < limits.background) { backgrounds.push(hex); seen.add(hex); }
      continue;
    }

    // Accent: from accent-named vars or gradient endpoints (SaaS)
    if (info.contexts.has("accent-var") || (businessType === "saas" && info.contexts.has("gradient-endpoint"))) {
      if (accents.length < limits.accent) { accents.push(hex); seen.add(hex); continue; }
    }

    // Products: CTA colors are strong primary signals
    if (businessType === "products" && info.contexts.has("product-cta")) {
      if (primaries.length < limits.primary) { primaries.push(hex); seen.add(hex); continue; }
    }

    // SaaS: CTA colors are strong primary signals
    if (businessType === "saas" && info.contexts.has("saas-cta")) {
      if (primaries.length < limits.primary) { primaries.push(hex); seen.add(hex); continue; }
    }

    // Services: structural colors are primary signals
    if (businessType === "services" && info.contexts.has("services-structural")) {
      if (primaries.length < limits.primary) { primaries.push(hex); seen.add(hex); continue; }
    }

    // Background from context
    if (info.contexts.has("background") || info.contexts.has("bg-var")) {
      if (saturation < 0.15 && backgrounds.length < limits.background) {
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
    if (saturation < grayThreshold) continue;

    if (saturation > 0.6 && info.count <= 3 && accents.length < limits.accent) {
      accents.push(hex); seen.add(hex);
    } else if (primaries.length < limits.primary) {
      primaries.push(hex); seen.add(hex);
    } else if (secondaries.length < limits.secondary) {
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

function extractFonts(html: string, externalCss: string, businessType: BusinessType): FontInfo[] {
  const fontData = new Map<string, Set<string>>();
  // Track where each font appears for business-type-aware ranking
  const fontContexts = new Map<string, Set<string>>();
  const allCss = extractInlineCss(html) + "\n" + externalCss;

  // font-family declarations — track which fonts are used and where
  let m;
  const ffRe = /font-family\s*:\s*([^;}"]+)/gi;
  while ((m = ffRe.exec(allCss)) !== null) {
    const families = m[1].split(",").map((f) => f.trim().replace(/^["']|["']$/g, "").trim());
    for (const f of families) {
      if (f && !isGenericFont(f)) {
        if (!fontData.has(f)) fontData.set(f, new Set());
        if (!fontContexts.has(f)) fontContexts.set(f, new Set());
      }
    }
  }

  // Detect font contexts from CSS selectors
  const selectorFontRe = /([^{}]+)\{[^}]*font-family\s*:\s*([^;}"]+)/gi;
  while ((m = selectorFontRe.exec(allCss)) !== null) {
    const selector = m[1].toLowerCase();
    const families = m[2].split(",").map((f) => f.trim().replace(/^["']|["']$/g, "").trim());
    for (const f of families) {
      if (!f || isGenericFont(f)) continue;
      if (!fontContexts.has(f)) fontContexts.set(f, new Set());
      const ctx = fontContexts.get(f)!;
      if (/h[1-3]|hero|heading|title|display/i.test(selector)) ctx.add("heading");
      if (/body|paragraph|text|content|article/i.test(selector)) ctx.add("body");
      if (/nav|menu|header/i.test(selector)) ctx.add("nav");
      if (/price|product|item/i.test(selector)) ctx.add("product");
      if (/testimonial|quote|review/i.test(selector)) ctx.add("testimonial");
      if (/footer|contact/i.test(selector)) ctx.add("footer");
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
    if (!fontContexts.has(family)) fontContexts.set(family, new Set());
    const weights = fontData.get(family)!;

    const weightMatch = block.match(/font-weight\s*:\s*([^;}"]+)/i);
    if (weightMatch) {
      const val = weightMatch[1].trim();
      if (/^\d+\s+\d+$/.test(val)) {
        const [lo, hi] = val.split(/\s+/).map(Number);
        for (const w of [100, 200, 300, 400, 500, 600, 700, 800, 900]) {
          if (w >= lo && w <= hi) weights.add(String(w));
        }
      } else {
        weights.add(normalizeWeight(val));
      }
    } else {
      weights.add("400");
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
      if (!fontContexts.has(name)) fontContexts.set(name, new Set());
      const weights = fontData.get(name)!;

      if (params) {
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

  // Score fonts based on business type and context
  const fontScores = new Map<string, number>();
  for (const [family, weights] of fontData.entries()) {
    let score = weights.size; // base: more weights = more important
    const ctx = fontContexts.get(family) ?? new Set();

    if (businessType === "products") {
      // E-commerce: product titles and price fonts are key brand choices
      if (ctx.has("product")) score += 10;
      if (ctx.has("heading")) score += 5;
      if (ctx.has("nav")) score += 3;
    } else if (businessType === "saas") {
      // SaaS: hero heading font is the most intentional brand choice
      if (ctx.has("heading")) score += 10;
      if (ctx.has("body")) score += 4;
      if (ctx.has("nav")) score += 2;
    } else if (businessType === "services") {
      // Services: testimonial and heading fonts capture brand voice
      if (ctx.has("testimonial")) score += 10;
      if (ctx.has("heading")) score += 8;
      if (ctx.has("footer")) score += 3;
      // Serif fonts are more common and intentional in services
      if (isSerifFont(family)) score += 4;
    }
  
    fontScores.set(family, score);
  }

  const sorted = [...fontData.entries()]
    .sort((a, b) => (fontScores.get(b[0]) ?? 0) - (fontScores.get(a[0]) ?? 0));

  return sorted.slice(0, 10).map(([family, weights]) => ({
    family,
    weights: [...weights].sort((a, b) => Number(a) - Number(b)),
  }));
}

function isSerifFont(name: string): boolean {
  const serifIndicators = /georgia|garamond|palatino|times|baskerville|cambria|didot|bodoni|caslon|minion|sabon|charter|merriweather|playfair|lora|libre\s*baskerville|source\s*serif|noto\s*serif|dm\s*serif|cormorant/i;
  return serifIndicators.test(name);
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

export function extractLogoOnly(html: string, baseUrl: string, businessType: BusinessType, ogImage?: string): string | null {
  return extractLogo(html, baseUrl, businessType, ogImage);
}

export function extractColorsOnly(html: string, externalCss: string, businessType: BusinessType): {
  primaryColors: string[]; secondaryColors: string[]; accentColors: string[]; backgroundColors: string[];
} {
  const c = extractColors(html, externalCss, businessType);
  return { primaryColors: c.primary, secondaryColors: c.secondary, accentColors: c.accent, backgroundColors: c.background };
}

export function extractFontsOnly(html: string, externalCss: string, businessType: BusinessType): FontInfo[] {
  return extractFonts(html, externalCss, businessType);
}

export function extractBrandAssets(scrapeResult: ScrapeResult, businessType: BusinessType): BrandResult {
  const { html, finalUrl, metadata, externalCss } = scrapeResult;
  const logoUrl = extractLogo(html, finalUrl, businessType, metadata?.og_image ?? undefined);
  const colors = extractColors(html, externalCss, businessType);
  const fonts = extractFonts(html, externalCss, businessType);

  return {
    logoUrl,
    primaryColors: colors.primary,
    secondaryColors: colors.secondary,
    accentColors: colors.accent,
    backgroundColors: colors.background,
    fonts,
  };
}
