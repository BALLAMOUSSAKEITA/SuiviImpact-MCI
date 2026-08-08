import { DEFAULT_ANNEE } from "@/lib/years";
import type { StatsPeriodParams } from "@/types";

const MOIS_SHORT = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc",
] as const;

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

/** Libellé compact pour affichage toolbar (ex. « 2026 », « 1 janv. – 31 déc. 2026 »). */
export function formatPeriodLabel(period: StatsPeriodParams): string {
  const p = normalizeStatsPeriod(period);

  if (p.mode === "annee") {
    return String(p.annee ?? DEFAULT_ANNEE);
  }

  if (p.mode === "plage" && p.du && p.au) {
    const fmt = (iso: string) => {
      const d = new Date(iso + "T12:00:00");
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };
    return `${fmt(p.du)} – ${fmt(p.au)}`;
  }

  if (p.mode === "mois" && p.mois) {
    const parts = p.mois.split(",").filter(Boolean);
    if (parts.length === 1) {
      const [y, m] = parts[0].split("-");
      const idx = parseInt(m, 10) - 1;
      return `${MOIS_SHORT[idx] ?? m}. ${y}`;
    }
    if (parts.length > 1) {
      const [y] = parts[0].split("-");
      return `${parts.length} mois · ${y}`;
    }
  }

  return "Période";
}
