"use client";

import { useState } from "react";
import Card from "../ui/Card";
import Empty from "../ui/Empty";

export default function LogoPreview({ logoUrl }: { logoUrl: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) {
    return (
      <div style={{ animation: "slideIn 0.4s ease-out" }}>
        <Card title="Logo">
          <Empty>{failed ? "Logo failed to load" : "No logo detected"}</Empty>
          {failed && logoUrl && (
            <a
              href={logoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.75rem", color: "#a78bfa", marginTop: 8, display: "inline-block", wordBreak: "break-all" }}
            >
              Open URL directly →
            </a>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ animation: "slideIn 0.4s ease-out" }}>
      <Card title="Logo">
        {/* Checkerboard background so transparent/white logos are visible */}
        <div style={{
          display: "inline-block", borderRadius: 16, padding: 20,
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          background: `
            #fff
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23e5e7eb'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e5e7eb'/%3E%3C/svg%3E")
          `,
        }}>
          <img
            src={logoUrl}
            alt="Extracted logo"
            onError={() => setFailed(true)}
            style={{
              maxHeight: 120,
              maxWidth: 300,
              minHeight: 32,
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
        <p style={{
          marginTop: 10, fontSize: "0.65rem", color: "#4b5563",
          fontFamily: "monospace", wordBreak: "break-all", maxWidth: 400,
        }}>
          {logoUrl.startsWith("data:") ? `data:image/svg+xml (${Math.round(logoUrl.length / 1024)}KB)` : logoUrl}
        </p>
      </Card>
    </div>
  );
}
