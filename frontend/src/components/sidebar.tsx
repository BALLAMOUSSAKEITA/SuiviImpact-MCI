"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FolderArchive,
  FolderKanban,
  GitBranch,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  ShoppingCart,
  Target,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  defaultChild?: string;
  adminOnly?: boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: Home },
  {
    href: "/admin/plan-action",
    label: "Plan d'Action",
    icon: LayoutDashboard,
    children: [
      { href: "/admin/objectifs", label: "Objectifs", icon: Target },
      { href: "/admin/taches", label: "Tâches", icon: ClipboardList },
      { href: "/admin/projets", label: "Projets", icon: FolderKanban },
    ],
  },
  {
    href: "/admin/planification",
    label: "Planification",
    icon: CalendarDays,
    children: [
      { href: "/admin/planification/pao", label: "PAO", icon: ClipboardList },
      { href: "/admin/planification/projet", label: "Projet", icon: FolderKanban },
    ],
  },
  { href: "/admin/suivi", label: "Suivi", icon: ClipboardList, defaultChild: "/admin/suivi/1" },
  { href: "/admin/recommandation", label: "RCC", icon: Briefcase, defaultChild: "/admin/recommandation/1" },
  { href: "/admin/mission", label: "Missions", icon: MapPin, defaultChild: "/admin/mission/1" },
  { href: "/admin/ppm", label: "PPM", icon: ShoppingCart },
  { href: "/admin/indicateurs", label: "Indicateurs", icon: BarChart3 },
  { href: "/admin/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/workflow", label: "Workflow", icon: GitBranch },
  { href: "/admin/export", label: "Export", icon: Download },
  { href: "/admin/archive", label: "Archive", icon: FolderArchive },
  { href: "/admin/comptes", label: "Comptes", icon: Users, adminOnly: true },
];

interface SidebarProps {
  mobileOpen?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({
  mobileOpen = false,
  collapsed = false,
  onToggleCollapsed,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isGroupActive = (item: NavItem) => {
    if (!item.children?.length) return false;
    return item.children.some((c) => isActive(c.href));
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [flyoutHref, setFlyoutHref] = useState<string | null>(null);

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children && isGroupActive(item)) {
        setExpanded((prev) => ({ ...prev, [item.href]: true }));
      }
    });
  }, [pathname]);

  useEffect(() => {
    setFlyoutHref(null);
  }, [pathname, collapsed]);

  const narrow = collapsed && !mobileOpen;

  const handleLogout = () => {
    onNavigate?.();
    logout();
  };

  const navLinkClass = (active: boolean) =>
    cn(
      "group relative flex items-center rounded-[var(--radius-card)] text-[13px] font-medium transition-all duration-[var(--duration-fast)]",
      narrow ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
      active
        ? "bg-forest-ink/[0.08] text-forest-ink shadow-sm"
        : "text-slate hover:bg-veil/80 hover:text-graphite",
    );

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-cloud/80 bg-white",
        "fixed inset-y-0 left-0 z-50 transition-[width,transform] duration-300 ease-[var(--ease-out-expo)] lg:static lg:translate-x-0",
        narrow ? "w-[72px]" : "w-[272px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      {/* En-tête */}
      <div
        className={cn(
          "relative overflow-hidden border-b border-cloud/60",
          narrow ? "px-2 py-4" : "px-5 py-5",
        )}
      >
        <div className="absolute inset-0 grain-gradient opacity-60" />
        <div className="relative flex items-start justify-between gap-2">
          <div className={cn("min-w-0 flex-1", narrow && "flex justify-center")}>
            {narrow ? (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] bg-forest-ink text-xs font-bold text-white"
                title={BRAND.appName}
              >
                SI
              </div>
            ) : (
              <>
                <p className="text-[10px] font-semibold uppercase leading-tight tracking-wider text-fog">
                  {BRAND.ministryShort}
                </p>
                <p className="mt-1.5 text-base font-bold text-forest-ink tracking-tight">
                  {BRAND.appName}
                </p>
                <p className="text-[11px] text-ash">
                  {BRAND.bureauShort} · {BRAND.program}
                </p>
              </>
            )}
          </div>
          {!narrow && onToggleCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden shrink-0 rounded-[var(--radius-card)] p-1.5 text-ash transition-colors hover:bg-veil hover:text-graphite lg:flex"
              aria-label="Replier le menu"
              title="Replier le menu"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        <div
          className={cn(
            "mt-4 flex items-center border-t border-cloud/60 pt-4",
            narrow ? "justify-center" : "gap-3",
          )}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-ink/10 text-forest-ink"
            title={user?.prenom ?? "Utilisateur"}
          >
            <span className="text-sm font-bold">{user?.prenom?.charAt(0) ?? "U"}</span>
          </div>
          {!narrow && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-graphite">{user?.prenom}</p>
              <p className="text-[11px] text-ash">
                {user?.type_acces === "ecriture" ? "Accès édition" : "Accès lecture"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-0.5 overflow-y-auto py-4", narrow ? "px-2" : "px-3")}>
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            if (item.children) {
              const sectionActive = isGroupActive(item);
              const isOpen = expanded[item.href] ?? sectionActive;

              if (narrow) {
                return (
                  <div key={item.href} className="relative">
                    <button
                      type="button"
                      title={item.label}
                      aria-expanded={flyoutHref === item.href}
                      onClick={() =>
                        setFlyoutHref((v) => (v === item.href ? null : item.href))
                      }
                      className={navLinkClass(sectionActive)}
                    >
                      {sectionActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-forest-ink" />
                      )}
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          sectionActive ? "text-forest-ink" : "text-ash group-hover:text-slate",
                        )}
                        strokeWidth={sectionActive ? 2.25 : 1.75}
                      />
                    </button>
                    {flyoutHref === item.href && (
                      <>
                        <button
                          type="button"
                          aria-label="Fermer le sous-menu"
                          className="fixed inset-0 z-40"
                          onClick={() => setFlyoutHref(null)}
                        />
                        <div className="absolute left-full top-0 z-50 ml-2 min-w-[180px] rounded-[var(--radius-card)] border border-cloud bg-white py-1.5 shadow-[var(--shadow-elevated)]">
                          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-fog">
                            {item.label}
                          </p>
                          {item.children.map(({ href, label, icon: ChildIcon }) => {
                            const childActive = isActive(href);
                            return (
                              <Link
                                key={href}
                                href={href}
                                onClick={() => {
                                  setFlyoutHref(null);
                                  onNavigate?.();
                                }}
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium transition-colors",
                                  childActive
                                    ? "bg-forest-ink/[0.08] text-forest-ink"
                                    : "text-slate hover:bg-veil",
                                )}
                              >
                                <ChildIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                                {label}
                              </Link>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              }

              return (
                <div key={item.href}>
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [item.href]: !(prev[item.href] ?? sectionActive),
                      }))
                    }
                    className={cn(navLinkClass(sectionActive), "w-full")}
                  >
                    {sectionActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-forest-ink" />
                    )}
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        sectionActive ? "text-forest-ink" : "text-ash group-hover:text-slate",
                      )}
                      strokeWidth={sectionActive ? 2.25 : 1.75}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-ash transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="ml-5 mt-0.5 space-y-0.5 border-l border-cloud/80 pl-3">
                      {item.children.map(({ href, label, icon: ChildIcon }) => {
                        const childActive = isActive(href);
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={onNavigate}
                            className={cn(
                              "flex items-center gap-2.5 rounded-[var(--radius-card)] px-2.5 py-2 text-[12.5px] font-medium transition-all duration-[var(--duration-fast)]",
                              childActive ? "text-forest-ink" : "text-ash hover:text-graphite",
                            )}
                          >
                            <ChildIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.defaultChild ?? item.href}
                onClick={onNavigate}
                title={narrow ? item.label : undefined}
                className={navLinkClass(active)}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-forest-ink" />
                )}
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    active ? "text-forest-ink" : "text-ash group-hover:text-slate",
                  )}
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {!narrow && item.label}
              </Link>
            );
          })}
      </nav>

      {/* Pied */}
      <div className={cn("border-t border-cloud/60 p-3", narrow && "px-2")}>
        {narrow && onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="mb-2 flex w-full items-center justify-center rounded-[var(--radius-card)] p-2 text-ash transition-colors hover:bg-veil hover:text-graphite"
            aria-label="Déplier le menu"
            title="Déplier le menu"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <Button
          variant="ghost"
          className={cn(
            "text-[13px] text-ash hover:text-red-600",
            narrow ? "h-10 w-full justify-center px-0" : "w-full justify-start gap-2.5",
          )}
          onClick={handleLogout}
          title={narrow ? "Déconnexion" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!narrow && "Déconnexion"}
        </Button>
      </div>
    </aside>
  );
}
