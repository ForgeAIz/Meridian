// ─── HeroChart ──────────────────────────────────────────────────────────────
// Animated line chart for the hero section — draws itself left to right on load.
// Shows a minimalist net worth trend that demonstrates the product instantly.

"use client";

import { useEffect, useState } from "react";

const POINTS = [
  { x: 0, y: 70 },
  { x: 20, y: 65 },
  { x: 40, y: 68 },
  { x: 60, y: 55 },
  { x: 80, y: 48 },
  { x: 100, y: 32 },
];

export default function HeroChart() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1600;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, []);

  const totalLen = POINTS.length - 1;
  const currentLen = progress * totalLen;

  const visible: { x: number; y: number }[] = [];
  for (let i = 0; i < POINTS.length; i++) {
    if (i <= currentLen) {
      visible.push(POINTS[i]);
    } else if (i - 1 < currentLen) {
      const frac = currentLen - (i - 1);
      const prev = POINTS[i - 1];
      const cur = POINTS[i];
      visible.push({
        x: prev.x + (cur.x - prev.x) * frac,
        y: prev.y + (cur.y - prev.y) * frac,
      });
      break;
    }
  }

  const pathD =
    visible.length > 1
      ? "M " + visible.map((p, i) => (i === 0 ? `${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ")
      : "";

  const gridOpacity = Math.min(progress * 2, 0.15);
  const calloutOpacity = progress > 0.85 ? (progress - 0.85) / 0.15 : 0;
  const areaOpacity = progress > 0.3 ? Math.min((progress - 0.3) / 0.4, 0.12) : 0;

  // Data labels at the end
  const last = POINTS[POINTS.length - 1];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg viewBox="0 0 100 80" className="w-full h-auto" aria-label="Net worth trend chart">
        {/* Grid */}
        <g opacity={gridOpacity}>
          {[15, 30, 45, 60].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#5B6570" strokeWidth="0.3" />
          ))}
          {[20, 40, 60, 80].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="80" stroke="#5B6570" strokeWidth="0.3" />
          ))}
        </g>

        {/* Area fill */}
        {pathD && (
          <path
            d={`${pathD} L ${visible[visible.length - 1].x} 80 L 0 80 Z`}
            fill="#A9813C"
            opacity={areaOpacity}
          />
        )}

        {/* Line */}
        {pathD && (
          <path d={pathD} fill="none" stroke="#A9813C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* End dot */}
        {visible.length > 0 && (
          <circle
            cx={visible[visible.length - 1].x}
            cy={visible[visible.length - 1].y}
            r="2.5"
            fill="#A9813C"
            opacity={calloutOpacity}
          />
        )}

        {/* Horizontal meridian reference line */}
        <line
          x1="0" y1={last.y} x2="100" y2={last.y}
          stroke="#A9813C" strokeWidth="0.5" strokeDasharray="2,3"
          opacity={calloutOpacity * 0.6}
        />
      </svg>

      {/* Value callout */}
      <div
        className="absolute right-0 -top-1 font-mono text-xs font-medium transition-opacity duration-300"
        style={{ opacity: calloutOpacity, color: "#A9813C" }}
      >
        £130,500
      </div>

      {/* Month labels */}
      <div
        className="flex justify-between px-0.5 text-[10px] font-mono transition-opacity duration-500"
        style={{ opacity: gridOpacity * 3, color: "#5B6570" }}
      >
        <span>Jan</span>
        <span>Mar</span>
        <span>May</span>
        <span>Jul</span>
        <span>Sep</span>
      </div>
    </div>
  );
}
