import { DEFAULT_ANNEE } from "@/lib/years";
import type { StatsPeriodParams } from "@/types";

/** Bornes calendaires pour une année (filtre plage équivalent à « année entière »). */
export function yearToDateRange(annee: number): { du: string; au: string } {
  return {
    du: `${annee}-01-01`,
    au: `${annee}-12-31`,
  };
}

export function normalizeStatsPeriod(period: StatsPeriodParams): StatsPeriodParams {
  if (period.mode === "annee") {
    return {
      mode: "annee",
      annee: period.annee ?? DEFAULT_ANNEE,
    };
  }
  if (period.mode === "plage") {
    const fallback = yearToDateRange(period.annee ?? DEFAULT_ANNEE);
    return {
      mode: "plage",
      du: period.du?.trim() || fallback.du,
      au: period.au?.trim() || fallback.au,
    };
  }
  return period;
}

export function appendStatsPeriodToSearch(
  search: URLSearchParams,
  period: StatsPeriodParams,
) {
  const p = normalizeStatsPeriod(period);
  search.set("mode", p.mode);
  if (p.mode === "annee") {
    search.set("annee", String(p.annee ?? DEFAULT_ANNEE));
    return;
  }
  if (p.mode === "plage") {
    search.set("du", p.du!);
    search.set("au", p.au!);
    return;
  }
  if (p.mode === "mois" && p.mois) {
    search.set("mois", p.mois);
  }
}
