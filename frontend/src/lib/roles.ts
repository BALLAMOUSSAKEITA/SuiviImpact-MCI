import type { UserRole, WorkflowStepRole } from "@/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Super administrateur (BSD)",
  user: "Utilisateur (BSD)", // comptes historiques
  developpeur: "Développeur",
  directeur: "Directeur",
  sg: "Secrétaire général",
  ministre: "Ministre",
  daf: "DAF",
};

/** Rôles institutionnels en lecture seule à la création de compte. */
export const INSTITUTION_ROLES: UserRole[] = ["directeur", "sg", "ministre", "daf"];

/** Mêmes onglets que le ministre : accueil, statistiques, workflow, archive, profil. */
const MINISTRE_TAB_ROLES: UserRole[] = ["ministre", "daf"];

export function isInstitutionRole(role: UserRole | undefined): boolean {
  return role != null && INSTITUTION_ROLES.includes(role);
}

export function hasMinistreTabAccess(role: UserRole | undefined): boolean {
  return role != null && MINISTRE_TAB_ROLES.includes(role);
}

/** SG, ministre et DAF partagent la même visibilité des onglets de pilotage. */
export function hasPilotageTabAccess(role: UserRole | undefined): boolean {
  return role === "sg" || hasMinistreTabAccess(role);
}

export function isDeveloperRole(role: UserRole | undefined): boolean {
  return role === "developpeur";
}

/** Accès exclusif à l'onglet Notifications e-mail. */
export function canAccessNotifications(role: UserRole | undefined): boolean {
  return role === "developpeur";
}

export function canWritePlatform(role: UserRole | undefined, typeAcces: string | undefined): boolean {
  if (!role) return false;
  if (isDeveloperRole(role)) return false;
  if (isInstitutionRole(role)) return false;
  return typeAcces === "ecriture";
}

/** Chemins autorisés (hors préfixe /admin). Vue d'ensemble = exact /admin. */
export function isPathAllowed(role: UserRole | undefined, pathname: string): boolean {
  const path = pathname.split("?")[0];
  if (path === "/admin/profil" || path.startsWith("/admin/profil/")) return true;

  if (role === "developpeur") {
    return path === "/admin/notifications" || path.startsWith("/admin/notifications/");
  }

  if (!role || role === "admin" || role === "user") return true;

  if (role === "directeur") {
    const allowed = [
      "/admin",
      "/admin/planification/pao",
      "/admin/workflow",
      "/admin/archive",
    ];
    return matchesAllowed(path, allowed);
  }

  if (hasPilotageTabAccess(role)) {
    const allowed = ["/admin", "/admin/workflow", "/admin/archive", "/admin/stats"];
    return matchesAllowed(path, allowed);
  }

  return false;
}

function matchesAllowed(path: string, allowed: string[]): boolean {
  for (const base of allowed) {
    if (base === "/admin") {
      if (path === "/admin") return true;
      continue;
    }
    if (path === base || path.startsWith(`${base}/`)) return true;
  }
  return false;
}

export function canSeeNavHref(role: UserRole | undefined, href: string, adminOnly?: boolean): boolean {
  if (!role) return false;
  if (href === "/admin/profil" || href.startsWith("/admin/profil/")) return true;
  if (adminOnly) return role === "admin";

  if (role === "developpeur") {
    return href.startsWith("/admin/notifications");
  }

  if (href.startsWith("/admin/notifications")) return false;

  if (role === "admin" || role === "user") return true;

  if (href === "/admin/comptes" || href.startsWith("/admin/comptes/")) return false;
  if (href.startsWith("/admin/plan-action") || href.startsWith("/admin/objectifs")) return false;
  if (href.startsWith("/admin/taches") && !href.includes("planification")) return false;
  if (href.startsWith("/admin/projets") && !href.includes("planification") && !href.includes("suivi")) return false;
  if (href.startsWith("/admin/directions")) return false;
  if (
    href === "/admin/planification" ||
    href === "/admin/planification/projet" ||
    href === "/admin/planification/indicateurs" ||
    href.startsWith("/admin/planification/indicateurs/")
  ) {
    return false;
  }
  if (href.startsWith("/admin/suivi")) return false;
  if (href.startsWith("/admin/export")) return false;

  if (role === "directeur") {
    if (href === "/admin/stats") return false;
    if (href === "/admin/planification/pao" || href.startsWith("/admin/planification/pao/")) return true;
    return isPathAllowed(role, href);
  }

  if (hasPilotageTabAccess(role)) {
    if (href.startsWith("/admin/planification")) return false;
    return isPathAllowed(role, href);
  }

  return false;
}

export function canSeeNavGroup(
  role: UserRole | undefined,
  parentHref: string,
  childHrefs: string[],
  adminOnly?: boolean,
): boolean {
  if (adminOnly) return role === "admin";
  return childHrefs.some((href) => canSeeNavHref(role, href, false));
}

export function defaultHomeForRole(role: UserRole | undefined): string {
  if (role === "developpeur") return "/admin/notifications";
  return "/admin";
}

export function userWorkflowStepRole(role: UserRole | undefined): WorkflowStepRole | null {
  if (!role) return null;
  const map: Record<UserRole, WorkflowStepRole | null> = {
    admin: "bsd",
    user: "bsd",
    developpeur: null,
    directeur: "directeur",
    sg: "sg",
    ministre: "ministre",
    daf: "daf",
  };
  return map[role] ?? null;
}

export function canCreateWorkflow(role: UserRole | undefined): boolean {
  return role === "directeur";
}

export function canActOnWorkflowStep(
  userRole: UserRole | undefined,
  stepRole: WorkflowStepRole,
): boolean {
  return userWorkflowStepRole(userRole) === stepRole;
}

/** Suppression d'un workflow — super administrateur (BSD). */
export function canDeleteWorkflow(role: UserRole | undefined): boolean {
  return role === "admin" || role === "user";
}
