"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { CHART_TOOLTIP_STYLE } from "@/lib/chart-colors";

export interface StatusSlice {
  name: string;
  value: number;
  color: string;
}

interface StatusDonutChartProps {
  data: StatusSlice[];
  centerLabel?: string;
  centerValue?: string | number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function StatusDonutChart({
  data,
  centerLabel,
  centerValue,
  height = 220,
  innerRadius = 62,
  outerRadius = 88,
}: StatusDonutChartProps) {
  const filtered = data.filter((d) => d.value > 0);
  const total = filtered.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate"
        style={{ height }}
      >
        Aucune donnée sur la période
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            stroke="#fff"
            strokeWidth={2}
            label={({ percent }) =>
              percent != null && percent >= 0.08
                ? `${(percent * 100).toFixed(0)} %`
                : ""
            }
            labelLine={false}
          >
            {filtered.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            {...CHART_TOOLTIP_STYLE}
            formatter={(value, name) => {
              const n = Number(value ?? 0);
              return [`${n} (${total > 0 ? ((n / total) * 100).toFixed(0) : 0} %)`, name];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue != null) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue != null && (
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-graphite">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="mt-0.5 text-xs font-medium text-slate">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface StatusLegendProps {
  items: StatusSlice[];
  className?: string;
}

export function StatusLegend({ items, className }: StatusLegendProps) {
  const visible = items.filter((i) => i.value > 0);
  const total = items.reduce((sum, i) => sum + i.value, 0);
  if (visible.length === 0) return null;

  return (
    <ul className={className}>
      {visible.map((item) => {
        const pct = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <li
            key={item.name}
            className="flex items-center justify-between gap-3 py-1.5 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 text-slate">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="font-semibold tabular-nums text-graphite">
                {item.value}
              </span>
              <span className="ml-2 text-xs tabular-nums text-ash">
                {pct.toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })}{" "}
                %
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
