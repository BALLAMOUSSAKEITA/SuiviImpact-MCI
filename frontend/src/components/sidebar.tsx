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
  LayoutDashboard,
  LogOut,
  MapPin,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Plan d'Action", icon: LayoutDashboard },
  { href: "/admin/oct", label: "OCT 2025", icon: Target },
  { href: "/admin/omt", label: "OMT 2026", icon: Target },
  { href: "/admin/olt", label: "OLT 2027", icon: Target },
  { href: "/admin/planification", label: "Planification", icon: CalendarDays },
  { href: "/admin/suivi", label: "Suivi", icon: ClipboardList, defaultChild: "/admin/suivi/1" },
  { href: "/admin/recommandation", label: "RCC", icon: Briefcase, defaultChild: "/admin/recommandation/1" },
  { href: "/admin/mission", label: "Missions", icon: MapPin, defaultChild: "/admin/mission/1" },
  { href: "/admin/ppm", label: "PPM", icon: ShoppingCart },
  { href: "/admin/projets", label: "Projets", icon: TrendingUp },
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
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    onNavigate?.();
    logout();
  };

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-r border-cloud bg-paper",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="border-b border-cloud px-5 py-5">
        <p className="text-[10px] font-medium uppercase leading-tight tracking-wide text-fog">
          {BRAND.ministryShort}
        </p>
        <p className="mt-1 text-base font-semibold text-forest-ink">{BRAND.appName}</p>
        <p className="text-[11px] text-ash">{BRAND.bureauShort} · {BRAND.program}</p>
        <div className="mt-3 border-t border-cloud pt-3">
          <p className="text-sm font-medium text-slate">{user?.prenom}</p>
          <p className="text-xs text-ash">
            {user?.type_acces === "ecriture" ? "Accès édition" : "Accès lecture"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map(({ href, label, icon: Icon, defaultChild }) => (
            <Link
              key={href}
              href={defaultChild ?? href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-card px-3 py-2 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-veil text-forest-ink"
                  : "text-slate hover:bg-veil hover:text-graphite",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
      </nav>

      <div className="border-t border-cloud p-4">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
