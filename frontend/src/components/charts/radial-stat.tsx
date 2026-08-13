"use client";

import { ProgressionRing } from "@/components/charts/progression-ring";
import { cn } from "@/lib/utils";

interface RadialStatProps {
  value: number | string;
  label: string;
  hint?: string;
  size?: number;
  className?: string;
}

export function RadialStat({
  value,
  label,
  hint,
  size = 168,
  className,
}: RadialStatProps) {
  return (
    <div className={cn("flex h-full flex-col items-center justify-center py-2", className)}>
      <ProgressionRing value={value} size={size} strokeWidth={Math.max(12, Math.round(size / 12))} />
      <p className="mt-4 text-center text-sm font-medium text-graphite">{label}</p>
      {hint && <p className="mt-1 text-center text-xs text-slate">{hint}</p>}
    </div>
  );
}
