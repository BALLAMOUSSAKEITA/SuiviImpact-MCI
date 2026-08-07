import type { UserRole, WorkflowStepRole } from "@/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Super administrateur",
  user: "Utilisateur (BSD)",
  directeur: "Directeur",
  sg: "Secrétaire général",
  ministre: "Ministre",
  daf: "DAF",
};

const INSTITUTION_ROLES: UserRole[] = ["directeur", "sg", "ministre", "daf"];

export function isInstitutionRole(role: UserRole | undefined): boolean {
  return role != null && INSTITUTION_ROLES.includes(role);
}

export function canWritePlatform(role: UserRole | undefined, typeAcces: string | undefined): boolean {
  if (!role) return false;
  if (isInstitutionRole(role)) return false;
  return typeAcces === "ecriture";
}

/** Chemins autorisés (hors préfixe /admin). Vue d'ensemble = exact /admin. */
export function isPathAllowed(role: UserRole | undefined, pathname: string): boolean {
  if (!role || role === "admin" || role === "user") return true;

  const path = pathname.split("?")[0];

  if (path === "/admin/profil" || path.startsWith("/admin/profil/")) return true;

  if (role === "directeur") {
    const allowed = [
      "/admin",
      "/admin/planification/pao",
      "/admin/workflow",
      "/admin/archive",
    ];
    return matchesAllowed(path, allowed);
  }

  if (role === "sg" || role === "ministre" || role === "daf") {
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
  if (adminOnly) return role === "admin";
  if (role === "admin" || role === "user") return true;

  if (href === "/admin/comptes" || href.startsWith("/admin/comptes/")) return false;
  if (href.startsWith("/admin/plan-action") || href.startsWith("/admin/objectifs")) return false;
  if (href.startsWith("/admin/taches") && !href.includes("planification")) return false;
  if (href.startsWith("/admin/projets") && !href.includes("planification") && !href.includes("suivi")) return false;
  if (href.startsWith("/admin/directions")) return false;
  if (href === "/admin/planification" || href === "/admin/planification/projet") return false;
  if (href.startsWith("/admin/suivi")) return false;
  if (href.startsWith("/admin/export")) return false;

  if (role === "directeur") {
    if (href === "/admin/stats") return false;
    if (href === "/admin/planification/pao" || href.startsWith("/admin/planification/pao/")) return true;
    return isPathAllowed(role, href);
  }

  if (role === "sg" || role === "ministre" || role === "daf") {
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
  return "/admin";
}

export function userWorkflowStepRole(role: UserRole | undefined): WorkflowStepRole | null {
  if (!role) return null;
  const map: Record<UserRole, WorkflowStepRole | null> = {
    admin: null,
    user: "bsd",
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
