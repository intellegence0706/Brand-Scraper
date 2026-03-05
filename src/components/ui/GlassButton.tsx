"use client";

interface GlassButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "ghost" | "primary";
  disabled?: boolean;
  loading?: boolean;
}

export default function GlassButton({ onClick, children, variant = "ghost", disabled = false, loading = false }: GlassButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === "primary") {
    return (
      <button onClick={onClick} disabled={isDisabled} style={{
        padding: "14px 32px", borderRadius: 16, border: "none",
        background: "linear-gradient(135deg, #7c3aed, #6d28d9, #3b82f6)",
        color: "#fff", fontWeight: 600, cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.3 : 1, boxShadow: "0 4px 24px rgba(139,92,246,0.35)",
      }}>
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              display: "inline-block", width: 16, height: 16,
              border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
              borderRadius: "50%", animation: "spinLoader 0.7s linear infinite",
            }} />
            {children}
          </span>
        ) : children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        padding: "12px 24px", borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)", background: "transparent",
        color: "#9ca3af", fontSize: "0.9rem", cursor: isDisabled ? "not-allowed" : "pointer",
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
    >{children}</button>
  );
}
