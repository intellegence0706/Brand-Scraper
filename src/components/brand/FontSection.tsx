"use client";

import type { FontInfo } from "@/types/brand";
import Card from "../ui/Card";
import FontList from "@/components/ui/FontList";
import Empty from "@/components/ui/Empty";

export default function FontSection({ fonts }: { fonts: FontInfo[] }) {
  return (
    <div style={{ animation: "slideIn 0.4s ease-out" }}>
      <Card title="Fonts">
        {fonts.length ? <FontList fonts={fonts} /> : <Empty>No fonts detected</Empty>}
      </Card>
    </div>
  );
}
