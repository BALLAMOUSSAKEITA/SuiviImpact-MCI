import { cn } from "@/lib/utils";

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartPanel({
  title,
  subtitle,
  children,
  className,
  action,
}: ChartPanelProps) {
  return (
    <div className={cn("panel-grain flex flex-col", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-graphite">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
