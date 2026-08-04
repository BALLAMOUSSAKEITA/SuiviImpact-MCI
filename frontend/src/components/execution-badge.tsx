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
      ? "bg-soft-mint text-vivid-green"
      : pct >= 50
        ? "bg-amber-50 text-tangerine"
        : "bg-red-50 text-red-700";

  return (
    <span
      className={cn(
        "inline-flex rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium",
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
    en_cours: "bg-sky-soft text-electric-blue",
    terminee: "bg-soft-mint text-vivid-green",
    en_retard: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium",
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
          <span className="text-steel">{label}</span>
          <span className="font-medium text-charcoal">{pct.toFixed(0)} %</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-[var(--radius-pill)] bg-paper-mist">
        <div
          className="h-full rounded-[var(--radius-pill)] bg-electric-blue transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
