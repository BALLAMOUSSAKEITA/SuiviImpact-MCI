import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  display?: boolean;
  actions?: React.ReactNode;
  hero?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  display = false,
  actions,
  hero = true,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        hero && "page-hero",
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-ink">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "text-graphite",
            display
              ? "font-display text-2xl leading-tight sm:text-[32px] lg:text-[38px] lg:leading-[1.25]"
              : "font-display text-xl sm:text-2xl",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-slate sm:text-[0.9375rem]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}

interface PageToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function PageToolbar({ children, className }: PageToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}
