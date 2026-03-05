"use client";

import type { FontInfo } from "@/types/brand";

export default function FontList({ fonts }: { fonts: FontInfo[] }) {
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
