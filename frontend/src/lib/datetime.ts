/** Fuseau horaire officiel — République de Guinée (Conakry, UTC+0). */
export const GUINEA_TIMEZONE = "Africa/Conakry";

export function formatTimeGuinea(value: string): string {
  return new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: GUINEA_TIMEZONE,
  });
}
