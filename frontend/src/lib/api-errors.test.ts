import { describe, expect, it } from "vitest";
import { formatApiErrorDetail, messageFromFailedResponse } from "./api-errors";

describe("formatApiErrorDetail", () => {
  it("retourne une chaîne telle quelle", () => {
    expect(formatApiErrorDetail("Direction introuvable")).toBe("Direction introuvable");
  });

  it("formate un tableau de validation FastAPI", () => {
    const detail = [
      { type: "string_too_short", loc: ["body", "libelle"], msg: "String should have at least 1 character" },
    ];
    expect(formatApiErrorDetail(detail)).toContain("body.libelle");
    expect(formatApiErrorDetail(detail)).toContain("at least 1 character");
  });

  it("évite [object Object]", () => {
    const detail = [{ msg: "Champ requis", loc: ["body", "email"] }];
    const formatted = formatApiErrorDetail(detail);
    expect(formatted).not.toContain("[object Object]");
  });
});

describe("messageFromFailedResponse", () => {
  it("utilise detail puis message puis statut", () => {
    expect(messageFromFailedResponse({ detail: "Erreur métier" }, 400)).toBe("Erreur métier");
    expect(messageFromFailedResponse({ message: "Fallback" }, 500)).toBe("Fallback");
    expect(messageFromFailedResponse({}, 502)).toBe("Erreur API (502)");
  });
});
