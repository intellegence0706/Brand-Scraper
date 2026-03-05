"use client";

export default function AnimatedBackground() {
  return (
    <>
      <style>{`
        @keyframes bg-rotate {
          to { transform: rotate(360deg); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%; }
          25% { transform: translate(50px, -30px) scale(1.1); border-radius: 60% 40% 30% 70% / 40% 60% 40% 60%; }
          50% { transform: translate(-20px, 40px) scale(0.95); border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          75% { transform: translate(30px, 20px) scale(1.05); border-radius: 50% 40% 50% 60% / 35% 55% 45% 65%; }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); border-radius: 50% 50% 40% 60% / 40% 60% 50% 50%; }
          33% { transform: translate(-40px, -50px) scale(1.08); border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%; }
          66% { transform: translate(35px, 25px) scale(0.92); border-radius: 60% 40% 40% 60% / 50% 50% 50% 50%; }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%; }
          50% { transform: translate(40px, -35px) scale(1.12); border-radius: 40% 60% 50% 50% / 60% 40% 60% 40%; }
        }
        @keyframes beam-sweep {
          0% { opacity: 0; transform: translateX(-120%) rotate(-2deg); }
          30% { opacity: 0.2; }
          50% { opacity: 0.35; transform: translateX(0%) rotate(0deg); }
          70% { opacity: 0.15; }
          100% { opacity: 0; transform: translateX(120%) rotate(2deg); }
        }
        @keyframes grid-fade {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.1; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes nebula-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 0, overflow: "hidden",
          background: "#0a0a2e",
        }}
      >
        {/* Rotating conic nebula */}
        <div style={{
          position: "absolute",
          width: "220%", height: "220%", top: "-60%", left: "-60%",
          background: `conic-gradient(
            from 200deg at 50% 50%,
            #0a0a2e 0deg, #2d1b69 40deg, #0f0f3d 80deg,
            #1a3a6e 120deg, #0a0a2e 160deg, #3b1f7a 200deg,
            #0f0f3d 240deg, #1a4a7a 280deg, #0a0a2e 320deg, #2a1060 360deg
          )`,
          animation: "bg-rotate 40s linear infinite",
        }} />

        {/* Vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 55% 45% at 50% 40%, transparent 0%, #0a0a2e 85%),
            radial-gradient(ellipse 100% 90% at 50% 50%, transparent 30%, #0a0a2e 100%)
          `,
        }} />

        {/* Nebula glow overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 50% at 30% 30%, rgba(99,102,241,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 70% 70%, rgba(139,92,246,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 35% at 50% 50%, rgba(59,130,246,0.1) 0%, transparent 60%)
          `,
          animation: "nebula-pulse 8s ease-in-out infinite",
        }} />

        {/* Morphing blobs — brighter */}
        <div style={{
          position: "absolute", width: 600, height: 600, top: "-5%", left: "2%",
          background: "radial-gradient(circle, rgba(139,92,246,0.65), rgba(124,58,237,0.25), transparent 70%)",
          filter: "blur(100px)", pointerEvents: "none",
          animation: "float-1 18s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, bottom: "2%", right: "-3%",
          background: "radial-gradient(circle, rgba(59,130,246,0.6), rgba(6,182,212,0.2), transparent 70%)",
          filter: "blur(90px)", pointerEvents: "none",
          animation: "float-2 22s ease-in-out 3s infinite",
        }} />
        <div style={{
          position: "absolute", width: 450, height: 450, top: "35%", left: "38%",
          background: "radial-gradient(circle, rgba(192,132,252,0.5), rgba(236,72,153,0.15), transparent 70%)",
          filter: "blur(95px)", pointerEvents: "none",
          animation: "float-3 16s ease-in-out 6s infinite",
        }} />
        <div style={{
          position: "absolute", width: 380, height: 380, top: "15%", right: "8%",
          background: "radial-gradient(circle, rgba(99,102,241,0.55), rgba(139,92,246,0.2), transparent 70%)",
          filter: "blur(80px)", pointerEvents: "none",
          animation: "float-1 24s ease-in-out 9s infinite reverse",
        }} />
        <div style={{
          position: "absolute", width: 320, height: 320, bottom: "25%", left: "12%",
          background: "radial-gradient(circle, rgba(52,211,153,0.35), rgba(16,185,129,0.12), transparent 70%)",
          filter: "blur(75px)", pointerEvents: "none",
          animation: "float-2 20s ease-in-out 4s infinite reverse",
        }} />
        <div style={{
          position: "absolute", width: 350, height: 350, top: "60%", right: "25%",
          background: "radial-gradient(circle, rgba(244,114,182,0.3), rgba(236,72,153,0.1), transparent 70%)",
          filter: "blur(85px)", pointerEvents: "none",
          animation: "float-3 26s ease-in-out 2s infinite",
        }} />

        {/* Light beams — brighter */}
        <div style={{
          position: "absolute", top: "8%", left: "-40%", width: "180%", height: "25%",
          background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.25), rgba(99,102,241,0.35), rgba(59,130,246,0.2), transparent)",
          filter: "blur(40px)", borderRadius: "50%", pointerEvents: "none",
          mixBlendMode: "screen",
          animation: "beam-sweep 9s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", top: "45%", left: "-40%", width: "180%", height: "20%",
          background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), rgba(6,182,212,0.25), rgba(139,92,246,0.15), transparent)",
          filter: "blur(45px)", borderRadius: "50%", pointerEvents: "none",
          mixBlendMode: "screen",
          animation: "beam-sweep 12s ease-in-out 4s infinite",
        }} />
        <div style={{
          position: "absolute", top: "72%", left: "-40%", width: "180%", height: "22%",
          background: "linear-gradient(90deg, transparent, rgba(192,132,252,0.15), rgba(236,72,153,0.2), rgba(139,92,246,0.12), transparent)",
          filter: "blur(50px)", borderRadius: "50%", pointerEvents: "none",
          mixBlendMode: "screen",
          animation: "beam-sweep 15s ease-in-out 8s infinite",
        }} />

        {/* Neural grid — more visible */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          animation: "grid-fade 4s ease-in-out infinite",
        }} />

        {/* Star particles — brighter and more */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          animation: "twinkle 5s ease-in-out infinite",
          backgroundImage: [
            "radial-gradient(1.5px 1.5px at 8% 15%, rgba(255,255,255,0.9) 0%, transparent 100%)",
            "radial-gradient(1.2px 1.2px at 22% 72%, rgba(139,92,246,0.95) 0%, transparent 100%)",
            "radial-gradient(1.2px 1.2px at 38% 8%, rgba(255,255,255,0.8) 0%, transparent 100%)",
            "radial-gradient(2px 2px at 52% 85%, rgba(59,130,246,0.9) 0%, transparent 100%)",
            "radial-gradient(1.2px 1.2px at 68% 30%, rgba(255,255,255,0.85) 0%, transparent 100%)",
            "radial-gradient(1.5px 1.5px at 82% 60%, rgba(139,92,246,0.8) 0%, transparent 100%)",
            "radial-gradient(1.2px 1.2px at 15% 88%, rgba(255,255,255,0.7) 0%, transparent 100%)",
            "radial-gradient(2px 2px at 48% 42%, rgba(59,130,246,0.85) 0%, transparent 100%)",
            "radial-gradient(1.2px 1.2px at 90% 12%, rgba(255,255,255,0.85) 0%, transparent 100%)",
            "radial-gradient(1.5px 1.5px at 32% 55%, rgba(192,132,252,0.75) 0%, transparent 100%)",
            "radial-gradient(1.2px 1.2px at 72% 78%, rgba(255,255,255,0.8) 0%, transparent 100%)",
            "radial-gradient(2px 2px at 95% 35%, rgba(59,130,246,0.7) 0%, transparent 100%)",
            "radial-gradient(1.2px 1.2px at 5% 48%, rgba(255,255,255,0.6) 0%, transparent 100%)",
            "radial-gradient(1.2px 1.2px at 58% 92%, rgba(139,92,246,0.75) 0%, transparent 100%)",
            "radial-gradient(1.5px 1.5px at 78% 5%, rgba(255,255,255,0.85) 0%, transparent 100%)",
            "radial-gradient(1.2px 1.2px at 42% 25%, rgba(52,211,153,0.6) 0%, transparent 100%)",
            "radial-gradient(1.2px 1.2px at 60% 50%, rgba(255,255,255,0.55) 0%, transparent 100%)",
            "radial-gradient(2px 2px at 25% 35%, rgba(244,114,182,0.6) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 3% 65%, rgba(255,255,255,0.7) 0%, transparent 100%)",
            "radial-gradient(1.5px 1.5px at 88% 45%, rgba(99,102,241,0.8) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 45% 15%, rgba(255,255,255,0.65) 0%, transparent 100%)",
            "radial-gradient(1.5px 1.5px at 75% 90%, rgba(192,132,252,0.7) 0%, transparent 100%)",
            "radial-gradient(1px 1px at 18% 40%, rgba(52,211,153,0.5) 0%, transparent 100%)",
            "radial-gradient(1.5px 1.5px at 62% 68%, rgba(255,255,255,0.75) 0%, transparent 100%)",
          ].join(","),
        }} />

        {/* Noise grain */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }} />
      </div>
    </>
  );
}
