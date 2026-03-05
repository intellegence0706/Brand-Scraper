"use client";

export default function Swatches({ colors }: { colors: string[] }) {
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {colors.map((c) => (
        <div key={c} style={{ textAlign: "center" }}>
          <div
            style={{
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
