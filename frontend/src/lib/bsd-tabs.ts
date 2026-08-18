export type BsdMemberTabKey =
  | "vue-ensemble"
  | "parametrage"
  | "planification"
  | "suivi"
  | "finances"
  | "statistiques"
  | "workflow"
  | "export"
  | "archive"
  | "presence";

export const BSD_MEMBER_TABS: { key: BsdMemberTabKey; label: string; home: string }[] = [
  { key: "vue-ensemble", label: "Vue d'ensemble", home: "/admin" },
  { key: "parametrage", label: "Paramétrage", home: "/admin/objectifs" },
  { key: "planification", label: "Planification", home: "/admin/planification/pao" },
  { key: "suivi", label: "Suivi", home: "/admin/suivi/pao" },
  { key: "finances", label: "Finances", home: "/admin/finances" },
  { key: "statistiques", label: "Statistiques", home: "/admin/stats" },
  { key: "workflow", label: "Workflow", home: "/admin/workflow" },
  { key: "export", label: "Export", home: "/admin/export" },
  { key: "archive", label: "Archive", home: "/admin/archive" },
  { key: "presence", label: "Présence", home: "/admin/presence/personnel" },
];

const TAB_MATCHERS: Record<BsdMemberTabKey, (path: string) => boolean> = {
  "vue-ensemble": (path) => path === "/admin",
  parametrage: (path) =>
    path === "/admin/plan-action" ||
    path.startsWith("/admin/plan-action/") ||
    path.startsWith("/admin/objectifs") ||
    path.startsWith("/admin/taches") ||
    path.startsWith("/admin/projets") ||
    path.startsWith("/admin/directions"),
  planification: (path) =>
    path === "/admin/planification" || path.startsWith("/admin/planification/"),
  suivi: (path) => path === "/admin/suivi" || path.startsWith("/admin/suivi/"),
  finances: (path) => path === "/admin/finances" || path.startsWith("/admin/finances/"),
  statistiques: (path) => path === "/admin/stats" || path.startsWith("/admin/stats/"),
  workflow: (path) => path === "/admin/workflow" || path.startsWith("/admin/workflow/"),
  export: (path) => path === "/admin/export" || path.startsWith("/admin/export/"),
  archive: (path) => path === "/admin/archive" || path.startsWith("/admin/archive/"),
  presence: (path) => path === "/admin/presence" || path.startsWith("/admin/presence/"),
};

export function tabsAllowPath(tabs: string[] | undefined | null, pathname: string): boolean {
  const path = pathname.split("?")[0];
  const selected = new Set(tabs ?? []);
  return BSD_MEMBER_TABS.some((tab) => selected.has(tab.key) && TAB_MATCHERS[tab.key](path));
}

export function defaultHomeForTabs(tabs: string[] | undefined | null): string {
  const selected = new Set(tabs ?? []);
  const first = BSD_MEMBER_TABS.find((tab) => selected.has(tab.key));
  return first?.home ?? "/admin/profil";
}

export function bsdTabLabels(tabs: string[] | undefined | null): string[] {
  const selected = new Set(tabs ?? []);
  return BSD_MEMBER_TABS.filter((tab) => selected.has(tab.key)).map((tab) => tab.label);
}
