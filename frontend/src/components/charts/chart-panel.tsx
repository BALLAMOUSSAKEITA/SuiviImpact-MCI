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
      className={cn("flex flex-col border border-[#0d4f38] bg-white", className)}
    >
      <header className="flex items-start justify-between gap-3 bg-[#0d4f38] px-5 py-2.5">
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 truncate text-[11px] text-white/70">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="shrink-0 [&_a]:text-[12px] [&_a]:font-semibold [&_a]:text-white/80 [&_a]:hover:text-white [&_a]:hover:underline [&_button]:text-[12px] [&_button]:font-semibold [&_button]:text-white/80 [&_button]:hover:text-white [&_button]:hover:underline">
            {action}
          </div>
        )}
      </header>
      <div className="min-h-0 flex-1 px-5 py-4">{children}</div>
    </section>
  );
}
