"use client";

import { StatsPeriodCompact } from "@/components/stats-period-compact";
import type { useStatsPeriodState } from "@/components/stats-period-filter";
import { cn } from "@/lib/utils";

type PeriodState = ReturnType<typeof useStatsPeriodState>;

interface DashboardTab {
  id: string;
  label: string;
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
        "sticky top-0 z-20 border-b border-[#d4e5dc] bg-[#f6faf7]",
        className,
      )}
    >
      <div className="flex flex-col gap-3 pb-0 lg:flex-row lg:items-end lg:justify-between">
        <nav
          className="-mb-px flex gap-5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Modules du tableau de bord"
        >
          {tabs.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 border-b-[3px] pb-3 pt-1 text-sm transition-colors",
                  active
                    ? "border-[#0d4f38] font-semibold text-[#0d4f38]"
                    : "border-transparent font-medium text-slate hover:text-[#0d4f38]",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 pb-3 lg:pb-3">
          {secondaryFilter}
          <StatsPeriodCompact state={periodState} />
        </div>
      </div>
    </div>
  );
}
