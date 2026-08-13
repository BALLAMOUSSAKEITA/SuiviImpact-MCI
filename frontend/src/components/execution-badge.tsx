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
      ? "border-[#009460] bg-[#e0f5ea] text-[#0d4f38]"
      : pct >= 50
        ? "border-[#0d4f38] bg-white text-[#0d4f38]"
        : "border-[#ce1126] bg-[#fdecea] text-[#ce1126]";

  return (
    <span
      className={cn(
        "inline-flex border px-2 py-0.5 text-xs font-semibold tabular-nums",
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
    en_cours: "border-[#009460] bg-[#e0f5ea] text-[#0d4f38]",
    terminee: "border-[#0d4f38] bg-[#0d4f38] text-white",
    en_retard: "border-[#ce1126] bg-[#fdecea] text-[#ce1126]",
  };

  return (
    <span
      className={cn(
        "inline-flex border px-2 py-0.5 text-xs font-semibold",
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
    pct >= 100 ? "bg-[#009460]" : pct >= 50 ? "bg-[#0d4f38]" : "bg-[#ce1126]";

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-slate">{label}</span>
          <span className="font-semibold tabular-nums text-[#0d4f38]">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-[3px] w-full overflow-hidden bg-[#d4e5dc]">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-[var(--ease-out-expo)]",
            barColor,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
