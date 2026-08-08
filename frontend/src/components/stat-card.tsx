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

const ACCENT_STYLES: Record<
  StatAccent,
  { card: string; value: string; dot?: string }
> = {
  default: { card: "", value: "text-graphite" },
  forest: {
    card: "border-l-[3px] border-l-forest-ink bg-gradient-to-br from-mint/40 to-white",
    value: "text-forest-ink",
    dot: "bg-forest-ink",
  },
  sky: {
    card: "border-l-[3px] border-l-ice-blue bg-gradient-to-br from-sky/50 to-white",
    value: "text-carbon",
    dot: "bg-ice-blue",
  },
  mint: {
    card: "border-l-[3px] border-l-vine bg-gradient-to-br from-mint/60 to-white",
    value: "text-forest-ink",
    dot: "bg-vine",
  },
  peach: {
    card: "border-l-[3px] border-l-amber-400 bg-gradient-to-br from-peach/80 to-white",
    value: "text-carbon",
    dot: "bg-amber-400",
  },
  lavender: {
    card: "border-l-[3px] border-l-periwinkle bg-gradient-to-br from-lavender/80 to-white",
    value: "text-carbon",
    dot: "bg-periwinkle",
  },
  alert: {
    card: "border-l-[3px] border-l-[#e85d4c] bg-gradient-to-br from-red-50/80 to-white",
    value: "text-[#c0392b]",
    dot: "bg-[#e85d4c]",
  },
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
  const styles = ACCENT_STYLES[accent];

  return (
    <Card className={cn("p-4 sm:p-5 shadow-[var(--shadow-subtle)]", styles.card, className)}>
      <CardHeader className="space-y-0 p-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate">
          {styles.dot && (
            <span className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p
          className={cn(
            "text-[var(--text-heading-sm)] font-semibold leading-[1.18] tracking-[var(--tracking-heading-sm)]",
            styles.value,
          )}
        >
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

interface HeroStatProps {
  label: string;
  value: number | string;
  sublabel?: string;
  className?: string;
}

export function HeroStat({ label, value, sublabel, className }: HeroStatProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-white/70">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-white sm:text-4xl">
        {value}
      </p>
      {sublabel && (
        <p className="mt-1 text-xs text-white/60">{sublabel}</p>
      )}
    </div>
  );
}
