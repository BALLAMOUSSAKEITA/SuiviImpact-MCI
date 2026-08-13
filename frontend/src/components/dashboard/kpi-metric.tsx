import { ChevronRight } from "lucide-react";

import {
  StatusStackBar,
  type StackSegment,
} from "@/components/charts/status-stack-bar";
import { parseProgress } from "@/lib/chart-colors";
import { cn } from "@/lib/utils";

export interface MetricItem {
  label: string;
  value: number | string;
  hint?: string;
  emphasize?: boolean;
}

interface MetricStripProps {
  metrics: MetricItem[];
  className?: string;
}
export function MetricStrip({ metrics, className }: MetricStripProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-none border border-hairline border-t-[3px] border-t-[#0d4f38] bg-white",
        className,
      )}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-cloud">
        {metrics.map((metric, i) => (
          <div
            key={metric.label}
            className={cn(
              "px-6 py-5",
              i > 0 && "border-t border-cloud sm:border-t-0",
              i % 2 === 1 && "sm:border-l sm:border-cloud lg:border-l-0",
              i >= 2 && "lg:border-t-0",
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">{metric.label}</p>
            <p
              className={cn(
                "mt-1 font-display text-[1.625rem] font-semibold tabular-nums leading-none",
                metric.emphasize ? "text-[#ce1126]" : "text-forest-ink",
              )}
            >
              {metric.value}
            </p>
            {metric.hint && (
              <p className="mt-1.5 text-xs text-slate">{metric.hint}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ModuleOverviewProps {
  modules: {
    id: string;
    title: string;
    total: number;
    progression: number | string;
    segments: StackSegment[];
  }[];
  onSelect: (id: string) => void;
  className?: string;
}

/** Tableau de synthèse par module — dense, lisible, sans fioritures. */
export function ModuleOverview({
  modules,
  onSelect,
  className,
}: ModuleOverviewProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-none border border-hairline border-t-[3px] border-t-[#0d4f38] bg-white",
        className,
      )}
    >
      <div className="hidden border-b border-cloud bg-[#f6faf7] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate md:grid md:grid-cols-[minmax(0,1.4fr)_4.5rem_4.5rem_minmax(0,1fr)_1.25rem] md:gap-4">
        <span>Module</span>
        <span className="text-right">Total</span>
        <span className="text-right">Exec.</span>
        <span>Répartition</span>
        <span aria-hidden />
      </div>

      <ul className="divide-y divide-cloud">
        {modules.map((mod) => {
          const pct = parseProgress(mod.progression);
          return (
            <li key={mod.id}>
              <button
                type="button"
                onClick={() => onSelect(mod.id)}
                className="group grid w-full gap-3 px-6 py-4 text-left transition-colors hover:bg-[#f6faf7] md:grid-cols-[minmax(0,1.4fr)_4.5rem_4.5rem_minmax(0,1fr)_1.25rem] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-graphite">{mod.title}</p>
                  <div className="mt-2 md:hidden">
                    <StatusStackBar segments={mod.segments} height={5} />
                  </div>
                </div>
                <p className="text-sm tabular-nums text-graphite md:text-right">
                  <span className="mr-2 text-xs text-slate md:hidden">Total</span>
                  {mod.total}
                </p>
                <p className="text-sm font-medium tabular-nums text-graphite md:text-right">
                  <span className="mr-2 text-xs font-normal text-slate md:hidden">
                    Exec.
                  </span>
                  {pct.toFixed(0)}&nbsp;%
                </p>
                <div className="hidden md:block">
                  <StatusStackBar segments={mod.segments} height={5} />
                </div>
                <ChevronRight
                  className="hidden size-4 text-slate transition-colors group-hover:text-graphite md:block"
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface ExecutionGaugeProps {
  value: number | string;
  label: string;
  className?: string;
}

/** Indicateur d'exécution typographique — sans anneau décoratif. */
export function ExecutionGauge({ value, label, className }: ExecutionGaugeProps) {
  const pct = parseProgress(value);

  return (
    <div className={cn("flex h-full flex-col justify-center", className)}>
      <p className="text-xs font-medium text-slate">{label}</p>
      <div className="mt-2 flex items-baseline gap-0.5">
        <span className="font-display text-[2.75rem] font-semibold tabular-nums leading-none text-forest-ink">
          {pct.toFixed(0)}
        </span>
        <span className="text-lg font-medium text-slate">%</span>
      </div>
      <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-cloud">
        <div
          className="h-full rounded-full bg-forest-ink transition-[width] duration-500 ease-[var(--ease-out-expo)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface StatusBreakdownProps {
  segments: StackSegment[];
  className?: string;
}

/** Grille de compteurs par statut — alternative sobre au donut. */
export function StatusBreakdown({ segments, className }: StatusBreakdownProps) {
  const visible = segments.filter((s) => s.value > 0);
  if (visible.length === 0) {
    return (
      <p className={cn("text-sm text-slate", className)}>
        Aucune donnée sur la période sélectionnée.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-[var(--radius-sm)] border border-cloud bg-cloud sm:grid-cols-2",
        className,
      )}
    >
      {visible.map((seg) => (
        <div key={seg.name} className="bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-slate">{seg.name}</span>
          </div>
          <p className="mt-1 text-lg font-semibold tabular-nums text-graphite">
            {seg.value}
          </p>
        </div>
      ))}
    </div>
  );
}

interface DashboardSurfaceProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardSurface({ children, className }: DashboardSurfaceProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}
