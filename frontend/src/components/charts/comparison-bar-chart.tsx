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

import { CHART_TOOLTIP_STYLE, parseProgress } from "@/lib/chart-colors";

interface ComparisonBarChartProps {
  financier: number | string;
  physique: number | string;
  height?: number;
}

export function ComparisonBarChart({
  financier,
  physique,
  height = 220,
}: ComparisonBarChartProps) {
  const data = [
    {
      name: "Financier",
      value: parseProgress(financier),
      fill: "#009460",
    },
    {
      name: "Physique",
      value: parseProgress(physique),
      fill: "#0d4f38",
    },
  ];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#ebebeb"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6a6a6a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#9a9a9a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            {...CHART_TOOLTIP_STYLE}
            formatter={(value) => [
              `${Number(value ?? 0).toFixed(0)} %`,
              "Exécution",
            ]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
