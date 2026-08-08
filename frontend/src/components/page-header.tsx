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
          <p className="text-xs font-medium text-slate">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "font-display text-graphite",
            display
              ? "text-[var(--text-heading)] leading-[var(--leading-heading)] sm:text-[1.75rem]"
              : "text-[var(--text-heading-sm)] leading-[1.18] tracking-[var(--tracking-heading-sm)]",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-[1.43] text-slate">
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
