import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ProgressBar({ value, color = "var(--primary)", className, marker }: { value: number; color?: string | undefined; className?: string | undefined; marker?: number | undefined }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${v}%`, backgroundColor: color }} />
      {marker !== undefined && <div className="absolute inset-y-0 w-0.5 bg-foreground/25" style={{ left: `${marker}%` }} />}
    </div>
  );
}

export function RingProgress({ value, color, size = 52, stroke = 5, children }: { value: number; color: string; size?: number | undefined; stroke?: number | undefined; children?: ReactNode | undefined }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} className="transition-[stroke-dashoffset] duration-700 ease-out" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </div>
  );
}
