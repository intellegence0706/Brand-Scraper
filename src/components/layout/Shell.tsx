"use client";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
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
