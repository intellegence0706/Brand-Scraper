"use client";

export default function Empty({ children }: { children: React.ReactNode }) {
  return <p style={{ color: "#4b5563", fontSize: "0.85rem", fontStyle: "italic" }}>{children}</p>;
}
