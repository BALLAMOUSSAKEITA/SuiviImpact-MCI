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
import {
  formatMontantGnf,
  formatMontantGnfCompact,
  type FinanceTitreStat,
} from "@/lib/finances";

interface FinanceAmountsChartProps {
  titres: FinanceTitreStat[];
  height?: number;
}

export function FinanceAmountsChart({
  titres,
  height = 280,
}: FinanceAmountsChartProps) {
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
    prevu: t.prevu,
    engage: t.engage,
    paye: t.paye,
  }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6a6a6a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9a9a9a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatMontantGnfCompact(Number(v))}
            width={56}
          />
          <Tooltip
            {...CHART_TOOLTIP_STYLE}
            formatter={(value, name) => [
              `${formatMontantGnf(Number(value ?? 0))} GNF`,
              String(name),
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#6a6a6a" }}
            iconType="circle"
          />
          <Bar dataKey="prevu" name="Prévus / LFI" fill="#d4e5dc" radius={[4, 4, 0, 0]} />
          <Bar dataKey="engage" name="Engagés" fill="#2db88a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="paye" name="Payés" fill="#0d4f38" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
