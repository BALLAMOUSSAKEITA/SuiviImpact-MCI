/** Palette graphiques — vert national. */

export const STATUS_COLORS = {
  non_demare: "#d4e5dc",
  en_cours: "#2db88a",
  termine: "#009460",
  en_retard: "#d64545",
} as const;

export const PPM_COLORS = {
  dao_elabore: "#d4e5dc",
  dao_publie: "#2db88a",
  marche_attribue: "#0d6b4a",
  contrat_signe: "#009460",
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
    border: "1px solid #d4e5dc",
    borderRadius: "8px",
    boxShadow:
      "rgba(13, 79, 56, 0.04) 0px 4px 5px 0px, rgba(13, 79, 56, 0.03) 0px 8px 15px 0px",
    fontSize: "13px",
    padding: "8px 12px",
  },
  itemStyle: { color: "#0d4f38" },
  labelStyle: { color: "#4a6b5c", fontWeight: 500, marginBottom: 4 },
} as const;

export function parseProgress(value: number | string): number {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
}
