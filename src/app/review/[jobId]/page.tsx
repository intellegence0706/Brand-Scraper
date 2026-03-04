"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface FontInfo { family: string; weights: string[] }

interface BrandResult {
  logoUrl: string | null;
  primaryColors: string[];
  secondaryColors: string[];
  accentColors: string[];
  backgroundColors: string[];
  fonts: FontInfo[];
}

interface JobData {
  id: string;
  url: string;
  businessType: string;
  status: "pending" | "scraping" | "extracting" | "done" | "failed";
  result: BrandResult | null;
  partialResult: Partial<BrandResult> | null;
  error: string | null;
}

const glass = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 20,
  transition: "all 0.4s ease",
} as const;

export default function ReviewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<JobData | null>(null);
  const [notFound, setNotFound] = useState(false);

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
          <BackButton router={router} />
        </div>
      </Shell>
    );
  }

  if (!job) return <Shell><LoadingState label="Loading…" /></Shell>;

  const isProcessing = job.status === "pending" || job.status === "scraping" || job.status === "extracting";
  // Use final result if done, otherwise show partial results progressively
  const displayResult = job.result ?? job.partialResult ?? null;

  return (
    <Shell>
      <div style={{ ...glass, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          padding: "4px 10px", borderRadius: 8, fontSize: "0.7rem", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.08em",
          background: "rgba(139,92,246,0.1)", color: "#a78bfa",
          border: "1px solid rgba(139,92,246,0.2)",
        }}>{job.businessType}</span>
        <p style={{ color: "rgba(156,163,175,0.8)", fontSize: "0.85rem", wordBreak: "break-all", fontFamily: "monospace", flex: 1 }}>{job.url}</p>
      </div>

      {isProcessing && <ProgressSteps status={job.status} />}

      {job.status === "failed" && (
        <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
          <ErrorIcon />
          <p style={{ color: "#f87171", marginTop: 16, fontWeight: 600, fontSize: "1.1rem" }}>Scraping failed</p>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: 6, marginBottom: 32 }}>{job.error || "Unknown error"}</p>
          <RetryButton url={job.url} businessType={job.businessType} router={router} />
        </div>
      )}

      {/* Progressive results — show as they arrive */}
      {displayResult && <Results result={displayResult} isPartial={job.status !== "done"} />}

      <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
        <BackButton router={router} />
      </div>
    </Shell>
  );
}

/* ── Shell ─────────────────────────────────────────────────── */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spinLoader { to { transform: rotate(360deg); } }
        @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.4); } 50% { box-shadow: 0 0 0 8px transparent; } }
        @keyframes glowDot { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3.5rem 1.5rem", minHeight: "100vh" }}>
        <div style={{ maxWidth: 700, width: "100%", animation: "fadeInUp 0.6s ease-out forwards" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", animation: "glowDot 3s ease-in-out infinite" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(139,92,246,0.7)" }}>Analysis</span>
            </div>
            <h1 style={{
              fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #fff, #94a3b8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Brand Results</h1>
          </div>
          {children}
        </div>
      </main>
    </>
  );
}

/* ── Progress ──────────────────────────────────────────────── */

function ProgressSteps({ status }: { status: string }) {
  const steps = [
    { key: "pending", label: "Queued", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    )},
    { key: "scraping", label: "Scraping", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    )},
    { key: "extracting", label: "Extracting", icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
      </svg>
    )},
  ];
  const currentIdx = steps.findIndex((s) => s.key === status);

  return (
    <div style={{ ...glass, padding: 28, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {steps.map((step, i) => {
          const isDone = i < currentIdx;
          const isActive = i === currentIdx;
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
                background: isDone ? "rgba(52,211,153,0.1)" : isActive ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
                color: isDone ? "#34d399" : isActive ? "#a78bfa" : "#374151",
                border: `1px solid ${isDone ? "rgba(52,211,153,0.2)" : isActive ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)"}`,
                animation: isActive ? "pulseRing 2s ease-in-out infinite" : "none",
                transition: "all 0.5s",
              }}>
                {isDone ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : step.icon}
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 500, color: isActive ? "#fff" : isDone ? "#9ca3af" : "#374151" }}>
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 1, background: isDone ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.04)", transition: "background 0.5s" }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(156,163,175,0.8)", fontSize: "0.85rem" }}>
        <span style={{
          display: "inline-block", width: 18, height: 18,
          border: "2px solid rgba(139,92,246,0.2)", borderTopColor: "#a78bfa",
          borderRadius: "50%", animation: "spinLoader 0.75s linear infinite",
        }} />
        Processing…
      </div>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 0" }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.06)", borderTopColor: "#a78bfa",
        animation: "spinLoader 0.75s linear infinite",
      }} />
      <p style={{ color: "rgba(156,163,175,0.8)", marginTop: 20, fontSize: "0.9rem" }}>{label}</p>
    </div>
  );
}

/* ── Results (progressive) ─────────────────────────────────── */

function Results({ result, isPartial }: { result: Partial<BrandResult>; isPartial: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Logo — shows first */}
      {result.logoUrl !== undefined && (
        <div style={{ animation: "slideIn 0.4s ease-out" }}>
          <Card title="Logo">
            {result.logoUrl ? (
              <div style={{ display: "inline-block", background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
                <img src={result.logoUrl} alt="Extracted logo" style={{ maxHeight: 80, maxWidth: "100%", objectFit: "contain" }} />
              </div>
            ) : <Empty>No logo detected</Empty>}
          </Card>
        </div>
      )}

      {/* Colors — show when available */}
      {result.primaryColors !== undefined && (
        <div style={{ animation: "slideIn 0.4s ease-out" }}>
          <Card title="Primary Colors">
            {result.primaryColors.length ? <Swatches colors={result.primaryColors} /> : <Empty>No primary colors detected</Empty>}
          </Card>
        </div>
      )}

      {result.secondaryColors !== undefined && (
        <div style={{ animation: "slideIn 0.4s ease-out" }}>
          <Card title="Secondary Colors">
            {result.secondaryColors.length ? <Swatches colors={result.secondaryColors} /> : <Empty>No secondary colors detected</Empty>}
          </Card>
        </div>
      )}

      {result.accentColors !== undefined && (
        <div style={{ animation: "slideIn 0.4s ease-out" }}>
          <Card title="Accent Colors">
            {result.accentColors.length ? <Swatches colors={result.accentColors} /> : <Empty>No accent colors detected</Empty>}
          </Card>
        </div>
      )}

      {result.backgroundColors !== undefined && (
        <div style={{ animation: "slideIn 0.4s ease-out" }}>
          <Card title="Background Colors">
            {result.backgroundColors.length ? <Swatches colors={result.backgroundColors} /> : <Empty>No background colors detected</Empty>}
          </Card>
        </div>
      )}

      {/* Fonts — show last */}
      {result.fonts !== undefined && (
        <div style={{ animation: "slideIn 0.4s ease-out" }}>
          <Card title="Fonts">
            {result.fonts.length ? <FontList fonts={result.fonts} /> : <Empty>No fonts detected</Empty>}
          </Card>
        </div>
      )}

      {isPartial && (
        <div style={{ textAlign: "center", padding: "8px 0", color: "rgba(156,163,175,0.6)", fontSize: "0.8rem" }}>
          <span style={{
            display: "inline-block", width: 12, height: 12,
            border: "2px solid rgba(139,92,246,0.2)", borderTopColor: "#a78bfa",
            borderRadius: "50%", animation: "spinLoader 0.75s linear infinite",
            marginRight: 8, verticalAlign: "middle",
          }} />
          Extracting more assets…
        </div>
      )}
    </div>
  );
}

/* ── UI Components ─────────────────────────────────────────── */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...glass, padding: 24 }}>
      <h2 style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7280", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "rgba(139,92,246,0.6)" }}>●</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Swatches({ colors }: { colors: string[] }) {
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {colors.map((c) => (
        <div key={c} style={{ textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.1)", background: c,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            transition: "transform 0.2s", cursor: "default",
          }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "scale(1.1)"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
          />
          <span style={{ display: "block", marginTop: 8, fontSize: "0.65rem", color: "#6b7280", fontFamily: "monospace" }}>{c}</span>
        </div>
      ))}
    </div>
  );
}

function FontList({ fonts }: { fonts: FontInfo[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {fonts.map((f) => (
        <div key={f.family} style={{
          padding: "12px 16px", borderRadius: 14,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
        }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#e5e7eb" }}>{f.family}</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {f.weights.length > 0 ? f.weights.map((w) => (
              <span key={w} style={{
                padding: "3px 8px", borderRadius: 6, fontSize: "0.7rem",
                background: "rgba(139,92,246,0.08)", color: "#a78bfa",
                border: "1px solid rgba(139,92,246,0.15)", fontFamily: "monospace",
              }}>{w}</span>
            )) : (
              <span style={{ fontSize: "0.7rem", color: "#4b5563", fontStyle: "italic" }}>weights unknown</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p style={{ color: "#4b5563", fontSize: "0.85rem", fontStyle: "italic" }}>{children}</p>;
}

function BackButton({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <button
      onClick={() => router.push("/")}
      style={{
        padding: "12px 24px", borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)", background: "transparent",
        color: "#9ca3af", fontSize: "0.9rem", cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s, color 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.target as HTMLElement;
        el.style.background = "rgba(255,255,255,0.04)";
        el.style.borderColor = "rgba(255,255,255,0.1)";
        el.style.color = "#e5e7eb";
      }}
      onMouseLeave={(e) => {
        const el = e.target as HTMLElement;
        el.style.background = "transparent";
        el.style.borderColor = "rgba(255,255,255,0.06)";
        el.style.color = "#9ca3af";
      }}
    >← Try another URL</button>
  );
}

function RetryButton({ url, businessType, router }: { url: string; businessType: string; router: ReturnType<typeof useRouter> }) {
  const [loading, setLoading] = useState(false);
  async function handleRetry() {
    setLoading(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, businessType }),
      });
      const data = await res.json();
      if (data.jobId) router.push(`/review/${data.jobId}`);
    } catch { setLoading(false); }
  }

  return (
    <button onClick={handleRetry} disabled={loading} style={{
      padding: "14px 32px", borderRadius: 16, border: "none",
      background: "linear-gradient(135deg, #7c3aed, #6d28d9, #3b82f6)",
      color: "#fff", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.3 : 1, boxShadow: "0 4px 24px rgba(139,92,246,0.35)",
    }}>
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-block", width: 16, height: 16,
            border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
            borderRadius: "50%", animation: "spinLoader 0.7s linear infinite",
          }} />
          Retrying…
        </span>
      ) : "Retry"}
    </button>
  );
}

function ErrorIcon() {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 20, margin: "0 auto",
      background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
  );
}
