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
      ? "bg-veil text-forest-ink"
      : pct >= 50
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800";

  return (
    <span
      className={cn(
        "inline-flex rounded-card px-2.5 py-0.5 text-xs font-medium",
        color,
        className,
      )}
    >
      {pct.toFixed(0)} %
    </span>
  );
}

interface TacheStatutBadgeProps {
  statut: TacheStatut;
  className?: string;
}

export function TacheStatutBadge({ statut, className }: TacheStatutBadgeProps) {
  const colors: Record<TacheStatut, string> = {
    en_cours: "bg-blue-100 text-blue-800",
    terminee: "bg-veil text-forest-ink",
    en_retard: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-card px-2.5 py-0.5 text-xs font-medium",
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

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-slate">{label}</span>
          <span className="font-medium text-graphite">{pct.toFixed(0)} %</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-cloud">
        <div
          className="h-full rounded-full bg-forest-ink transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
