import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiMetricProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
  className?: string;
}

export function KpiMetric({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName = "text-forest-ink",
  iconBgClassName = "bg-mint",
  className,
}: KpiMetricProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] border border-cloud/70 bg-white p-4 shadow-[var(--shadow-subtle)] transition-[box-shadow,transform] duration-[var(--duration-normal)] hover:shadow-[var(--shadow-soft)] sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-graphite sm:text-[1.75rem]">
            {value}
          </p>
          {hint && (
            <p className="mt-1 truncate text-xs text-slate">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)]",
            iconBgClassName,
          )}
        >
          <Icon className={cn("size-5", iconClassName)} aria-hidden />
        </div>
      </div>
    </div>
  );
}

interface ModuleTileProps {
  title: string;
  subtitle: string;
  progression: number | string;
  accentBar: string;
  accentText: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ModuleTile({
  title,
  subtitle,
  progression,
  accentBar,
  accentText,
  children,
  onClick,
  className,
}: ModuleTileProps) {
  const pct =
    typeof progression === "string"
      ? parseFloat(progression)
      : progression;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-cloud/70 bg-white p-4 text-left shadow-[var(--shadow-subtle)] transition-all duration-[var(--duration-normal)] hover:-translate-y-0.5 hover:border-cloud hover:shadow-[var(--shadow-soft)] sm:p-5",
        className,
      )}
    >
      <div
        className={cn("absolute inset-x-0 top-0 h-0.5", accentBar)}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={cn("text-sm font-semibold", accentText)}>{title}</h3>
          <p className="mt-0.5 text-xs text-slate">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-veil px-2.5 py-1 text-xs font-semibold tabular-nums text-graphite">
          {Number.isFinite(pct) ? `${pct.toFixed(0)} %` : "—"}
        </span>
      </div>
      <div className="mt-4 flex-1">{children}</div>
      <p className="mt-3 text-xs font-medium text-slate opacity-0 transition-opacity group-hover:opacity-100">
        Voir le détail →
      </p>
    </button>
  );
}
