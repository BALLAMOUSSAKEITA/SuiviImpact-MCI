import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  display?: boolean;
  actions?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  display = false,
  actions,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        "animate-fade-in",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-widest text-forest-ink/80">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "text-graphite tracking-tight",
            display
              ? "font-display text-2xl leading-tight sm:text-[32px] lg:text-[38px] lg:leading-[1.2]"
              : "text-xl font-bold sm:text-2xl",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-fog">
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
