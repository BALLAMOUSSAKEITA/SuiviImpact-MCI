import type { DossierDeletePreview } from "@/types";

export function dossierDeleteDialogTitle(preview: DossierDeletePreview): string {
  if (preview.est_vide) {
    return "Supprimer le dossier";
  }
  return "Supprimer un dossier non vide";
}

export function dossierDeleteDialogDescription(
  name: string,
  preview: DossierDeletePreview,
): string {
  if (preview.est_vide) {
    return `Le dossier « ${name} » est vide. Confirmer sa suppression ?`;
  }

  const parts: string[] = [];
  if (preview.sous_dossiers_total > 0) {
    const n = preview.sous_dossiers_total;
    parts.push(`${n} sous-dossier${n > 1 ? "s" : ""}`);
  }
  if (preview.fichiers_total > 0) {
    const n = preview.fichiers_total;
    parts.push(`${n} fichier${n > 1 ? "s" : ""}`);
  }

  return (
    `Attention : le dossier « ${name} » n'est pas vide. ` +
    `Il contient ${parts.join(" et ")} (y compris dans les sous-dossiers). ` +
    `Tout le contenu sera définitivement supprimé. Confirmer ?`
  );
}
