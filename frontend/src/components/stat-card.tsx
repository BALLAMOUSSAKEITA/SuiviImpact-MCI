import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/execution-badge";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  showProgress?: boolean;
  progressValue?: number | string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  showProgress,
  progressValue,
  className,
}: StatCardProps) {
  return (
    <div className={cn("rounded-[var(--radius-lg)] border bg-white p-5", className)}>
      <p className="text-[13px] font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
        {value}
      </p>
      {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      {showProgress && progressValue != null && (
        <ProgressBar value={progressValue} className="mt-3" />
      )}
    </div>
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
