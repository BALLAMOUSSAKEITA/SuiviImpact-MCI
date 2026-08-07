/** Formate le champ `detail` renvoyé par FastAPI (string, tableau de validation, objet). */
export function formatApiErrorDetail(detail: unknown): string {
  if (detail == null) return "";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          const rec = item as { msg: unknown; loc?: unknown };
          const loc = Array.isArray(rec.loc) ? rec.loc.filter(Boolean).join(".") : "";
          const msg = typeof rec.msg === "string" ? rec.msg : String(rec.msg);
          return loc ? `${loc}: ${msg}` : msg;
        }
        return formatApiErrorDetail(item);
      })
      .filter(Boolean)
      .join(" · ");
  }
  if (typeof detail === "object") {
    const obj = detail as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    try {
      return JSON.stringify(detail);
    } catch {
      return "Erreur inconnue";
    }
  }
  return String(detail);
}

export function messageFromFailedResponse(
  body: Record<string, unknown>,
  status: number,
): string {
  const detail = formatApiErrorDetail(body.detail);
  if (detail) return detail;
  const message = body.message;
  if (typeof message === "string" && message) return message;
  return `Erreur API (${status})`;
}
