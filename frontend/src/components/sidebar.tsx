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
import { Button } from "@/components/ui/button";
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
      "group relative flex items-center text-[13.5px] transition-colors duration-[var(--duration-fast)]",
      narrow ? "justify-center px-2 py-2.5" : "gap-3 px-4 py-2.5",
      active
        ? "bg-[#0d4f38] font-semibold text-white"
        : "font-medium text-slate hover:bg-[#e8f6ef] hover:text-[#0d4f38]",
    );

  return (
    <aside
      data-tour-target="sidebar"
      className={cn(
        "flex min-h-0 shrink-0 flex-col border-r border-hairline bg-white",
        "fixed inset-y-0 left-0 z-50 transition-[width,transform] duration-300 ease-[var(--ease-out-expo)] lg:static lg:h-full lg:translate-x-0",
        narrow ? "w-[72px]" : "w-[248px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div
        className={cn(
          "flex items-center bg-[#0d4f38] text-white",
          narrow ? "justify-center px-2 py-2.5" : "justify-between px-4 py-2.5",
        )}
      >
        {!narrow && (
          <p className="font-display text-[13px] font-semibold tracking-wide">
            {mobileOpen ? BRAND.appName : "Menu"}
          </p>
        )}
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="hidden h-7 w-7 items-center justify-center text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:flex"
            aria-label={narrow ? "Déplier le menu" : "Replier le menu"}
            title={narrow ? "Déplier le menu" : "Replier le menu"}
          >
            {narrow ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-0.5 overflow-y-auto py-3", narrow ? "px-1.5" : "px-0")}>
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
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          sectionActive ? "text-white" : "text-[#7a9588] group-hover:text-[#0d4f38]",
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
                                    ? "bg-[#e0f5ea] text-forest-ink"
                                    : "text-slate hover:bg-[#e0f5ea]/50",
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
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        sectionActive ? "text-white" : "text-[#7a9588] group-hover:text-[#0d4f38]",
                      )}
                      strokeWidth={sectionActive ? 2.25 : 1.75}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        sectionActive ? "text-white/70" : "text-ash",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-0.5 space-y-0.5 border-l border-hairline ml-7 pl-3">
                      {children.map(({ href, label, icon: ChildIcon }) => {
                        const childActive = isActive(href);
                        return (
                          <Link
                            key={href}
                            href={href}
                            data-tour-target={href}
                            onClick={onNavigate}
                            className={cn(
                              "relative flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] font-medium transition-all duration-[var(--duration-fast)]",
                              childActive
                                ? "bg-[#e0f5ea] font-semibold text-[#0d4f38]"
                                : "text-ash hover:bg-[#e0f5ea]/50 hover:text-graphite",
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
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    active ? "text-white" : "text-[#7a9588] group-hover:text-[#0d4f38]",
                  )}
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {!narrow && item.label}
              </Link>
            );
          })}
      </nav>

      {/* Pied */}
      <div className={cn("border-t border-hairline p-2", narrow && "px-1.5")}>
        <Button
          variant="ghost"
          className={cn(
            "text-[13px] font-medium text-slate hover:text-[#ce1126]",
            narrow ? "h-10 w-full justify-center px-0" : "w-full justify-start gap-2.5 px-3",
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
