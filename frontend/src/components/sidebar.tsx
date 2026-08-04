"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileSpreadsheet,
  FolderArchive,
  LayoutDashboard,
  LogOut,
  Target,
  Users,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Plan d'Action", icon: LayoutDashboard },
  { href: "/admin/oct", label: "OCT 2025", icon: Target },
  { href: "/admin/omt", label: "OMT 2026", icon: Target },
  { href: "/admin/olt", label: "OLT 2027", icon: Target },
  { href: "/admin/comptes", label: "Comptes", icon: Users, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
          SuiviImpact
        </p>
        <p className="mt-1 text-sm text-zinc-600">{user?.prenom}</p>
        <p className="text-xs text-zinc-400">
          {user?.type_acces === "ecriture" ? "Éditeur" : "Visiteur"}
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href || pathname.startsWith(`${href}/`)
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

        <div className="my-4 border-t border-zinc-100" />

        <div className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400">
          <FileSpreadsheet className="h-4 w-4" />
          Exports (Sprint 7)
        </div>
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400">
          <FolderArchive className="h-4 w-4" />
          Archive (Sprint 8)
        </div>
      </nav>

      <div className="border-t border-zinc-200 p-4">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
