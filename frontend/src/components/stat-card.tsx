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
  default: "text-[#0d4f38]",
  forest: "text-[#0d4f38]",
  sky: "text-[#0d4f38]",
  mint: "text-[#0d4f38]",
  peach: "text-[#0d4f38]",
  lavender: "text-[#0d4f38]",
  alert: "text-[#ce1126]",
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
        "border border-[#d4e5dc] border-l-[3px] border-l-[#0d4f38] p-4 sm:p-5",
        className,
      )}
    >
      <CardHeader className="space-y-0 p-0 pb-2">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p
          className={cn(
            "font-display text-[1.625rem] font-semibold tabular-nums leading-none",
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
