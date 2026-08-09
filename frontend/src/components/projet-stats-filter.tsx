"use client";

import { useQuery } from "@tanstack/react-query";

import { listProjets } from "@/lib/api";
import { PROJET_TYPE_FILTER_OPTIONS } from "@/lib/projet-types";
import {
  projetStatsScopeFromValue,
  projetStatsScopeToValue,
  type ProjetStatsScope,
} from "@/lib/projet-stats-scope";
import { cn } from "@/lib/utils";

interface ProjetStatsFilterProps {
  value: ProjetStatsScope;
  onChange: (scope: ProjetStatsScope) => void;
  className?: string;
  compact?: boolean;
}

export function ProjetStatsFilter({
  value,
  onChange,
  className,
  compact,
}: ProjetStatsFilterProps) {
  const { data: projets = [] } = useQuery({
    queryKey: ["projets"],
    queryFn: () => listProjets(),
  });

  const panierOptions = PROJET_TYPE_FILTER_OPTIONS.filter((o) => o.value !== "all");

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center",
        className,
      )}
    >
      {!compact && (
        <label htmlFor="projet-stats-filter" className="label-grain mb-0 shrink-0">
          Périmètre projets
        </label>
      )}
      <select
        id="projet-stats-filter"
        value={projetStatsScopeToValue(value)}
        onChange={(e) => onChange(projetStatsScopeFromValue(e.target.value))}
        className={cn(
          "input-grain w-full cursor-pointer sm:w-auto",
          compact ? "min-w-[200px] py-1.5 text-sm" : "sm:min-w-[260px]",
        )}
        aria-label="Périmètre projets"
      >
        <optgroup label="Vue globale">
          <option value="all">Tous les projets</option>
        </optgroup>
        <optgroup label="Panier">
          {panierOptions.map((o) => (
            <option key={o.value} value={`type:${o.value}`}>
              {o.label}
            </option>
          ))}
        </optgroup>
        {projets.length > 0 && (
          <optgroup label="Projet">
            {projets.map((p) => (
              <option key={p.id} value={`projet:${p.id}`}>
                {p.code} — {p.description}
              </option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
}
