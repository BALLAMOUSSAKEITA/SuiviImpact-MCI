import {
  MODULE_ACCENTS,
  PPM_COLORS,
  STATUS_COLORS,
  parseProgress,
} from "@/lib/chart-colors";
import type {
  ActiviteStats,
  ExecutionStats,
  PpmStats,
  ProjetStats,
} from "@/types";
import { PPM_STATUT_LABELS } from "@/types";
import type { StatusSlice } from "@/components/charts/status-donut-chart";
import type { FunnelBarItem } from "@/components/charts/funnel-bar-chart";

export function executionStatusSlices(
  stats: ExecutionStats | ActiviteStats,
  includeRetard = false,
): StatusSlice[] {
  const slices: StatusSlice[] = [
    { name: "Non démarrées", value: stats.non_demare, color: STATUS_COLORS.non_demare },
    { name: "En cours", value: stats.en_cours, color: STATUS_COLORS.en_cours },
    { name: "Terminées", value: stats.termine, color: STATUS_COLORS.termine },
  ];
  if (includeRetard && "en_retard" in stats) {
    slices.push({
      name: "En retard",
      value: stats.en_retard,
      color: STATUS_COLORS.en_retard,
    });
  }
  return slices;
}

export function ppmFunnelSlices(stats: PpmStats): FunnelBarItem[] {
  return [
    {
      name: PPM_STATUT_LABELS.dao_elabore,
      value: stats.dao_elabore,
      color: PPM_COLORS.dao_elabore,
    },
    {
      name: PPM_STATUT_LABELS.dao_publie,
      value: stats.dao_publie,
      color: PPM_COLORS.dao_publie,
    },
    {
      name: PPM_STATUT_LABELS.marche_attribue,
      value: stats.marche_attribue,
      color: PPM_COLORS.marche_attribue,
    },
    {
      name: PPM_STATUT_LABELS.contrat_signe,
      value: stats.contrat_signe,
      color: PPM_COLORS.contrat_signe,
    },
  ];
}

export function ppmProgression(stats: PpmStats): string {
  if (stats.total <= 0) return "0";
  return ((stats.contrat_signe / stats.total) * 100).toFixed(0);
}

export function avgProgression(values: (number | string)[]): number {
  const nums = values.map(parseProgress).filter((n) => n > 0);
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export { MODULE_ACCENTS, parseProgress };
