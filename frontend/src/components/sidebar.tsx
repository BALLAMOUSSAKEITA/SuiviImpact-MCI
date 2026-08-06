"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Download,
  FolderArchive,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MapPin,
  ShoppingCart,
  Target,
  Users,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Plan d'Action", icon: LayoutDashboard },
  { href: "/admin/objectifs", label: "Objectifs", icon: Target },
  { href: "/admin/taches", label: "Tâches", icon: ClipboardList },
  { href: "/admin/projets", label: "Projets", icon: FolderKanban },
  { href: "/admin/planification", label: "Planification", icon: CalendarDays },
  { href: "/admin/suivi", label: "Suivi", icon: ClipboardList, defaultChild: "/admin/suivi/1" },
  { href: "/admin/recommandation", label: "RCC", icon: Briefcase, defaultChild: "/admin/recommandation/1" },
  { href: "/admin/mission", label: "Missions", icon: MapPin, defaultChild: "/admin/mission/1" },
  { href: "/admin/ppm", label: "PPM", icon: ShoppingCart },
  { href: "/admin/indicateurs", label: "Indicateurs", icon: BarChart3 },
  { href: "/admin/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/export", label: "Export", icon: Download },
  { href: "/admin/archive", label: "Archive", icon: FolderArchive },
  { href: "/admin/comptes", label: "Comptes", icon: Users, adminOnly: true },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    onNavigate?.();
    logout();
  };

  return (
    <aside
      className={cn(
        "flex w-[272px] shrink-0 flex-col border-r border-cloud/80 bg-white",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-[var(--ease-out-expo)] lg:static lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      {/* En-tête sidebar */}
      <div className="relative overflow-hidden border-b border-cloud/60 px-5 py-5">
        <div className="absolute inset-0 grain-gradient opacity-60" />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase leading-tight tracking-wider text-fog">
            {BRAND.ministryShort}
          </p>
          <p className="mt-1.5 text-base font-bold text-forest-ink tracking-tight">
            {BRAND.appName}
          </p>
          <p className="text-[11px] text-ash">{BRAND.bureauShort} · {BRAND.program}</p>

          <div className="mt-4 flex items-center gap-3 border-t border-cloud/60 pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-ink/10 text-forest-ink">
              <span className="text-sm font-bold">{user?.prenom?.charAt(0) ?? "U"}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-graphite">{user?.prenom}</p>
              <p className="text-[11px] text-ash">
                {user?.type_acces === "ecriture" ? "Accès édition" : "Accès lecture"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map(({ href, label, icon: Icon, defaultChild }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={defaultChild ?? href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-[var(--radius-card)] px-3 py-2.5 text-[13px] font-medium transition-all duration-[var(--duration-fast)]",
                  active
                    ? "bg-forest-ink/[0.08] text-forest-ink shadow-sm"
                    : "text-slate hover:bg-veil/80 hover:text-graphite",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-forest-ink" />
                )}
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    active ? "text-forest-ink" : "text-ash group-hover:text-slate",
                  )}
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {label}
              </Link>
            );
          })}
      </nav>

      {/* Déconnexion */}
      <div className="border-t border-cloud/60 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 text-[13px] text-ash hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
