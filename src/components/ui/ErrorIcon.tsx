"use client";

export default function ErrorIcon() {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 20, margin: "0 auto",
      background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
  );
}
