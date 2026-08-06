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
      ? "border-bioluminescent-teal/40 bg-bioluminescent-teal/15 text-bioluminescent-teal"
      : pct >= 50
        ? "border-bubblegum/40 bg-bubblegum/10 text-bubblegum"
        : "border-red-400/30 bg-red-500/10 text-red-300";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
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
    en_cours: "border-cosmic-blue/40 bg-cosmic-blue/15 text-ice-blue",
    terminee: "border-bioluminescent-teal/40 bg-bioluminescent-teal/15 text-bioluminescent-teal",
    en_retard: "border-red-400/30 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
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
          <span className="text-silver-mist">{label}</span>
          <span className="font-medium text-canvas-white">{pct.toFixed(0)} %</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-cloud">
        <div
          className="h-full rounded-full bg-bioluminescent-teal transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
