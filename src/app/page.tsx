"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type BusinessType = "products" | "saas" | "services";

const SvgProducts = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const SvgSaas = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
  </svg>
);
const SvgServices = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
  </svg>
);

const businessTypes: { value: BusinessType; label: string; icon: React.FC; desc: string }[] = [
  { value: "products", label: "Products", icon: SvgProducts, desc: "E-commerce & retail" },
  { value: "saas", label: "SaaS", icon: SvgSaas, desc: "Software & platforms" },
  { value: "services", label: "Services", icon: SvgServices, desc: "Agencies & consulting" },
];

export default function Home() {
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

  const glass = {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        @keyframes spinLoader { to { transform: rotate(360deg); } }
        .home-card { animation: fadeInUp 0.7s ease-out forwards; }
      `}</style>

      <main style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", padding: "4rem 1.5rem",
      }}>
        <div className="home-card" style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
          {/* Icon */}
          <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 2rem" }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: 24,
              background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              filter: "blur(20px)", animation: "glowPulse 3s ease-in-out infinite",
            }} />
            <div style={{
              position: "relative", width: 80, height: 80, borderRadius: 24,
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(139,92,246,0.3)",
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>

          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 3.5rem)", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.1,
            background: "linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #93c5fd 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Brand Scraper</h1>

          <p style={{ marginTop: 16, color: "rgba(156,163,175,0.9)", fontSize: "1.1rem", lineHeight: 1.6, maxWidth: 420, margin: "16px auto 0" }}>
            Paste a website URL to extract its brand assets — logo, colors, and fonts.
          </p>

          <div style={{ margin: "1.5rem auto 2rem", height: 1, width: 96, background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)" }} />

          {/* Business Type Selector */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, justifyContent: "center" }}>
            {businessTypes.map((bt) => {
              const isSelected = businessType === bt.value;
              return (
                <button
                  key={bt.value}
                  type="button"
                  onClick={() => setBusinessType(bt.value)}
                  disabled={loading}
                  aria-pressed={isSelected}
                  style={{
                    flex: 1, maxWidth: 160, padding: "14px 12px", borderRadius: 16,
                    ...glass,
                    borderColor: isSelected ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)",
                    background: isSelected ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.04)",
                    boxShadow: isSelected ? "0 0 0 2px rgba(139,92,246,0.2)" : "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.4 : 1,
                    transition: "all 0.2s",
                    color: "#fff", textAlign: "center",
                  }}
                >
                <div style={{ fontSize: "1.3rem", marginBottom: 4, color: isSelected ? "#c4b5fd" : "#9ca3af" }}><bt.icon /></div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: isSelected ? "#c4b5fd" : "#d1d5db" }}>{bt.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: 2 }}>{bt.desc}</div>
                </button>
              );
            })}
          </div>

          
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
                ...glass, color: "#fff", fontSize: "1rem", outline: "none",
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
        </div>
      </main>
    </>
  );
}
