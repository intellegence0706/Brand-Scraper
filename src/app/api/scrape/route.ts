import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { createJob, updateJob, BusinessType } from "@/api/jobs";
import { scrapeUrl } from "@/lib/scraper";
import { extractLogoOnly, extractColorsOnly, extractFontsOnly } from "@/lib/extractor";

const runningJobs = new Map<string, Promise<void>>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, businessType } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const validTypes: BusinessType[] = ["products", "saas", "services"];
    const bType: BusinessType = validTypes.includes(businessType) ? businessType : "saas";

    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    const jobId = uuid();
    createJob(jobId, normalizedUrl, bType);

    const promise = processJob(jobId, normalizedUrl, bType).finally(() => {
      runningJobs.delete(jobId);
    });
    runningJobs.set(jobId, promise);

    return NextResponse.json({ jobId });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function processJob(jobId: string, url: string, businessType: BusinessType) {
  try {
    updateJob(jobId, { status: "scraping" });

    const scrapeResult = await scrapeUrl(url);
    const { html, finalUrl, metadata, externalCss } = scrapeResult;

    updateJob(jobId, { status: "extracting" });

    // Phase 1: Logo — fast, show immediately
    const logoUrl = extractLogoOnly(html, finalUrl, businessType, metadata?.og_image ?? undefined);
    updateJob(jobId, {
      partialResult: { logoUrl },
    });

    // Phase 2: Colors
    const colors = extractColorsOnly(html, externalCss, businessType);
    updateJob(jobId, {
      partialResult: {
        logoUrl,
        ...colors,
      },
    });

    // Phase 3: Fonts
    const fonts = extractFontsOnly(html, externalCss, businessType);
    const result = {
      logoUrl,
      ...colors,
      fonts,
    };

    updateJob(jobId, { status: "done", result, partialResult: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    updateJob(jobId, { status: "failed", error: message });
  }
}
