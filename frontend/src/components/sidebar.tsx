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
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  defaultChild?: string;
}

interface NavSection {
  label?: string;
  adminOnly?: boolean;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { href: "/admin", label: "Plan d'Action", icon: LayoutDashboard },
      { href: "/admin/objectifs", label: "Objectifs", icon: Target },
      { href: "/admin/taches", label: "Tâches", icon: ClipboardList },
      { href: "/admin/projets", label: "Projets", icon: FolderKanban },
    ],
  },
  {
    label: "Suivi",
    items: [
      { href: "/admin/planification", label: "Planification", icon: CalendarDays },
      { href: "/admin/suivi", label: "Suivi PAO", icon: ClipboardList, defaultChild: "/admin/suivi/1" },
      { href: "/admin/recommandation", label: "RCC", icon: Briefcase, defaultChild: "/admin/recommandation/1" },
      { href: "/admin/mission", label: "Missions", icon: MapPin, defaultChild: "/admin/mission/1" },
      { href: "/admin/ppm", label: "PPM", icon: ShoppingCart },
    ],
  },
  {
    label: "Analyse",
    items: [
      { href: "/admin/indicateurs", label: "Indicateurs", icon: BarChart3 },
      { href: "/admin/stats", label: "Statistiques", icon: BarChart3 },
      { href: "/admin/export", label: "Export", icon: Download },
      { href: "/admin/archive", label: "Archive", icon: FolderArchive },
    ],
  },
  {
    label: "Admin",
    adminOnly: true,
    items: [
      { href: "/admin/comptes", label: "Comptes", icon: Users },
    ],
  },
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

  return (
    <aside
      className={cn(
        "flex w-[240px] shrink-0 flex-col border-r bg-[var(--sidebar-bg)]",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex items-center gap-3 border-b px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] bg-primary text-white text-xs font-bold">
          SI
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{BRAND.appName}</p>
          <p className="text-[11px] text-gray-500">{BRAND.bureauShort} · {BRAND.program}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navSections
          .filter((section) => !section.adminOnly || isAdmin)
          .map((section, idx) => (
            <div key={idx} className={cn(idx > 0 && "mt-5")}>
              {section.label && (
                <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  {section.label}
                </p>
              )}
              {section.items.map(({ href, label, icon: Icon, defaultChild }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={defaultChild ?? href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-[7px] text-[13px] transition-colors duration-75",
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
      </nav>

      <div className="border-t px-3 py-3">
        <div className="mb-2 flex items-center gap-2.5 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-[11px] font-medium text-gray-600">
            {user?.prenom?.charAt(0) ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-gray-800">{user?.prenom}</p>
            <p className="text-[11px] text-gray-400">
              {user?.type_acces === "ecriture" ? "Édition" : "Lecture"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { onNavigate?.(); logout(); }}
          className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-[7px] text-[13px] text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
