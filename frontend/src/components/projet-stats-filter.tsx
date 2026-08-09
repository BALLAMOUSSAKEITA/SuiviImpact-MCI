"use client";

import { useId } from "react";
import { useQuery } from "@tanstack/react-query";

import { listProjets } from "@/lib/api";
import { PROJET_TYPE_LABELS } from "@/lib/projet-types";
import {
  projetStatsScopeLabel,
  type ProjetStatsScope,
} from "@/lib/projet-stats-scope";
import type { ProjetType } from "@/types";
import { cn } from "@/lib/utils";

interface ProjetStatsFilterProps {
  value: ProjetStatsScope;
  onChange: (scope: ProjetStatsScope) => void;
  className?: string;
}

const PANIER_OPTIONS: { value: "all" | ProjetType; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "ordinaire", label: "Ordinaires" },
  { value: "mega_simandou", label: "Simandou" },
];

export function ProjetStatsFilter({
  value,
  onChange,
  className,
}: ProjetStatsFilterProps) {
  const panierGroupName = useId();
  const { data: projets = [] } = useQuery({
    queryKey: ["projets"],
    queryFn: () => listProjets(),
  });

  const activePanier: "all" | ProjetType =
    value.kind === "type" ? value.type : "all";
  const selectedProjetId = value.kind === "projet" ? String(value.id) : "";

  const handlePanier = (panier: "all" | ProjetType) => {
    if (panier === "all") {
      onChange({ kind: "all" });
      return;
    }
    onChange({ kind: "type", type: panier });
  };

  return (
    <div className={cn("panel-grain", className)}>
      <p className="text-base font-medium text-graphite">Périmètre</p>
      <p className="mt-1 text-sm leading-[1.43] text-slate">
        Vue globale, panier ou projet précis — {projetStatsScopeLabel(value)}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {PANIER_OPTIONS.map(({ value: panier, label }) => (
          <label
            key={panier}
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-3 py-2 text-center text-sm font-medium transition-colors",
              value.kind !== "projet" && activePanier === panier
                ? "bg-graphite text-white"
                : "bg-veil text-slate hover:text-graphite",
            )}
          >
            <input
              type="radio"
              name={panierGroupName}
              className="sr-only"
              checked={value.kind !== "projet" && activePanier === panier}
              onChange={() => handlePanier(panier)}
            />
            {label}
          </label>
        ))}
      </div>

      {projets.length > 0 && (
        <div className="mt-4 border-t border-cloud/60 pt-4">
          <label htmlFor="projet-stats-pick" className="label-grain">
            Projet précis
          </label>
          <select
            id="projet-stats-pick"
            value={selectedProjetId}
            onChange={(e) => {
              const id = e.target.value;
              if (!id) {
                onChange({ kind: "all" });
                return;
              }
              onChange({ kind: "projet", id: Number(id) });
            }}
            className={cn(
              "input-grain mt-1.5 w-full cursor-pointer",
              value.kind === "projet" && "ring-1 ring-graphite/25",
            )}
          >
            <option value="">— Tous du panier sélectionné —</option>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.description}
                {p.type_projet === "mega_simandou"
                  ? ` (${PROJET_TYPE_LABELS.mega_simandou})`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
