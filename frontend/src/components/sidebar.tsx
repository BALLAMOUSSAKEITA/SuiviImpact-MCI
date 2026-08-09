"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Building2,
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
  Mail,
  MapPin,
  ShoppingCart,
  Target,
  UserCircle,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import {
  USAGE_GUIDE_PREPARE_STEP_EVENT,
  type UsageGuideStepPrepareDetail,
} from "@/lib/onboarding";
import { canSeeNavGroup, canSeeNavHref, ROLE_LABELS } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  defaultChild?: string;
  adminOnly?: boolean;
  developerOnly?: boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: Home },
  {
    href: "/admin/plan-action",
    label: "Paramétrage",
    icon: LayoutDashboard,
    children: [
      { href: "/admin/objectifs", label: "Objectifs", icon: Target },
      { href: "/admin/taches", label: "Tâches", icon: ClipboardList },
      { href: "/admin/projets", label: "Projets", icon: FolderKanban },
      { href: "/admin/directions", label: "Directions", icon: Building2 },
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
  {
    href: "/admin/suivi",
    label: "Suivi",
    icon: ClipboardList,
    children: [
      { href: "/admin/suivi/pao", label: "PAO", icon: ClipboardList },
      { href: "/admin/suivi/projet", label: "Projet", icon: FolderKanban },
      { href: "/admin/suivi/rcc", label: "RCC", icon: Briefcase },
      { href: "/admin/suivi/missions", label: "Missions", icon: MapPin },
      { href: "/admin/suivi/ppm", label: "PPM", icon: ShoppingCart },
      { href: "/admin/suivi/indicateurs", label: "Indicateurs", icon: BarChart3 },
    ],
  },
  { href: "/admin/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/workflow", label: "Workflow", icon: GitBranch },
  { href: "/admin/export", label: "Export", icon: Download },
  {
    href: "/admin/notifications",
    label: "Notifications",
    icon: Mail,
    developerOnly: true,
  },
  { href: "/admin/archive", label: "Archive", icon: FolderArchive },
  { href: "/admin/profil", label: "Mon profil", icon: UserCircle },
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
  const { user, logout, canAccessNotifications: mayAccessNotifications } = useAuth();

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

  useEffect(() => {
    const onPrepare = (event: Event) => {
      const { expandNav } = (event as CustomEvent<UsageGuideStepPrepareDetail>).detail;
      if (expandNav) {
        setExpanded((prev) => ({ ...prev, [expandNav]: true }));
      }
    };
    window.addEventListener(USAGE_GUIDE_PREPARE_STEP_EVENT, onPrepare);
    return () => window.removeEventListener(USAGE_GUIDE_PREPARE_STEP_EVENT, onPrepare);
  }, []);

  const narrow = collapsed && !mobileOpen;

  const handleLogout = () => {
    onNavigate?.();
    logout();
  };

  const navLinkClass = (active: boolean) =>
    cn(
      "group relative flex items-center rounded-[var(--radius-sm)] text-sm font-medium transition-colors duration-[var(--duration-fast)]",
      narrow ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
      active
        ? "text-graphite"
        : "text-slate hover:bg-veil hover:text-graphite",
    );

  return (
    <aside
      data-tour-target="sidebar"
      className={cn(
        "flex shrink-0 flex-col border-r border-cloud bg-white",
        "fixed inset-y-0 left-0 z-50 transition-[width,transform] duration-300 ease-[var(--ease-out-expo)] lg:static lg:translate-x-0",
        narrow ? "w-[72px]" : "w-[272px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      {/* En-tête */}
      <div
        className={cn(
          "border-b border-cloud",
          narrow ? "px-2 py-4" : "px-5 py-5",
        )}
      >
        <div className="flex items-start justify-between gap-2">
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
                <p className="text-xs font-medium leading-tight text-slate">
                  {BRAND.ministryShort}
                </p>
                <p className="mt-1 text-base font-semibold text-graphite tracking-tight">
                  {BRAND.appName}
                </p>
                <p className="text-xs text-slate">
                  {BRAND.bureauShort} · {BRAND.program}
                </p>
              </>
            )}
          </div>
          {!narrow && onToggleCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-veil text-graphite transition-colors hover:bg-cloud lg:flex"
              aria-label="Replier le menu"
              title="Replier le menu"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        <Link
          href="/admin/profil"
          onClick={onNavigate}
          title="Mon profil"
          aria-label="Mon profil"
          className={cn(
            "mt-4 flex items-center border-t border-cloud pt-4 transition-colors hover:bg-veil rounded-[var(--radius-sm)]",
            narrow ? "justify-center px-1 py-2" : "gap-3 px-1 py-1",
            pathname.startsWith("/admin/profil") && "bg-veil",
          )}
        >
          <UserAvatar
            prenom={user?.prenom ?? ""}
            nom={user?.nom}
            hasAvatar={user?.has_avatar}
            size="sm"
          />
          {!narrow && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-graphite">
                {[user?.prenom, user?.nom].filter(Boolean).join(" ") || "Profil"}
              </p>
              <p className="text-[11px] text-ash">
                {user ? ROLE_LABELS[user.role] : "Mon profil"} ·{" "}
                <span className="text-forest-ink">Voir le profil</span>
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-0.5 overflow-y-auto py-4", narrow ? "px-2" : "px-3")}>
        {navItems
          .filter((item) => {
            if (item.adminOnly && user?.role !== "admin") return false;
            if (item.developerOnly && !mayAccessNotifications) return false;
            if (item.children) {
              const childHrefs = item.children.map((c) => c.href);
              return canSeeNavGroup(user?.role, item.href, childHrefs, item.adminOnly);
            }
            return canSeeNavHref(user?.role, item.href, item.adminOnly);
          })
          .map((item) => {
            const visibleChildren = item.children?.filter((c) =>
              canSeeNavHref(user?.role, c.href, false),
            );
            if (item.children && (!visibleChildren || visibleChildren.length === 0)) {
              return null;
            }
            const children = visibleChildren ?? item.children;

            if (children?.length) {
              const sectionActive = children.some((c) => isActive(c.href));
              const isOpen = expanded[item.href] ?? sectionActive;

              if (narrow) {
                return (
                  <div key={item.href} className="relative">
                    <button
                      type="button"
                      title={item.label}
                      data-tour-target={item.href}
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
                        <div className="dropdown-panel absolute left-full top-0 z-50 ml-2 min-w-[180px] py-1.5">
                          <p className="px-3 py-1.5 text-xs font-semibold text-slate">
                            {item.label}
                          </p>
                          {children.map(({ href, label, icon: ChildIcon }) => {
                            const childActive = isActive(href);
                            return (
                              <Link
                                key={href}
                                href={href}
                                data-tour-target={href}
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
                    data-tour-target={item.href}
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
                      {children.map(({ href, label, icon: ChildIcon }) => {
                        const childActive = isActive(href);
                        return (
                          <Link
                            key={href}
                            href={href}
                            data-tour-target={href}
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
                data-tour-target={item.href}
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
            className="mb-2 flex h-10 w-full items-center justify-center rounded-full bg-veil text-graphite transition-colors hover:bg-cloud"
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
