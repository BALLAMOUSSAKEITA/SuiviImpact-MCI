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
import {
  USAGE_GUIDE_PREPARE_STEP_EVENT,
  type UsageGuideStepPrepareDetail,
} from "@/lib/onboarding";
import { canSeeNavGroup, canSeeNavHref } from "@/lib/roles";
import { BRAND } from "@/lib/brand";
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

interface NavSection {
  id: string;
  label: string | null;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    id: "accueil",
    label: null,
    items: [{ href: "/admin", label: "Vue d'ensemble", icon: Home }],
  },
  {
    id: "metier",
    label: "Métier",
    items: [
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
          { href: "/admin/planification/indicateurs", label: "Indicateurs", icon: BarChart3 },
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
    ],
  },
  {
    id: "restitution",
    label: "Restitution",
    items: [
      { href: "/admin/stats", label: "Statistiques", icon: BarChart3 },
      { href: "/admin/workflow", label: "Workflow", icon: GitBranch },
      { href: "/admin/export", label: "Export", icon: Download },
      {
        href: "/admin/notifications",
        label: "Notifications",
        icon: Mail,
        developerOnly: true,
      },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { href: "/admin/archive", label: "Archive", icon: FolderArchive },
      { href: "/admin/profil", label: "Mon profil", icon: UserCircle },
      { href: "/admin/comptes", label: "Comptes", icon: Users, adminOnly: true },
    ],
  },
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
    navSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && isGroupActive(item)) {
          setExpanded((prev) => ({ ...prev, [item.href]: true }));
        }
      });
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

  const canSeeItem = (item: NavItem) => {
    if (item.adminOnly && user?.role !== "admin") return false;
    if (item.developerOnly && !mayAccessNotifications) return false;
    if (item.children) {
      const childHrefs = item.children.map((c) => c.href);
      return canSeeNavGroup(user?.role, item.href, childHrefs, item.adminOnly);
    }
    return canSeeNavHref(user?.role, item.href, item.adminOnly);
  };

  const visibleChildrenOf = (item: NavItem) =>
    item.children?.filter((c) => canSeeNavHref(user?.role, c.href, false)) ?? [];

  const itemClass = (active: boolean) =>
    cn(
      "group relative flex w-full items-center text-[13px] transition-colors",
      narrow ? "justify-center px-2 py-2.5" : "gap-2.5 px-3 py-[7px]",
      active
        ? "bg-white font-semibold text-graphite"
        : "font-medium text-slate hover:bg-white hover:text-graphite",
    );

  return (
    <aside
      data-tour-target="sidebar"
      className={cn(
        "flex min-h-0 shrink-0 flex-col border-r border-hairline bg-[#f6faf7]",
        "fixed inset-y-0 left-0 z-50 transition-[width,transform] duration-300 ease-[var(--ease-out-expo)] lg:static lg:h-full lg:translate-x-0",
        narrow ? "w-[68px]" : "w-[236px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-hairline bg-white",
          narrow ? "justify-center px-2 py-2.5" : "justify-between px-3 py-2.5",
        )}
      >
        {!narrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate">
            {mobileOpen ? BRAND.appName : "Navigation"}
          </p>
        )}
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="hidden h-7 w-7 items-center justify-center text-slate transition-colors hover:bg-[#f6faf7] hover:text-graphite lg:flex"
            aria-label={narrow ? "Déplier le menu" : "Replier le menu"}
            title={narrow ? "Déplier le menu" : "Replier le menu"}
          >
            {narrow ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className={cn("flex-1 overflow-y-auto py-2", narrow ? "px-1.5" : "px-0")}>
        {navSections.map((section) => {
          const visibleItems = section.items.filter(canSeeItem).filter((item) => {
            if (!item.children) return true;
            return visibleChildrenOf(item).length > 0;
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.id} className={cn(!narrow && section.label && "mt-3 first:mt-0")}>
              {section.label && !narrow && (
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a9588]">
                  {section.label}
                </p>
              )}
              {narrow && section.label && (
                <div className="mx-2 my-2 h-px bg-hairline" aria-hidden />
              )}

              {visibleItems.map((item) => {
                const children = visibleChildrenOf(item);

                if (children.length) {
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
                          className={itemClass(sectionActive)}
                        >
                          {sectionActive && (
                            <span className="absolute inset-y-1 left-0 w-[3px] bg-forest-ink" />
                          )}
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              sectionActive ? "text-forest-ink" : "text-[#7a9588]",
                            )}
                            strokeWidth={sectionActive ? 2.2 : 1.7}
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
                            <div className="dropdown-panel absolute left-full top-0 z-50 ml-1 min-w-[188px] py-1">
                              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate">
                                {item.label}
                              </p>
                              {children.map(({ href, label }) => {
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
                                      "relative block px-3 py-2 text-[13px] transition-colors",
                                      childActive
                                        ? "bg-[#f6faf7] font-semibold text-graphite"
                                        : "text-slate hover:bg-[#f6faf7] hover:text-graphite",
                                    )}
                                  >
                                    {childActive && (
                                      <span className="absolute inset-y-1 left-0 w-[3px] bg-forest-ink" />
                                    )}
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
                        className={itemClass(sectionActive)}
                      >
                        {sectionActive && (
                          <span className="absolute inset-y-1 left-0 w-[3px] bg-forest-ink" />
                        )}
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            sectionActive ? "text-forest-ink" : "text-[#7a9588]",
                          )}
                          strokeWidth={sectionActive ? 2.2 : 1.7}
                        />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 text-[#9bb5a8] transition-transform duration-200",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>

                      {isOpen && (
                        <div className="mb-1 ml-[22px] border-l border-hairline">
                          {children.map(({ href, label }) => {
                            const childActive = isActive(href);
                            return (
                              <Link
                                key={href}
                                href={href}
                                data-tour-target={href}
                                onClick={onNavigate}
                                className={cn(
                                  "relative block py-[6px] pl-3 pr-3 text-[13px] transition-colors",
                                  childActive
                                    ? "font-semibold text-graphite"
                                    : "text-slate hover:text-graphite",
                                )}
                              >
                                {childActive && (
                                  <span className="absolute inset-y-1 left-[-1px] w-[2px] bg-forest-ink" />
                                )}
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
                    className={itemClass(active)}
                  >
                    {active && (
                      <span className="absolute inset-y-1 left-0 w-[3px] bg-forest-ink" />
                    )}
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-forest-ink" : "text-[#7a9588]",
                      )}
                      strokeWidth={active ? 2.2 : 1.7}
                    />
                    {!narrow && item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className={cn("border-t border-hairline bg-white", narrow ? "p-1.5" : "p-2")}>
        <button
          type="button"
          onClick={handleLogout}
          title={narrow ? "Déconnexion" : undefined}
          className={cn(
            "flex h-9 w-full items-center text-[13px] font-medium text-slate transition-colors hover:bg-[#f6faf7] hover:text-[#ce1126]",
            narrow ? "justify-center px-0" : "justify-start gap-2.5 px-3",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!narrow && "Déconnexion"}
        </button>
      </div>
    </aside>
  );
}
