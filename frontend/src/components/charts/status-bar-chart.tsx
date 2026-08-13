"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_TOOLTIP_STYLE } from "@/lib/chart-colors";
import type { StatusSlice } from "@/components/charts/status-donut-chart";

interface StatusBarChartProps {
  data: StatusSlice[];
  height?: number;
}

export function StatusBarChart({ data, height = 260 }: StatusBarChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

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
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, left: -8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6a6a6a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#9a9a9a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            {...CHART_TOOLTIP_STYLE}
            cursor={{ fill: "rgba(13, 79, 56, 0.04)" }}
            formatter={(value, name) => {
              const n = Number(value ?? 0);
              const pct = total > 0 ? Math.round((n / total) * 100) : 0;
              return [`${n} (${pct} %)`, String(name)];
            }}
          />
          <Bar dataKey="value" name="Volume" radius={[6, 6, 0, 0]} barSize={42} maxBarSize={56}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
