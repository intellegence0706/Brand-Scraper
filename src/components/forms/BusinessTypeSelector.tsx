"use client";

import { glassLight } from "@/components/ui/styles";
import type { BusinessType } from "@/types/brand";

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



interface BusinessTypeSelectorProps {
  selected: BusinessType;
  onChange: (value: BusinessType) => void;
  disabled: boolean;
}

export default function BusinessTypeSelector({ selected, onChange, disabled }: BusinessTypeSelectorProps) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 20, justifyContent: "center" }}>
      {businessTypes.map((bt) => {
        const isSelected = selected === bt.value;
        return (
          <button
            key={bt.value}
            type="button"
            onClick={() => onChange(bt.value)}
            disabled={disabled}
            aria-pressed={isSelected}
            style={{
              flex: 1, maxWidth: 160, padding: "14px 12px", borderRadius: 16,
              ...glassLight,
              borderColor: isSelected ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)",
              background: isSelected ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.04)",
              boxShadow: isSelected ? "0 0 0 2px rgba(139,92,246,0.2)" : "none",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.4 : 1,
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
  );
}
