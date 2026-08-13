import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/execution-badge";

export type StatAccent =
  | "default"
  | "forest"
  | "sky"
  | "mint"
  | "peach"
  | "lavender"
  | "alert";

const VALUE_STYLES: Record<StatAccent, string> = {
  default: "text-graphite",
  forest: "text-graphite",
  sky: "text-graphite",
  mint: "text-graphite",
  peach: "text-graphite",
  lavender: "text-graphite",
  alert: "text-[#c0392b]",
};

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  showProgress?: boolean;
  progressValue?: number | string;
  accent?: StatAccent;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  showProgress,
  progressValue,
  accent = "default",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border border-hairline p-4 sm:p-5",
        className,
      )}
    >
      <CardHeader className="space-y-0 p-0 pb-2">
        <CardTitle className="text-xs font-medium text-slate">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p
          className={cn(
            "text-[1.625rem] font-semibold tabular-nums leading-none tracking-tight",
            VALUE_STYLES[accent],
          )}
        >
          {value}
        </p>
        {subtitle && <p className="mt-1.5 text-xs text-slate">{subtitle}</p>}
        {showProgress && progressValue != null && (
          <ProgressBar value={progressValue} className="mt-4" />
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
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
