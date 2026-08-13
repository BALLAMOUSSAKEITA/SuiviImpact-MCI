import { cn } from "@/lib/utils";
import Link from "next/link";

export function PageBackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("text-sm font-medium text-graphite hover:underline", className)}
    >
      {children}
    </Link>
  );
}

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
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "font-display text-graphite",
            eyebrow && "mt-2",
            display
              ? "text-[1.85rem] font-semibold leading-[1.18] sm:text-[2.15rem]"
              : "text-[1.55rem] font-semibold leading-[1.22] sm:text-[1.75rem]",
          )}
        >
          {title}
        </h1>
        <span className="mt-3 block h-[3px] w-12 bg-forest-ink" aria-hidden />
        {description && (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate">
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
