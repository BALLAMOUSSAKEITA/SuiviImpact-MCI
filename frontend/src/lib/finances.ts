import type { FinanceLigne } from "@/types";

const GNF = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function parseFinanceNumber(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function parseFinanceTaux(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return n <= 1.5 ? n * 100 : n;
}

export function formatMontantGnf(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return GNF.format(n);
}

export function formatMontantGnfCompact(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e9) {
    return `${(value / 1e9).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Md`;
  }
  if (abs >= 1e6) {
    return `${(value / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  }
  return GNF.format(value);
}

export function formatTauxPct(value: string | number | null | undefined): string {
  const pct = typeof value === "number" ? value : parseFinanceTaux(value);
  if (!Number.isFinite(pct)) return "—";
  return `${pct.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`;
}

export function shortTitreBudget(titre: string): string {
  const match = titre.match(/^(Titre\s+[IVXLCDM]+)/i);
  if (match) return match[1];
  const before = titre.split(":")[0]?.trim();
  if (before && before.length <= 22) return before;
  return titre.length > 22 ? `${titre.slice(0, 20)}…` : titre;
}

export interface FinanceTitreStat {
  titre: string;
  short: string;
  prevu: number;
  engage: number;
  paye: number;
  tauxEngagement: number;
  tauxCaisse: number;
}

export interface FinanceDashboardStats {
  prevu: number;
  engage: number;
  paye: number;
  tauxEngagement: number;
  tauxCaisse: number;
  titres: FinanceTitreStat[];
}

export function computeFinanceStats(lignes: FinanceLigne[]): FinanceDashboardStats | null {
  if (lignes.length === 0) return null;

  const detail = lignes.filter((l) => !l.is_total);
  const totalRow = lignes.find((l) => l.is_total);

  const sum = (pick: (l: FinanceLigne) => string | null) =>
    detail.reduce((acc, l) => acc + parseFinanceNumber(pick(l)), 0);

  const prevu = totalRow ? parseFinanceNumber(totalRow.montant_prevu) : sum((l) => l.montant_prevu);
  const engage = totalRow
    ? parseFinanceNumber(totalRow.montant_engage)
    : sum((l) => l.montant_engage);
  const paye = totalRow ? parseFinanceNumber(totalRow.montant_paye) : sum((l) => l.montant_paye);

  const tauxEngagement = totalRow
    ? parseFinanceTaux(totalRow.taux_engagement)
    : prevu > 0
      ? (engage / prevu) * 100
      : 0;
  const tauxCaisse = totalRow
    ? parseFinanceTaux(totalRow.taux_caisse)
    : prevu > 0
      ? (paye / prevu) * 100
      : 0;

  const titres = (detail.length > 0 ? detail : lignes).map((l) => {
    const tPrevu = parseFinanceNumber(l.montant_prevu);
    const tEngage = parseFinanceNumber(l.montant_engage);
    const tPaye = parseFinanceNumber(l.montant_paye);
    return {
      titre: l.titre_budget,
      short: shortTitreBudget(l.titre_budget),
      prevu: tPrevu,
      engage: tEngage,
      paye: tPaye,
      tauxEngagement: l.taux_engagement
        ? parseFinanceTaux(l.taux_engagement)
        : tPrevu > 0
          ? (tEngage / tPrevu) * 100
          : 0,
      tauxCaisse: l.taux_caisse
        ? parseFinanceTaux(l.taux_caisse)
        : tPrevu > 0
          ? (tPaye / tPrevu) * 100
          : 0,
    };
  });

  return { prevu, engage, paye, tauxEngagement, tauxCaisse, titres };
}
