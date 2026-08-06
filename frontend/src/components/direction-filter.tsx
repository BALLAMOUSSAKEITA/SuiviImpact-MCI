"use client";

import { useQuery } from "@tanstack/react-query";

import { listDirections } from "@/lib/api";
import { cn } from "@/lib/utils";

interface DirectionFilterProps {
  value: string | null;
  onChange: (code: string | null) => void;
  className?: string;
}

export function DirectionFilter({
  value,
  onChange,
  className,
}: DirectionFilterProps) {
  const { data: directions = [] } = useQuery({
    queryKey: ["directions"],
    queryFn: listDirections,
  });

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor="direction-filter" className="text-[13px] text-gray-500">
        Direction
      </label>
      <select
        id="direction-filter"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="input-grain h-8 w-auto min-w-[180px] pr-8 text-[13px]"
      >
        <option value="">Toutes</option>
        {directions.map((d) => (
          <option key={d.id} value={d.code}>
            {d.code} — {d.libelle}
          </option>
        ))}
      </select>
    </div>
  );
}
