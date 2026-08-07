"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "suiviimpact-sidebar-collapsed";

interface AdminShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminShell({ children, className }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed, hydrated]);

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

  const toggleCollapsed = () => setCollapsed((v) => !v);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-obsidian/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-cloud/60 bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-card)] text-slate transition-all hover:bg-veil hover:text-graphite active:scale-95"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-forest-ink tracking-tight">
              {BRAND.appName}
            </p>
            <p className="truncate text-[11px] text-ash">
              {BRAND.bureauShort} · {BRAND.program}
            </p>
          </div>
        </header>

        <main
          className={cn(
            "min-w-0 flex-1 space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8 xl:p-10",
            "animate-fade-in",
            className,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
