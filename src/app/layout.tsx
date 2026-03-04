import type { Metadata } from "next";
import "./globals.css";
import AnimatedBackground from "./AnimatedBackground";

export const metadata: Metadata = {
  title: "Brand Scraper",
  description: "Extract brand assets from any URL",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnimatedBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
