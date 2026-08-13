/** Palette graphiques — navy / bleu signal. */

export const STATUS_COLORS = {
  non_demare: "#d4e0ed",
  en_cours: "#0099ff",
  termine: "#006bff",
  en_retard: "#d64545",
} as const;

export const PPM_COLORS = {
  dao_elabore: "#d4e0ed",
  dao_publie: "#0099ff",
  marche_attribue: "#004eba",
  contrat_signe: "#006bff",
} as const;

export const MODULE_ACCENTS = {
  activites: { bg: "bg-mint", border: "border-signal-blue/20", text: "text-signal-blue" },
  rcc: { bg: "bg-sky", border: "border-ice-blue/30", text: "text-carbon" },
  missions: { bg: "bg-lavender", border: "border-periwinkle", text: "text-carbon" },
  ppm: { bg: "bg-peach", border: "border-amber-200/60", text: "text-carbon" },
  projets: { bg: "bg-periwinkle", border: "border-signal-blue/15", text: "text-signal-blue" },
} as const;

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#ffffff",
    border: "1px solid #d4e0ed",
    borderRadius: "8px",
    boxShadow:
      "rgba(71, 103, 136, 0.04) 0px 4px 5px 0px, rgba(71, 103, 136, 0.03) 0px 8px 15px 0px",
    fontSize: "13px",
    padding: "8px 12px",
  },
  itemStyle: { color: "#0b3558" },
  labelStyle: { color: "#476788", fontWeight: 500, marginBottom: 4 },
} as const;

export function parseProgress(value: number | string): number {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
}
