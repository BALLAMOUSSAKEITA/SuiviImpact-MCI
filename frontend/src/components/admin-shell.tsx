"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { PlatformFooter } from "@/components/platform-footer";
import { UsageGuideHost } from "@/components/usage-guide-host";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "@/components/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { BRAND } from "@/lib/brand";
import {
  USAGE_GUIDE_ACTIVE_EVENT,
  USAGE_GUIDE_PREPARE_STEP_EVENT,
  type UsageGuideStepPrepareDetail,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "suiviimpact-sidebar-collapsed";

interface AdminShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminShell({ children, className }: AdminShellProps) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const collapsedBeforeGuide = useRef(false);

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

  useEffect(() => {
    const onActive = (event: Event) => {
      const { active } = (event as CustomEvent<{ active: boolean }>).detail;
      if (active) {
        setCollapsed((current) => {
          collapsedBeforeGuide.current = current;
          return false;
        });
      } else if (collapsedBeforeGuide.current) {
        setCollapsed(true);
      }
    };
    const onPrepare = (event: Event) => {
      const { openMobileSidebar } = (event as CustomEvent<UsageGuideStepPrepareDetail>)
        .detail;
      if (openMobileSidebar) setMobileOpen(true);
    };
    window.addEventListener(USAGE_GUIDE_ACTIVE_EVENT, onActive);
    window.addEventListener(USAGE_GUIDE_PREPARE_STEP_EVENT, onPrepare);
    return () => {
      window.removeEventListener(USAGE_GUIDE_ACTIVE_EVENT, onActive);
      window.removeEventListener(USAGE_GUIDE_PREPARE_STEP_EVENT, onPrepare);
    };
  }, []);

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
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-pebble text-graphite transition-colors hover:bg-hairline active:scale-95"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-graphite tracking-tight">
              {BRAND.appName}
            </p>
            <p className="truncate text-[11px] text-slate">
              {BRAND.bureauShort} · {BRAND.program}
            </p>
          </div>
          <Link
            href="/admin/profil"
            className="flex shrink-0 rounded-[8px] ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-blue/30"
            aria-label="Mon profil"
          >
            <UserAvatar
              prenom={user?.prenom ?? ""}
              nom={user?.nom}
              hasAvatar={user?.has_avatar}
              size="sm"
            />
          </Link>
        </header>

        <main
          data-tour-target="workspace"
          className={cn(
            "min-w-0 flex-1 space-y-6 p-4 sm:space-y-[var(--section-gap)] sm:p-6 lg:px-10 lg:py-8",
            "animate-fade-in",
            className,
          )}
        >
          {children}
        </main>
        <PlatformFooter />
      </div>
      <UsageGuideHost />
    </div>
  );
}
