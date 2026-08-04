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
    <div className={cn("flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center", className)}>
      <label htmlFor="direction-filter" className="shrink-0 text-sm text-slate">
        Direction :
      </label>
      <select
        id="direction-filter"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="input-grain w-full sm:w-auto sm:min-w-[200px]"
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
