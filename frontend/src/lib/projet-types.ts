import type { ProjetType } from "@/types";

export const PROJET_TYPE_LABELS: Record<ProjetType, string> = {
  ordinaire: "Projet ordinaire",
  mega_simandou: "Méga-projet Simandou",
};

export type ProjetTypeFilter = "all" | ProjetType;

export const PROJET_TYPE_FILTER_OPTIONS: { value: ProjetTypeFilter; label: string }[] = [
  { value: "all", label: "Tous les projets" },
  { value: "ordinaire", label: "Projets ordinaires" },
  { value: "mega_simandou", label: "Méga-projets Simandou" },
];

export function projetTypeBadgeClass(type: ProjetType): string {
  if (type === "mega_simandou") {
    return "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80";
  }
  return "bg-veil text-slate ring-1 ring-cloud";
}
