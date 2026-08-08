"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_TOOLTIP_STYLE } from "@/lib/chart-colors";

export interface FunnelBarItem {
  name: string;
  value: number;
  color: string;
}

interface FunnelBarChartProps {
  data: FunnelBarItem[];
  height?: number;
}

export function FunnelBarChart({ data, height = 240 }: FunnelBarChartProps) {
  const filtered = data.filter((d) => d.value > 0);
  const max = Math.max(...filtered.map((d) => d.value), 1);

  if (filtered.length === 0) {
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
        <BarChart
          data={filtered}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide domain={[0, max]} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fill: "#6a6a6a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            {...CHART_TOOLTIP_STYLE}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
            {filtered.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
