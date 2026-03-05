"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import BusinessTypeSelector from "./BusinessTypeSelector";
import { glassLight } from "@/components/ui/styles";
import type { BusinessType } from "@/types/brand";

export default function ScrapeForm() {
  const [url, setUrl] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("saas");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), businessType }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return; }
      router.push(`/review/${data.jobId}`);
    } catch {
      setError("Failed to connect. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <BusinessTypeSelector selected={businessType} onChange={setBusinessType} disabled={loading} />

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12 }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          aria-label="Website URL"
          disabled={loading}
          style={{
            flex: 1, padding: "16px 20px", borderRadius: 16,
            ...glassLight, color: "#fff", fontSize: "1rem", outline: "none",
            transition: "border-color 0.3s, box-shadow 0.3s",
            opacity: loading ? 0.4 : 1,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(139,92,246,0.5)";
            e.target.style.boxShadow = "0 0 0 4px rgba(139,92,246,0.12)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.08)";
            e.target.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          style={{
            padding: "16px 32px", borderRadius: 16, border: "none",
            color: "#fff", fontWeight: 600, fontSize: "1rem",
            cursor: loading || !url.trim() ? "not-allowed" : "pointer",
            opacity: loading || !url.trim() ? 0.3 : 1,
            background: "linear-gradient(135deg, #7c3aed, #6d28d9, #3b82f6)",
            boxShadow: "0 4px 24px rgba(139,92,246,0.35)",
            transition: "transform 0.15s, box-shadow 0.2s, opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!loading && url.trim()) {
              (e.target as HTMLElement).style.transform = "translateY(-1px)";
              (e.target as HTMLElement).style.boxShadow = "0 6px 32px rgba(139,92,246,0.45)";
            }
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.transform = "translateY(0)";
            (e.target as HTMLElement).style.boxShadow = "0 4px 24px rgba(139,92,246,0.35)";
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                display: "inline-block", width: 16, height: 16,
                border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                borderRadius: "50%", animation: "spinLoader 0.7s linear infinite",
              }} />
              Starting…
            </span>
          ) : "Scrape"}
        </button>
      </form>

      {error && (
        <div role="alert" style={{
          marginTop: 20, padding: "14px 20px", borderRadius: 16,
          background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)",
          color: "#f87171", fontSize: "0.9rem",
        }}>{error}</div>
      )}
    </>
  );
}
