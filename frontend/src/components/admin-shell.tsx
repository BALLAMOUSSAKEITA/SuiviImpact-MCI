"use client";

import { useEffect, useRef, useState } from "react";

import { FlagStripe } from "@/components/flag-stripe";
import { InstitutionalMasthead } from "@/components/institutional-masthead";
import { PlatformFooter } from "@/components/platform-footer";
import { UsageGuideHost } from "@/components/usage-guide-host";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "@/components/sidebar";
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
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <FlagStripe />
      <InstitutionalMasthead
        prenom={user?.prenom}
        nom={user?.nom}
        hasAvatar={user?.has_avatar}
        role={user?.role}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen((open) => !open)}
      />

      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-obsidian/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex min-h-0 flex-1">
        <Sidebar
          mobileOpen={mobileOpen}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          onNavigate={() => setMobileOpen(false)}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--background)]">
          <main
            data-tour-target="workspace"
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-y-auto",
              "animate-fade-in",
              className,
            )}
          >
            <div className="flex-1 space-y-5 p-4 sm:space-y-6 sm:p-6 lg:px-8 lg:py-6">
              {children}
            </div>
            <PlatformFooter />
          </main>
        </div>
      </div>
      <UsageGuideHost />
    </div>
  );
}
