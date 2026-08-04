"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminShell({ children, className }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Overlay mobile */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-obsidian/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre mobile */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-cloud bg-paper px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card text-slate transition-colors hover:bg-veil hover:text-graphite"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-forest-ink">
              {BRAND.appName}
            </p>
            <p className="truncate text-[11px] text-ash">
              {BRAND.bureauShort} · {BRAND.program}
            </p>
          </div>
        </header>

        <main
          className={cn(
            "min-w-0 flex-1 space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8",
            className,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
