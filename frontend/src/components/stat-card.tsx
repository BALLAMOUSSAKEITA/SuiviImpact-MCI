import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className={cn("p-4 sm:p-5", className)}>
      <CardHeader className="space-y-0 p-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-[var(--text-heading-sm)] font-semibold leading-[1.18] tracking-[var(--tracking-heading-sm)] text-graphite">
          {value}
        </p>
        {subtitle && <p className="mt-1 text-sm text-slate">{subtitle}</p>}
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
