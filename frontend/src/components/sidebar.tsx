"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Download,
  FolderArchive,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MapPin,
  ShoppingCart,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const PLAN_ACTION_PREFIXES = [
  "/admin",
  "/admin/objectifs",
  "/admin/taches",
  "/admin/projets",
  "/activite",
];

type NavLink = {
  href: string;
  label: string;
  exact?: boolean;
  defaultChild?: string;
  adminOnly?: boolean;
};

type SubNavLink = NavLink & { icon: LucideIcon };

type ModuleNavLink = NavLink & { icon: LucideIcon };

const planActionLinks: SubNavLink[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/admin/objectifs", label: "Objectifs", icon: Target },
  { href: "/admin/taches", label: "Tâches", icon: ListTodo },
  { href: "/admin/projets", label: "Projets", icon: FolderKanban },
];

const moduleLinks: ModuleNavLink[] = [
  { href: "/admin/planification", label: "Planification", icon: CalendarDays },
  { href: "/admin/suivi", label: "Suivi", icon: ClipboardList, defaultChild: "/admin/suivi/1" },
  {
    href: "/admin/recommandation",
    label: "RCC",
    icon: Briefcase,
    defaultChild: "/admin/recommandation/1",
  },
  { href: "/admin/mission", label: "Missions", icon: MapPin, defaultChild: "/admin/mission/1" },
  { href: "/admin/ppm", label: "PPM", icon: ShoppingCart },
  { href: "/admin/indicateurs", label: "Indicateurs", icon: BarChart3 },
  { href: "/admin/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/export", label: "Export", icon: Download },
  { href: "/admin/archive", label: "Archive", icon: FolderArchive },
  { href: "/admin/comptes", label: "Comptes", icon: Users, adminOnly: true },
];

function isPlanActionPath(pathname: string) {
  if (pathname === "/admin") return true;
  return PLAN_ACTION_PREFIXES.some(
    (prefix) => prefix !== "/admin" && (pathname === prefix || pathname.startsWith(`${prefix}/`)),
  );
}

interface SidebarProps {
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [planOpen, setPlanOpen] = useState(() => isPlanActionPath(pathname));

  useEffect(() => {
    if (isPlanActionPath(pathname)) {
      setPlanOpen(true);
    }
  }, [pathname]);

  const linkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    onNavigate?.();
    logout();
  };

  const planSectionActive = isPlanActionPath(pathname);

  return (
    <aside
      className={cn(
        "sidebar-shell flex w-[17.5rem] shrink-0 flex-col",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="sidebar-brand px-5 py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/70">
          {BRAND.ministryShort}
        </p>
        <p className="mt-1 font-display text-lg leading-tight text-paper">{BRAND.appName}</p>
        <p className="mt-1 text-[11px] text-paper/80">
          {BRAND.bureauShort} · {BRAND.program}
        </p>
        <div className="mt-4 rounded-card border border-paper/15 bg-paper/10 px-3 py-2.5 backdrop-blur-sm">
          <p className="text-sm font-medium text-paper">{user?.prenom}</p>
          <p className="text-[11px] text-paper/75">
            {user?.type_acces === "ecriture" ? "Accès édition" : "Accès lecture"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div>
          <button
            type="button"
            onClick={() => setPlanOpen((v) => !v)}
            className={cn(
              "sidebar-group-trigger w-full",
              planSectionActive && "sidebar-group-trigger-active",
            )}
            aria-expanded={planOpen}
          >
            <span className="flex items-center gap-3">
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Plan d&apos;Action
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-fog transition-transform duration-200",
                planOpen && "rotate-180",
              )}
            />
          </button>

          {planOpen && (
            <ul className="sidebar-subnav mt-1 space-y-0.5 border-l border-cloud/80 pl-3 ml-4">
              {planActionLinks.map(({ href, label, icon: Icon, exact }) => {
                const active = linkActive(href, exact);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={cn("sidebar-subnav-link", active && "sidebar-subnav-link-active")}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <p className="sidebar-section-label px-3">Modules</p>
          <ul className="mt-2 space-y-0.5">
            {moduleLinks
              .filter((item) => !item.adminOnly || isAdmin)
              .map(({ href, label, icon: Icon, defaultChild }) => {
                const active = linkActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={defaultChild ?? href}
                      onClick={onNavigate}
                      className={cn("sidebar-nav-link", active && "sidebar-nav-link-active")}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      </nav>

      <div className="border-t border-cloud/80 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-slate hover:bg-veil hover:text-graphite"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
