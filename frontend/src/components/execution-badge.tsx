import { cn } from "@/lib/utils";
import type { TacheStatut } from "@/types";
import { TACHE_STATUT_LABELS } from "@/types";

interface ExecutionBadgeProps {
  value: number | string;
  className?: string;
}

export function ExecutionBadge({ value, className }: ExecutionBadgeProps) {
  const pct = typeof value === "string" ? parseFloat(value) : value;
  const color =
    pct >= 100
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : pct >= 50
        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
        : "bg-red-50 text-red-700 ring-1 ring-red-200";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        color,
        className,
      )}
    >
      {pct.toFixed(0)}%
    </span>
  );
}

interface TacheStatutBadgeProps {
  statut: TacheStatut;
  className?: string;
}

export function TacheStatutBadge({ statut, className }: TacheStatutBadgeProps) {
  const colors: Record<TacheStatut, string> = {
    en_cours: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    terminee: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    en_retard: "bg-red-50 text-red-700 ring-1 ring-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        colors[statut],
        className,
      )}
    >
      {TACHE_STATUT_LABELS[statut]}
    </span>
  );
}

interface ProgressBarProps {
  value: number | string;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const pct = Math.min(
    100,
    Math.max(0, typeof value === "string" ? parseFloat(value) : value),
  );

  const barColor =
    pct >= 100
      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
      : pct >= 50
        ? "bg-gradient-to-r from-amber-500 to-amber-400"
        : "bg-gradient-to-r from-red-500 to-red-400";

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate">{label}</span>
          <span className="font-bold tabular-nums text-graphite">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-cloud/80">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-[var(--ease-out-expo)]",
            barColor,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
