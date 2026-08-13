"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_TOOLTIP_STYLE } from "@/lib/chart-colors";
import { type FinanceTitreStat } from "@/lib/finances";

interface FinanceRatesChartProps {
  titres: FinanceTitreStat[];
  height?: number;
}

export function FinanceRatesChart({
  titres,
  height = 260,
}: FinanceRatesChartProps) {
  if (titres.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-slate"
        style={{ height }}
      >
        Aucune ligne budgétaire
      </div>
    );
  }

  const data = titres.map((t) => ({
    name: t.short,
    engagement: Number(t.tauxEngagement.toFixed(2)),
    caisse: Number(t.tauxCaisse.toFixed(2)),
  }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6a6a6a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, "auto"]}
            tick={{ fill: "#9a9a9a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <Tooltip
            {...CHART_TOOLTIP_STYLE}
            formatter={(value, name) => [
              `${Number(value ?? 0).toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} %`,
              String(name),
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#6a6a6a" }}
            iconType="circle"
          />
          <Bar
            dataKey="engagement"
            name="Base engagement"
            fill="#2db88a"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="caisse"
            name="Base caisse"
            fill="#0d4f38"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
