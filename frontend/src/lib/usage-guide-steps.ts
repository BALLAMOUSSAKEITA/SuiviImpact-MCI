import type { AccessType, UserRole } from "@/types";

import { BRAND } from "@/lib/brand";
import { ROLE_LABELS, canSeeNavHref } from "@/lib/roles";

export type UsageGuideContext = {
  role: UserRole;
  typeAcces: AccessType;
};

export type UsageGuideStep = {
  id: string;
  target: string;
  title: string;
  body: string;
  expandNav?: string;
  adminOnly?: boolean;
  navHref?: string;
};

/** Profil métier pour les textes du guide (BSD scindé lecture / écriture). */
export type GuideProfile =
  | "admin"
  | "developpeur"
  | "bsd-ecriture"
  | "bsd-lecture"
  | "directeur"
  | "sg"
  | "ministre"
  | "daf";

export function toGuideProfile(ctx: UsageGuideContext): GuideProfile {
  if (ctx.role === "developpeur") return "developpeur";
  if (ctx.role === "admin") {
    return ctx.typeAcces === "lecture" ? "bsd-lecture" : "admin";
  }
  if (ctx.role === "user") {
    return ctx.typeAcces === "lecture" ? "bsd-lecture" : "bsd-ecriture";
  }
  return ctx.role;
}

function profileLabel(ctx: UsageGuideContext): string {
  if (ctx.role === "admin" || ctx.role === "user") {
    const mode = ctx.typeAcces === "lecture" ? " — consultation" : " — saisie";
    return `${ROLE_LABELS[ctx.role]}${mode}`;
  }
  return ROLE_LABELS[ctx.role];
}

const BASE_STEPS: UsageGuideStep[] = [
  {
    id: "welcome",
    target: "workspace",
    title: `Bienvenue sur ${BRAND.appName}`,
    body: "",
  },
  {
    id: "sidebar",
    target: "sidebar",
    title: "Votre menu",
    body: "",
  },
  {
    id: "home",
    target: "/admin",
    navHref: "/admin",
    title: "Vue d’ensemble",
    body: "Tableau de bord d’accueil et accès rapides.",
  },
  {
    id: "parametrage",
    target: "/admin/plan-action",
    navHref: "/admin/objectifs",
    expandNav: "/admin/plan-action",
    title: "Paramétrage",
    body: "",
  },
  {
    id: "objectifs",
    target: "/admin/objectifs",
    navHref: "/admin/objectifs",
    expandNav: "/admin/plan-action",
    title: "Objectifs",
    body: "",
  },
  {
    id: "taches",
    target: "/admin/taches",
    navHref: "/admin/taches",
    expandNav: "/admin/plan-action",
    title: "Tâches",
    body: "",
  },
  {
    id: "projets-ref",
    target: "/admin/projets",
    navHref: "/admin/projets",
    expandNav: "/admin/plan-action",
    title: "Projets (référentiel)",
    body: "",
  },
  {
    id: "directions",
    target: "/admin/directions",
    navHref: "/admin/directions",
    expandNav: "/admin/plan-action",
    title: "Directions",
    body: "",
  },
  {
    id: "planification",
    target: "/admin/planification",
    navHref: "/admin/planification/pao",
    expandNav: "/admin/planification",
    title: "Planification",
    body: "",
  },
  {
    id: "plan-pao",
    target: "/admin/planification/pao",
    navHref: "/admin/planification/pao",
    expandNav: "/admin/planification",
    title: "Planification PAO",
    body: "",
  },
  {
    id: "plan-projet",
    target: "/admin/planification/projet",
    navHref: "/admin/planification/projet",
    expandNav: "/admin/planification",
    title: "Planification projet",
    body: "",
  },
  {
    id: "plan-indicateurs",
    target: "/admin/planification/indicateurs",
    navHref: "/admin/planification/indicateurs",
    expandNav: "/admin/planification",
    title: "Planification indicateurs",
    body: "",
  },
  {
    id: "suivi",
    target: "/admin/suivi",
    navHref: "/admin/suivi/pao",
    expandNav: "/admin/suivi",
    title: "Suivi",
    body: "",
  },
  {
    id: "suivi-pao",
    target: "/admin/suivi/pao",
    navHref: "/admin/suivi/pao",
    expandNav: "/admin/suivi",
    title: "Suivi PAO",
    body: "",
  },
  {
    id: "suivi-projet",
    target: "/admin/suivi/projet",
    navHref: "/admin/suivi/projet",
    expandNav: "/admin/suivi",
    title: "Suivi projet",
    body: "",
  },
  {
    id: "suivi-rcc",
    target: "/admin/suivi/rcc",
    navHref: "/admin/suivi/rcc",
    expandNav: "/admin/suivi",
    title: "Suivi IRC",
    body: "",
  },
  {
    id: "suivi-missions",
    target: "/admin/suivi/missions",
    navHref: "/admin/suivi/missions",
    expandNav: "/admin/suivi",
    title: "Suivi missions",
    body: "",
  },
  {
    id: "suivi-ppm",
    target: "/admin/suivi/ppm",
    navHref: "/admin/suivi/ppm",
    expandNav: "/admin/suivi",
    title: "Suivi PPM",
    body: "",
  },
  {
    id: "suivi-indicateurs",
    target: "/admin/suivi/indicateurs",
    navHref: "/admin/suivi/indicateurs",
    expandNav: "/admin/suivi",
    title: "Indicateurs",
    body: "",
  },
  {
    id: "finances",
    target: "/admin/finances",
    navHref: "/admin/finances",
    title: "Finances",
    body: "",
  },
  {
    id: "stats",
    target: "/admin/stats",
    navHref: "/admin/stats",
    title: "Statistiques",
    body: "",
  },
  {
    id: "workflow",
    target: "/admin/workflow",
    navHref: "/admin/workflow",
    title: "Workflow",
    body: "",
  },
  {
    id: "export",
    target: "/admin/export",
    navHref: "/admin/export",
    title: "Export",
    body: "",
  },
  {
    id: "archive",
    target: "/admin/archive",
    navHref: "/admin/archive",
    title: "Archive",
    body: "",
  },
  {
    id: "profil",
    target: "/admin/profil",
    navHref: "/admin/profil",
    title: "Mon profil",
    body: "Identité, photo, mot de passe et relance de ce guide.",
  },
  {
    id: "comptes",
    target: "/admin/comptes",
    navHref: "/admin/comptes",
    adminOnly: true,
    title: "Comptes utilisateurs",
    body: "",
  },
  {
    id: "done",
    target: "workspace",
    title: "Vous êtes prêt",
    body: "",
  },
];

type CopyTable = Partial<Record<GuideProfile, string>>;

const STEP_COPY: Record<string, CopyTable> = {
  welcome: {
    developpeur: `Visite pour un compte ${ROLE_LABELS.developpeur} : accès exclusif aux notifications e-mail (historique, configuration SMTP et rappels d'activités).`,
    admin: `Visite pour le super administrateur (${BRAND.bureauShort}) : accès complet, gestion des comptes, étape workflow BSD et suppression des dossiers.`,
    "bsd-ecriture": `Visite pour un compte ${ROLE_LABELS.user} avec droits de saisie : paramétrage, planification, suivi, exports et statistiques du ${BRAND.bureauShort}.`,
    "bsd-lecture": `Visite pour un compte ${ROLE_LABELS.user} en lecture seule : vous parcourez les mêmes écrans pour consulter les données, sans modifier les fiches métier.`,
    directeur: `Visite pour un compte ${ROLE_LABELS.directeur} : planification PAO de votre direction, workflow documentaire et archive.`,
    sg: `Visite pour un compte ${ROLE_LABELS.sg} : validation au workflow, statistiques de pilotage et archive institutionnelle.`,
    ministre: `Visite pour un compte ${ROLE_LABELS.ministre} : suivi des validations, indicateurs agrégés et documents archivés.`,
    daf: `Visite pour un compte ${ROLE_LABELS.daf} : mêmes onglets que le ministre (finances, statistiques, workflow, archive).`,
  },
  sidebar: {
    admin: "Accès complet au menu BSD et à l’administration (Comptes). Seules les entrées utiles à votre rôle sont listées ici.",
    "bsd-ecriture":
      "Menu complet du BSD opérationnel : référentiels, plans trimestriels, suivi et reporting. Les sections absentes ne font pas partie de votre périmètre.",
    "bsd-lecture":
      "Même arborescence que l’équipe BSD, mais vos actions de modification sont désactivées sur les écrans métier.",
    directeur:
      "Menu réduit au périmètre directeur : accueil, planification PAO, workflow, archive et profil.",
    sg: "Menu institutionnel : accueil, finances, statistiques, workflow, archive et profil.",
    ministre: "Menu institutionnel : accueil, finances, statistiques, workflow, archive et profil.",
    daf: "Menu identique au ministre : accueil, finances, statistiques, workflow, archive et profil.",
  },
  home: {
    directeur: "Point d’entrée : synthèse et liens vers vos modules (PAO, validations, archive).",
    sg: "Point d’entrée avant consultation des statistiques et du workflow.",
    ministre: "Point d’entrée avant consultation des statistiques et du workflow.",
    daf: "Point d’entrée avant consultation des statistiques et du workflow.",
  },
  parametrage: {
    admin: "Référentiels maîtres (objectifs, tâches, projets, directions) — à maintenir avant les campagnes de planification.",
    "bsd-ecriture":
      "Référentiels maîtres : à alimenter en amont des trimestres pour structurer plans et tableaux de suivi.",
    "bsd-lecture": "Consultation des référentiels qui structurent le programme ; pas de modification avec votre profil.",
  },
  objectifs: {
    "bsd-ecriture": "Hiérarchie des objectifs : création et mise à jour pour le plan d’action.",
    "bsd-lecture": "Consultation de la hiérarchie des objectifs du programme.",
  },
  taches: {
    "bsd-ecriture": "Catalogue des tâches liées aux objectifs, réutilisées dans les PAO trimestriels.",
    "bsd-lecture": "Consultation du catalogue de tâches.",
  },
  "projets-ref": {
    "bsd-ecriture": "Fiches projets institutionnels, distinctes du suivi d’exécution.",
    "bsd-lecture": "Consultation des fiches projets.",
  },
  directions: {
    "bsd-ecriture": "Organisation interne et rattachements pour le pilotage et les exports.",
    "bsd-lecture": "Consultation de la structure des directions.",
  },
  planification: {
    admin: "Trois volets : PAO, plan projet et indicateurs.",
    "bsd-ecriture": "Construisez les plans PAO, projet et indicateurs avant le suivi en cours d’année.",
    "bsd-lecture": "Consultation des plans PAO, projet et indicateurs.",
  },
  "plan-pao": {
    directeur:
      "Module central pour votre direction : choix du trimestre, activités et tâches du PAO à valider et piloter.",
    "bsd-ecriture": "Sélection du trimestre, activités et tâches planifiées pour le PAO.",
    "bsd-lecture": "Consultation du PAO par trimestre.",
  },
  "plan-projet": {
    "bsd-ecriture": "Planification des actions projet sur la période choisie.",
    "bsd-lecture": "Consultation du plan projet.",
  },
  "plan-indicateurs": {
    "bsd-ecriture":
      "Définition des indicateurs : code, libellé, unités, direction, référence et cible.",
    "bsd-lecture": "Consultation des indicateurs planifiés.",
  },
  suivi: {
    admin: "Hub de saisie de l’exécution réelle (PAO, IRC, missions, PPM, projets, indicateurs).",
    "bsd-ecriture": "Mettez à jour l’avancement, les statuts, commentaires et pièces jointes.",
    "bsd-lecture": "Consultation de l’avancement et des pièces sans saisie.",
  },
  "suivi-pao": {
    "bsd-ecriture": "Exécution trimestrielle des activités PAO.",
    "bsd-lecture": "Consultation de l’exécution PAO.",
  },
  "suivi-projet": {
    "bsd-ecriture": "Avancement des actions projet par période.",
    "bsd-lecture": "Consultation du suivi projet.",
  },
  "suivi-rcc": {
    "bsd-ecriture": "Recommandations IRC : saisie et historique par trimestre.",
    "bsd-lecture": "Consultation des recommandations IRC.",
  },
  "suivi-missions": {
    "bsd-ecriture": "Missions de terrain et comptes rendus.",
    "bsd-lecture": "Consultation des missions.",
  },
  "suivi-ppm": {
    "bsd-ecriture": "Suivi du plan de passation des marchés.",
    "bsd-lecture": "Consultation du PPM.",
  },
  "suivi-indicateurs": {
    "bsd-ecriture": "Saisie du réalisé par rapport à la cible pour chaque indicateur.",
    "bsd-lecture": "Consultation de la cible et du réalisé des indicateurs.",
  },
  stats: {
    admin: "Tableaux de bord par domaine avec filtres de période.",
    "bsd-ecriture": "Analyse PAO, RCC, missions, PPM et projets pour le reporting interne.",
    "bsd-lecture": "Tableaux de bord en lecture pour le reporting.",
    sg: "Indicateurs agrégés pour le pilotage au niveau SG.",
    ministre: "Vision consolidée pour le suivi ministériel.",
    daf: "Vision consolidée pour le suivi et le contrôle (mêmes tableaux que le ministre).",
  },
  finances: {
    admin: "Importez le fichier Excel de suivi budgétaire : le tableau actuel est entièrement remplacé.",
    "bsd-ecriture": "Importez le fichier Excel LFI / engagements / paiements ; chaque import écrase le précédent.",
    "bsd-lecture": "Consultation du tableau budgétaire importé (LFI, engagements, décaissements).",
    sg: "Consultation du suivi budgétaire (prévisions, engagements, paiements).",
    ministre: "Consultation du suivi budgétaire consolidé.",
    daf: "Consultation du tableau budgétaire (LFI, engagements, taux de décaissement).",
  },
  workflow: {
    admin: "Supervision des circuits de validation ; vous traitez l’étape BSD et pouvez supprimer les dossiers.",
    "bsd-ecriture": "Suivi des dossiers en circulation ; la saisie des étapes releve surtout des rôles institutionnels.",
    "bsd-lecture": "Consultation des dossiers et de l’état des validations.",
    directeur:
      "Vous pouvez initier des circuits de validation et traiter les étapes « directeur ».",
    sg: "Traitez les dossiers en attente à l’étape Secrétaire général.",
    ministre: "Validez ou rejetez les dossiers à l’étape Ministre.",
    daf: "Intervenez sur les étapes qui relèvent du DAF dans le circuit.",
  },
  export: {
    admin: "Extractions Excel (PAO, RCC, etc.) avec filtres de période.",
    "bsd-ecriture": "Générez les fichiers Excel pour reporting et partage.",
    "bsd-lecture": "Lancez des exports lorsque votre profil le permet ; sinon demandez à un collègue en écriture.",
  },
  archive: {
    directeur: "Dépôt et consultation des dossiers documentaires de votre périmètre.",
    sg: "Consultation et gestion des archives institutionnelles.",
    ministre: "Accès aux dossiers archivés pour décision et traçabilité.",
    daf: "Accès aux dossiers archivés pour traçabilité (comme le ministre).",
    "bsd-ecriture": "Dossiers et pièces jointes centralisés.",
    "bsd-lecture": "Consultation des dossiers archivés.",
  },
  comptes: {
    admin:
      "Création de comptes (mot de passe généré automatiquement), activation, super administrateur, développeur ou rôles institutionnels.",
  },
  done: {
    developpeur: "Vous connaissez l'onglet Notifications. Bonne configuration !",
    admin: "Vous avez parcouru les modules visibles pour un administrateur. Bonne utilisation !",
    "bsd-ecriture": "Vous connaissez le parcours BSD opérationnel. Bonne saisie sur la plateforme !",
    "bsd-lecture": "Vous savez où consulter l’information. Contactez l’équipe BSD pour toute modification.",
    directeur: "Vous connaissez vos modules directeur (PAO, workflow, archive). Bon pilotage !",
    sg: "Vous connaissez vos modules SG. Bonne validation !",
    ministre: "Vous connaissez vos modules ministériels. Bon suivi !",
    daf: "Vous connaissez les mêmes modules que le ministre. Bon contrôle !",
  },
};

const DEFAULT_COPY: Partial<Record<string, string>> = {
  home: "Tableau de bord d’accueil : raccourcis et synthèse de l’activité du programme.",
  parametrage:
    "Référentiels de base : objectifs, tâches, projets et directions.",
  objectifs: "Hiérarchie des objectifs qui structurent le plan d’action.",
  taches: "Catalogue des tâches rattachées aux objectifs.",
  "projets-ref": "Projets institutionnels et fiches associées.",
  directions: "Structure organisationnelle pour le pilotage.",
  planification: "Plans d’action (PAO, projet et indicateurs).",
  "plan-pao": "Trimestre, activités et tâches du plan d’action opérationnel.",
  "plan-projet": "Planification du volet projets.",
  "plan-indicateurs": "Définition des indicateurs (référence et cible).",
  suivi: "Mise à jour de l’avancement réel sur l’ensemble des volets.",
  "suivi-pao": "Exécution trimestrielle du PAO.",
  "suivi-projet": "Avancement des actions projet.",
  "suivi-rcc": "Recommandations IRC par trimestre.",
  "suivi-missions": "Missions de terrain et reporting.",
  "suivi-ppm": "Plan de passation des marchés.",
  "suivi-indicateurs": "Suivi du réalisé des indicateurs planifiés.",
  stats: "Tableaux de bord par domaine avec filtres de période.",
  finances: "Tableau budgétaire (LFI, engagements, paiements) importé depuis Excel.",
  workflow: "Circuits de validation documentaire entre les rôles.",
  export: "Extractions Excel pour reporting.",
  archive: "Dossiers et pièces jointes institutionnelles.",
};

function resolveBody(stepId: string, profile: GuideProfile, ctx: UsageGuideContext): string {
  const fromProfile = STEP_COPY[stepId]?.[profile];
  if (fromProfile) return fromProfile;

  const fromDefault = DEFAULT_COPY[stepId];
  if (fromDefault) return fromDefault;

  if (stepId === "welcome") {
    return `Visite guidée pour votre profil « ${profileLabel(ctx)} ». Seuls les modules accessibles avec votre compte seront présentés.`;
  }
  if (stepId === "sidebar") {
    return `Ce menu liste uniquement ce que votre compte (${profileLabel(ctx)}) peut ouvrir.`;
  }
  if (stepId === "done") {
    return `Fin de la visite pour le profil ${profileLabel(ctx)}. Bonne utilisation de ${BRAND.appName} !`;
  }

  return "";
}

function isStepVisible(step: UsageGuideStep, ctx: UsageGuideContext): boolean {
  const { role } = ctx;
  if (step.adminOnly && role !== "admin") return false;

  const hrefCheck = step.navHref ?? (step.target.startsWith("/") ? step.target : null);
  if (hrefCheck && !canSeeNavHref(role, hrefCheck)) return false;

  return true;
}

function personalizeStep(step: UsageGuideStep, ctx: UsageGuideContext): UsageGuideStep {
  const profile = toGuideProfile(ctx);
  const body = resolveBody(step.id, profile, ctx);
  let title = step.title;
  if (step.id === "welcome") {
    title = `Bienvenue — ${profileLabel(ctx)}`;
  }
  if (step.id === "sidebar") {
    title = `Menu (${profileLabel(ctx)})`;
  }
  return { ...step, title, body };
}

export function getUsageGuideSteps(ctx: UsageGuideContext | undefined): UsageGuideStep[] {
  if (!ctx) return [];
  return BASE_STEPS.filter((step) => isStepVisible(step, ctx)).map((step) =>
    personalizeStep(step, ctx),
  );
}

export function queryTourTarget(target: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(`[data-tour-target="${CSS.escape(target)}"]`);
}
