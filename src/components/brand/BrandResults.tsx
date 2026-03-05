"use client";

import type { BrandResult } from "@/types/brand";
import LogoPreview from "./LogoPreview";
import ColorSection from "./ColorSection";
import FontSection from "./FontSection";

interface BrandResultsProps {
  result: Partial<BrandResult>;
  isPartial: boolean;
}

export default function BrandResults({ result, isPartial }: BrandResultsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {result.logoUrl !== undefined && <LogoPreview logoUrl={result.logoUrl} />}

      {result.primaryColors !== undefined && (
        <ColorSection title="Primary Colors" colors={result.primaryColors} emptyLabel="No primary colors detected" />
      )}
      {result.secondaryColors !== undefined && (
        <ColorSection title="Secondary Colors" colors={result.secondaryColors} emptyLabel="No secondary colors detected" />
      )}
      {result.accentColors !== undefined && (
        <ColorSection title="Accent Colors" colors={result.accentColors} emptyLabel="No accent colors detected" />
      )}
      {result.backgroundColors !== undefined && (
        <ColorSection title="Background Colors" colors={result.backgroundColors} emptyLabel="No background colors detected" />
      )}

      {result.fonts !== undefined && <FontSection fonts={result.fonts} />}

      {isPartial && (
        <div style={{ textAlign: "center", padding: "8px 0", color: "rgba(156,163,175,0.6)", fontSize: "0.8rem" }}>
          <span style={{
            display: "inline-block", width: 12, height: 12,
            border: "2px solid rgba(139,92,246,0.2)", borderTopColor: "#a78bfa",
            borderRadius: "50%", animation: "spinLoader 0.75s linear infinite",
            marginRight: 8, verticalAlign: "middle",
          }} />
          Extracting more assets…
        </div>
      )}
    </div>
  );
}
