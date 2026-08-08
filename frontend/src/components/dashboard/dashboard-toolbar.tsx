"use client";

import type { LucideIcon } from "lucide-react";

import { StatsPeriodCompact } from "@/components/stats-period-compact";
import type { useStatsPeriodState } from "@/components/stats-period-filter";
import { cn } from "@/lib/utils";

type PeriodState = ReturnType<typeof useStatsPeriodState>;

interface DashboardTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardToolbarProps {
  tabs: DashboardTab[];
  currentTab: string;
  onTabChange: (id: string) => void;
  periodState: PeriodState;
  secondaryFilter?: React.ReactNode;
  className?: string;
}

export function DashboardToolbar({
  tabs,
  currentTab,
  onTabChange,
  periodState,
  secondaryFilter,
  className,
}: DashboardToolbarProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 -mx-1 space-y-3 border-b border-cloud/80 bg-[var(--background)]/90 px-1 pb-3 backdrop-blur-md sm:-mx-0 sm:px-0",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex min-w-max gap-0.5 rounded-[var(--radius-sm)] bg-veil p-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-white text-graphite shadow-[var(--shadow-subtle)]"
                      : "text-slate hover:text-graphite",
                  )}
                >
                  <Icon className="size-3.5 shrink-0 opacity-70" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end lg:self-auto">
          {secondaryFilter}
          <StatsPeriodCompact state={periodState} />
        </div>
      </div>
    </div>
  );
}
