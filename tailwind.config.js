/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#030014",
      },
      animation: {
        "mesh-rotate": "mesh-rotate 40s linear infinite",
        "blob-1": "blob-morph-1 18s ease-in-out infinite",
        "blob-2": "blob-morph-2 22s ease-in-out 3s infinite",
        "blob-3": "blob-morph-3 16s ease-in-out 6s infinite",
        "blob-4": "blob-morph-1 24s ease-in-out 9s infinite reverse",
        "beam-1": "beam-sweep 8s ease-in-out infinite",
        "beam-2": "beam-sweep 11s ease-in-out 3s infinite",
        "beam-3": "beam-sweep 14s ease-in-out 7s infinite",
        "grid-pulse": "grid-pulse 4s ease-in-out infinite",
        "twinkle": "twinkle 5s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "shimmer": "shimmer 2.5s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        "mesh-rotate": {
          to: { transform: "rotate(360deg)" },
        },
        "blob-morph-1": {
          "0%, 100%": { transform: "translate(0,0) scale(1) rotate(0deg)", borderRadius: "40% 60% 60% 40% / 60% 30% 70% 40%" },
          "25%": { transform: "translate(50px,-30px) scale(1.1) rotate(90deg)", borderRadius: "60% 40% 30% 70% / 40% 60% 40% 60%" },
          "50%": { transform: "translate(-20px,40px) scale(0.95) rotate(180deg)", borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "75%": { transform: "translate(30px,20px) scale(1.05) rotate(270deg)", borderRadius: "50% 40% 50% 60% / 35% 55% 45% 65%" },
        },
        "blob-morph-2": {
          "0%, 100%": { transform: "translate(0,0) scale(1) rotate(0deg)", borderRadius: "50% 50% 40% 60% / 40% 60% 50% 50%" },
          "33%": { transform: "translate(-40px,-50px) scale(1.08) rotate(120deg)", borderRadius: "40% 60% 60% 40% / 60% 40% 60% 40%" },
          "66%": { transform: "translate(35px,25px) scale(0.92) rotate(240deg)", borderRadius: "60% 40% 40% 60% / 50% 50% 50% 50%" },
        },
        "blob-morph-3": {
          "0%, 100%": { transform: "translate(0,0) scale(1) rotate(0deg)", borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%" },
          "50%": { transform: "translate(40px,-35px) scale(1.12) rotate(180deg)", borderRadius: "40% 60% 50% 50% / 60% 40% 60% 40%" },
        },
        "beam-sweep": {
          "0%": { opacity: "0", transform: "translateX(-100%) scaleY(0.5) rotate(-3deg)" },
          "20%": { opacity: "0.15" },
          "50%": { opacity: "0.25", transform: "translateX(20%) scaleY(1.2) rotate(1deg)" },
          "80%": { opacity: "0.1" },
          "100%": { opacity: "0", transform: "translateX(100%) scaleY(0.5) rotate(3deg)" },
        },
        "grid-pulse": {
          "0%, 100%": { opacity: "0.03" },
          "50%": { opacity: "0.07" },
        },
        "twinkle": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "pulse-ring": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(139,92,246,0.4)" },
          "50%": { boxShadow: "0 0 0 10px transparent" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
