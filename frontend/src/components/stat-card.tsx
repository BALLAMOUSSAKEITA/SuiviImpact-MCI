import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/execution-badge";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  showProgress?: boolean;
  progressValue?: number | string;
  icon?: LucideIcon;
  accent?: "green" | "amber" | "red" | "blue" | "default";
  className?: string;
}

const ACCENT_STYLES = {
  green: "border-l-emerald-500",
  amber: "border-l-amber-500",
  red: "border-l-red-500",
  blue: "border-l-sky-500",
  default: "border-l-forest-ink",
} as const;

const ICON_STYLES = {
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  blue: "bg-sky-50 text-sky-600",
  default: "bg-forest-ink/8 text-forest-ink",
} as const;

export function StatCard({
  title,
  value,
  subtitle,
  showProgress,
  progressValue,
  icon: Icon,
  accent = "default",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-l-[3px] overflow-hidden",
        ACCENT_STYLES[accent],
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-medium text-fog">{title}</CardTitle>
          {Icon && (
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)]",
                ICON_STYLES[accent],
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums text-graphite tracking-tight">
          {value}
        </p>
        {subtitle && <p className="mt-1.5 text-xs text-ash">{subtitle}</p>}
        {showProgress && progressValue != null && (
          <ProgressBar value={progressValue} className="mt-3" />
        )}
      </CardContent>
    </Card>
  );
}

interface StatGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatGrid({ children, className }: StatGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
