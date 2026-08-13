"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { parseProgress } from "@/lib/chart-colors";
import { cn } from "@/lib/utils";

interface ProgressionRingProps {
  value: number | string;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  fillColor?: string;
  className?: string;
  label?: string;
}

export function ProgressionRing({
  value,
  size = 72,
  strokeWidth = 6,
  trackColor = "#d4e5dc",
  fillColor = "#009460",
  className,
  label,
}: ProgressionRingProps) {
  const pct = parseProgress(value);
  const data = [
    { name: "progress", value: pct },
    { name: "rest", value: 100 - pct },
  ];

  const inner = size / 2 - strokeWidth;
  const outer = size / 2;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={inner}
            outerRadius={outer}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={fillColor} />
            <Cell fill={trackColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold tabular-nums text-graphite">
          {pct.toFixed(0)}%
        </span>
        {label && (
          <span className="text-[10px] font-medium text-slate">{label}</span>
        )}
      </div>
    </div>
  );
}
