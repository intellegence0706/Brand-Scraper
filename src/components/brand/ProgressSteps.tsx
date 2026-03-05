"use client";

import { glass } from "@/components/ui/styles";

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

export default function ProgressSteps({ status }: { status: string }) {
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
