import type { ProjetType, StatsPeriodParams } from "@/types";

export type ProjetStatsScope =
  | { kind: "all" }
  | { kind: "type"; type: ProjetType }
  | { kind: "projet"; id: number };

export const DEFAULT_PROJET_STATS_SCOPE: ProjetStatsScope = { kind: "all" };

export function projetStatsScopeToValue(scope: ProjetStatsScope): string {
  if (scope.kind === "all") return "all";
  if (scope.kind === "type") return `type:${scope.type}`;
  return `projet:${scope.id}`;
}

export function projetStatsScopeFromValue(value: string): ProjetStatsScope {
  if (!value || value === "all") return { kind: "all" };
  if (value.startsWith("type:")) {
    const type = value.slice(5) as ProjetType;
    return { kind: "type", type };
  }
  if (value.startsWith("projet:")) {
    return { kind: "projet", id: Number(value.slice(7)) };
  }
  return { kind: "all" };
}

export function statsProjetsRequest(
  scope: ProjetStatsScope,
  period: StatsPeriodParams,
): {
  projetId?: number;
  typeProjet?: ProjetType;
  period: StatsPeriodParams;
} {
  if (scope.kind === "projet") {
    return { projetId: scope.id, period };
  }
  if (scope.kind === "type") {
    return { typeProjet: scope.type, period };
  }
  return { period };
}

export function projetStatsScopeLabel(
  scope: ProjetStatsScope,
  projetLabel?: string,
): string {
  if (scope.kind === "projet") {
    return projetLabel ? `Projet : ${projetLabel}` : "Projet sélectionné";
  }
  if (scope.kind === "type") {
    return scope.type === "mega_simandou"
      ? "Méga-projets Simandou"
      : "Projets ordinaires";
  }
  return "Tous les projets";
}
