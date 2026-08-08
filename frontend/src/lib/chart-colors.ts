/** Palette graphiques — sobre, lisible, une seule accentuation verte. */

export const STATUS_COLORS = {
  non_demare: "#d4d4d4",
  en_cours: "#5eb8cc",
  termine: "#009959",
  en_retard: "#d64545",
} as const;

export const PPM_COLORS = {
  dao_elabore: "#e8e8e8",
  dao_publie: "#5eb8cc",
  marche_attribue: "#00b96c",
  contrat_signe: "#009959",
} as const;

export const MODULE_ACCENTS = {
  activites: { bg: "bg-mint", border: "border-forest-ink/20", text: "text-forest-ink" },
  rcc: { bg: "bg-sky", border: "border-ice-blue/30", text: "text-carbon" },
  missions: { bg: "bg-lavender", border: "border-periwinkle", text: "text-carbon" },
  ppm: { bg: "bg-peach", border: "border-amber-200/60", text: "text-carbon" },
  projets: { bg: "bg-periwinkle", border: "border-forest-ink/15", text: "text-forest-ink" },
} as const;

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#ffffff",
    border: "1px solid #ebebeb",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    fontSize: "13px",
    padding: "8px 12px",
  },
  itemStyle: { color: "#222222" },
  labelStyle: { color: "#6a6a6a", fontWeight: 500, marginBottom: 4 },
} as const;

export function parseProgress(value: number | string): number {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
}
