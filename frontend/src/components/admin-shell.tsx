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
    <div className="admin-canvas flex min-h-screen">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-obsidian/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-cloud bg-midnight-navy/90 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-warm-sand transition-colors hover:bg-veil hover:text-canvas-white"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-canvas-white">{BRAND.appName}</p>
            <p className="truncate font-mono-label text-[10px] text-silver-mist">
              {BRAND.bureauShort} · {BRAND.program}
            </p>
          </div>
        </header>

        <main
          className={cn(
            "relative min-w-0 flex-1 space-y-8 p-4 sm:p-6 lg:mx-auto lg:max-w-[1280px] lg:p-8 lg:py-10",
            className,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
