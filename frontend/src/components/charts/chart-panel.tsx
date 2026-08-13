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
    <section
      className={cn(
        "flex flex-col border border-hairline border-t-[3px] border-t-[#0d4f38] bg-white px-5 py-4",
        className,
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3 border-b border-hairline pb-3">
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-semibold text-graphite">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-slate">{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
