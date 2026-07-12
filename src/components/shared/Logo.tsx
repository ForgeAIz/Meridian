// ─── Logo ───────────────────────────────────────────────────────────────────
// Reusable Meridian logo component.
// Variations: mark only, lockup (mark + wordmark), with link or standalone.

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "mark" | "lockup";
  color?: "brass" | "ink";
  href?: string;
}

const sizes = {
  sm: { mark: 20, lockup: 20 },
  md: { mark: 28, lockup: 28 },
  lg: { mark: 36, lockup: 36 },
};

function Mark({ size, color }: { size: number; color: string }) {
  const strokeColor = color === "brass" ? "#A9813C" : "#14181C";
  const strokeWidth = Math.max(1, size / 20);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      {/* Meridian arc — open curve like a longitude line */}
      <path
        d="M 8 4 C 20 4, 28 10, 28 16 C 28 22, 20 28, 8 28"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Measurement line — crosses the arc at its midpoint */}
      <line
        x1="8"
        y1="16"
        x2="22"
        y2="16"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoMark({ size = "md", color = "brass", href }: LogoProps) {
  const dimension = sizes.md.mark;

  const svg = <Mark size={dimension} color={color} />;

  if (href) {
    return <Link href={href}>{svg}</Link>;
  }
  return svg;
}

export function LogoLockup({ size = "md", color = "brass", href }: LogoProps) {
  const dimension = sizes[size].lockup;
  const textSize = size === "sm" ? 14 : size === "lg" ? 22 : 18;

  const content = (
    <div className="flex items-center gap-2.5">
      <Mark size={dimension} color={color} />
      <span
        className="font-display tracking-tight"
        style={{
          fontSize: textSize,
          color: color === "brass" ? "#A9813C" : "#14181C",
        }}
      >
        Meridian
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default LogoLockup;
