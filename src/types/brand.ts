export interface FontInfo {
  family: string;
  weights: string[];
}

export interface BrandResult {
  logoUrl: string | null;
  primaryColors: string[];
  secondaryColors: string[];
  accentColors: string[];
  backgroundColors: string[];
  fonts: FontInfo[];
}

export type JobStatus = "pending" | "scraping" | "extracting" | "done" | "failed";
export type BusinessType = "products" | "saas" | "services";

export interface JobData {
  id: string;
  url: string;
  businessType: string;
  status: JobStatus;
  result: BrandResult | null;
  partialResult: Partial<BrandResult> | null;
  pagesScraped: number;
  error: string | null;
}
