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
    queryFn: () => listDirections(),
  });

  return (
    <div className={cn("flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center", className)}>
      <label htmlFor="direction-filter" className="label-grain mb-0 shrink-0">
        Direction
      </label>
      <select
        id="direction-filter"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="input-grain w-full cursor-pointer sm:w-auto sm:min-w-[220px]"
      >
        <option value="">Toutes les directions</option>
        {directions.map((d) => (
          <option key={d.id} value={d.code}>
            {d.code} — {d.libelle}
          </option>
        ))}
      </select>
    </div>
  );
}
