"use client";

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
}

export default function LoadingSpinner({ size = 44, label }: LoadingSpinnerProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 0" }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.06)", borderTopColor: "#a78bfa",
        animation: "spinLoader 0.75s linear infinite",
      }} />
      {label && <p style={{ color: "rgba(156,163,175,0.8)", marginTop: 20, fontSize: "0.9rem" }}>{label}</p>}
    </div>
  );
}
