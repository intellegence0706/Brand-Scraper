"use client";

import { glass } from "./styles";

export default function Card({ title, children }: { title: string; children: React.ReactNode }) {
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
