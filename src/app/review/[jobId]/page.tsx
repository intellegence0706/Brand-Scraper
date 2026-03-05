"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { JobData } from "@/types/brand";
import { glass } from "@/components/ui/styles";
import Shell from "@/components/layout/Shell";
import ProgressSteps from "@/components/brand/ProgressSteps";
import BrandResults from "@/components/brand/BrandResults";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorIcon from "@/components/ui/ErrorIcon";
import GlassButton from "@/components/ui/GlassButton";

export default function ReviewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<JobData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/status/${jobId}`);
      if (res.status === 404) { setNotFound(true); return; }
      const data: JobData = await res.json();
      setJob(data);
      return data.status;
    } catch { return undefined; }
  }, [jobId]);

  useEffect(() => {
    let active = true;
    async function loop() {
      const status = await poll();
      if (!active) return;
      if (status && status !== "done" && status !== "failed") {
        setTimeout(loop, 800);
      }
    }
    loop();
    return () => { active = false; };
  }, [poll]);

  if (notFound) {
    return (
      <Shell>
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <ErrorIcon />
          <p style={{ color: "#f87171", marginTop: 20, marginBottom: 24, fontSize: "1.1rem" }}>Job not found.</p>
          <GlassButton onClick={() => router.push("/")}>← Try another URL</GlassButton>
        </div>
      </Shell>
    );
  }

  if (!job) return <Shell><LoadingSpinner label="Loading…" /></Shell>;

  const isProcessing = job.status === "pending" || job.status === "scraping" || job.status === "extracting";
  const displayResult = job.result ?? job.partialResult ?? null;

  async function handleRetry() {
    if (!job) return;
    setRetrying(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: job.url, businessType: job.businessType }),
      });
      const data = await res.json();
      if (data.jobId) router.push(`/review/${data.jobId}`);
    } catch { setRetrying(false); }
  }

  return (
    <Shell>
      {/* URL info bar */}
      <div style={{ ...glass, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          padding: "4px 10px", borderRadius: 8, fontSize: "0.7rem", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.08em",
          background: "rgba(139,92,246,0.1)", color: "#a78bfa",
          border: "1px solid rgba(139,92,246,0.2)",
        }}>{job.businessType}</span>
        <p style={{ color: "rgba(156,163,175,0.8)", fontSize: "0.85rem", wordBreak: "break-all", fontFamily: "monospace", flex: 1 }}>{job.url}</p>
        {job.pagesScraped > 0 && (
          <span style={{
            padding: "4px 10px", borderRadius: 8, fontSize: "0.7rem", fontWeight: 600,
            background: "rgba(52,211,153,0.1)", color: "#34d399",
            border: "1px solid rgba(52,211,153,0.2)", whiteSpace: "nowrap",
          }}>{job.pagesScraped} {job.pagesScraped === 1 ? "page" : "pages"}</span>
        )}
      </div>

      {isProcessing && <ProgressSteps status={job.status} />}

      {job.status === "failed" && (
        <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
          <ErrorIcon />
          <p style={{ color: "#f87171", marginTop: 16, fontWeight: 600, fontSize: "1.1rem" }}>Scraping failed</p>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: 6, marginBottom: 32 }}>{job.error || "Unknown error"}</p>
          <GlassButton variant="primary" onClick={handleRetry} loading={retrying} disabled={retrying}>
            {retrying ? "Retrying…" : "Retry"}
          </GlassButton>
        </div>
      )}

      {displayResult && <BrandResults result={displayResult} isPartial={job.status !== "done"} />}

      <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
        <GlassButton onClick={() => router.push("/")}>← Try another URL</GlassButton>
      </div>
    </Shell>
  );
}
