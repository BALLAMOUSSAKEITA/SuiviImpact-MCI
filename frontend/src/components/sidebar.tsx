"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  ChevronRight,
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

const navGroups: {
  label: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    defaultChild?: string;
    adminOnly?: boolean;
  }[];
}[] = [
  {
    label: "Vue d'ensemble",
    items: [{ href: "/admin", label: "Tableau de bord", icon: LayoutDashboard }],
  },
  {
    label: "Plan d'action",
    items: [
      { href: "/admin/oct", label: "OCT 2025", icon: Target },
      { href: "/admin/omt", label: "OMT 2026", icon: Target },
      { href: "/admin/olt", label: "OLT 2027", icon: Target },
      { href: "/admin/planification", label: "Planification", icon: CalendarDays },
    ],
  },
  {
    label: "Exécution",
    items: [
      { href: "/admin/suivi", label: "Suivi PAO", icon: ClipboardList, defaultChild: "/admin/suivi/1" },
      { href: "/admin/recommandation", label: "RCC", icon: Briefcase, defaultChild: "/admin/recommandation/1" },
      { href: "/admin/mission", label: "Missions", icon: MapPin, defaultChild: "/admin/mission/1" },
    ],
  },
  {
    label: "Pilotage",
    items: [
      { href: "/admin/ppm", label: "PPM", icon: ShoppingCart },
      { href: "/admin/projets", label: "Projets", icon: TrendingUp },
      { href: "/admin/indicateurs", label: "Indicateurs", icon: BarChart3 },
      { href: "/admin/stats", label: "Statistiques", icon: BarChart3 },
      { href: "/admin/export", label: "Export", icon: Download },
      { href: "/admin/archive", label: "Archive", icon: FolderArchive },
    ],
  },
  {
    label: "Administration",
    items: [{ href: "/admin/comptes", label: "Comptes", icon: Users, adminOnly: true }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-ash bg-canvas-white">
      <div className="border-b border-ash px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-btn)] bg-midnight-ink text-[10px] font-bold text-canvas-white">
            SI
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal">{BRAND.appName}</p>
            <p className="truncate text-[10px] text-fog">{BRAND.bureauShort} · {BRAND.program}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => {
          const items = group.items.filter((item) => !item.adminOnly || isAdmin);
          if (items.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-silver">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {items.map(({ href, label, icon: Icon, defaultChild }) => {
                  const active = isActive(href);
                  return (
                    <li key={href}>
                      <Link
                        href={defaultChild ?? href}
                        className={cn(
                          "group flex items-center gap-2 rounded-[var(--radius-btn)] px-2 py-2 text-[13px] font-medium transition-colors",
                          active
                            ? "bg-sky-soft text-charcoal"
                            : "text-steel hover:bg-paper-mist hover:text-charcoal",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-electric-blue" : "text-fog",
                          )}
                          strokeWidth={1.75}
                        />
                        <span className="flex-1 truncate">{label}</span>
                        {active && (
                          <ChevronRight className="h-3.5 w-3.5 text-electric-blue opacity-60" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-ash p-3">
        <div className="mb-2 rounded-[var(--radius-card)] bg-paper-mist px-3 py-2">
          <p className="truncate text-sm font-medium text-charcoal">{user?.prenom}</p>
          <p className="text-[11px] text-fog">
            {user?.type_acces === "ecriture" ? "Édition" : "Lecture"}
            {isAdmin ? " · Admin" : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-steel"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
