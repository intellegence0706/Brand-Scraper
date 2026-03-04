export type JobStatus = "pending" | "scraping" | "extracting" | "done" | "failed";
export type BusinessType = "products" | "saas" | "services";

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

export interface Job {
  id: string;
  url: string;
  businessType: BusinessType;
  status: JobStatus;
  result: BrandResult | null;
  partialResult: Partial<BrandResult> | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

const jobs = new Map<string, Job>();

export function createJob(id: string, url: string, businessType: BusinessType): Job {
  const job: Job = {
    id,
    url,
    businessType,
    status: "pending",
    result: null,
    partialResult: null,
    error: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, patch: Partial<Job>): Job | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  Object.assign(job, patch, { updatedAt: Date.now() });
  return job;
}
