"use client";

import ScrapeForm from "@/components/forms/ScrapeForm";

export default function Home() {
  return (
    <>
      <style>{`.home-card { animation: fadeInUp 0.7s ease-out forwards; }`}</style>

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

          <ScrapeForm />
        </div>
      </main>
    </>
  );
}
