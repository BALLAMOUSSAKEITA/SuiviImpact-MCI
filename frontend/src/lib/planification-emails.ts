import type { Direction, MinistreParametrage } from "@/types";

/** E-mails issus du paramétrage pour la direction sélectionnée. */
export function emailsFromDirectionSelection(
  directionId: string,
  directions: Direction[],
  ministre: MinistreParametrage | undefined,
): { emailResponsable: string; emailMinistre: string } {
  const direction = directions.find((d) => String(d.id) === directionId);
  return {
    emailResponsable: direction?.email_directeur?.trim() ?? "",
    emailMinistre: ministre?.email?.trim() ?? "",
  };
}

export function handlePlanificationDirectionChange(
  directionId: string,
  directions: Direction[],
  ministre: MinistreParametrage | undefined,
  setters: {
    setDirectionId: (value: string) => void;
    setEmailResponsable: (value: string) => void;
    setEmailMinistre: (value: string) => void;
  },
): void {
  setters.setDirectionId(directionId);
  if (!directionId) {
    setters.setEmailResponsable("");
    setters.setEmailMinistre("");
    return;
  }
  const { emailResponsable, emailMinistre } = emailsFromDirectionSelection(
    directionId,
    directions,
    ministre,
  );
  setters.setEmailResponsable(emailResponsable);
  setters.setEmailMinistre(emailMinistre);
}

export const PLANIFICATION_EMAIL_HINT =
  "Prérempli depuis le paramétrage (direction / ministre) — modifiable si besoin.";
