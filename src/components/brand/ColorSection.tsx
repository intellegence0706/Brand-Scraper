"use client";

import Card from "@/components/ui/Card";
import Swatches from "@/components/ui/Swatches";
import Empty from "@/components/ui/Empty";

interface ColorSectionProps {
  title: string;
  colors: string[];
  emptyLabel: string;
}

export default function ColorSection({ title, colors, emptyLabel }: ColorSectionProps) {
  return (
    <div style={{ animation: "slideIn 0.4s ease-out" }}>
      <Card title={title}>
        {colors.length ? <Swatches colors={colors} /> : <Empty>{emptyLabel}</Empty>}
      </Card>
    </div>
  );
}
