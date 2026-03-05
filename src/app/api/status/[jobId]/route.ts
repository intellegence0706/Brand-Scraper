import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/api/jobs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const job = getJob(params.jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    url: job.url,
    businessType: job.businessType,
    status: job.status,
    result: job.result,
    partialResult: job.partialResult,
    pagesScraped: job.pagesScraped,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });
}
