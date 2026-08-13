"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { CHART_TOOLTIP_STYLE } from "@/lib/chart-colors";
import {
  formatMontantGnf,
  formatMontantGnfCompact,
  type FinanceTitreStat,
} from "@/lib/finances";
import { cn } from "@/lib/utils";

export const FINANCE_TITRE_COLORS = [
  "#0d4f38",
  "#009460",
  "#2db88a",
  "#7bc4a8",
  "#a8d5c4",
  "#d4e5dc",
] as const;

interface FinancePieChartProps {
  titres: FinanceTitreStat[];
  height?: number;
  className?: string;
}

export function FinancePieChart({
  titres,
  height = 280,
  className,
}: FinancePieChartProps) {
  const slices = titres
    .map((t, i) => ({
      name: t.short,
      fullName: t.titre,
      value: t.prevu,
      color: FINANCE_TITRE_COLORS[i % FINANCE_TITRE_COLORS.length],
    }))
    .filter((s) => s.value > 0);

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate"
        style={{ height }}
      >
        Aucune répartition à afficher
      </div>
    );
  }

  const withPct = slices.map((s) => ({
    ...s,
    pct: (s.value / total) * 100,
  }));

  return (
    <div className={cn("grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,auto)] sm:items-center", className)}>
      <div className="relative min-h-[200px]" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={withPct}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={96}
              paddingAngle={1.5}
              dataKey="value"
              nameKey="name"
              stroke="#fff"
              strokeWidth={1}
              label={({ percent }) =>
                percent != null && percent >= 0.06
                  ? `${(percent * 100).toFixed(1)} %`
                  : ""
              }
              labelLine={false}
            >
              {withPct.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              {...CHART_TOOLTIP_STYLE}
              formatter={(value, name) => {
                const n = Number(value ?? 0);
                const pct = total > 0 ? (n / total) * 100 : 0;
                return [
                  `${formatMontantGnf(n)} GNF (${pct.toLocaleString("fr-FR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })} %)`,
                  String(name),
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-2">
        {withPct.map((item) => (
          <li key={item.name} className="flex items-start justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-slate">
              <span
                className="mt-0.5 size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate" title={item.fullName}>
                {item.name}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-semibold tabular-nums text-graphite">
                {item.pct.toLocaleString("fr-FR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                %
              </span>
              <span className="block text-[11px] tabular-nums text-ash">
                {formatMontantGnfCompact(item.value)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
