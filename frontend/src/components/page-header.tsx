import { FlagMark } from "@/components/flag-stripe";
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
      className={cn("text-sm font-semibold text-[#0d4f38] hover:underline", className)}
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
  /** Filet sous le titre (désactiver si une toolbar suit immédiatement). */
  rule?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  display = false,
  actions,
  rule = true,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        rule && "border-b border-[#d4e5dc] pb-5",
        className,
      )}
    >
      <div className="flex min-w-0 gap-3.5">
        <FlagMark className="w-[6px]" />
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#009460]">
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              "font-display text-[#0d4f38]",
              eyebrow && "mt-1",
              display
                ? "text-[1.7rem] font-semibold leading-[1.18] sm:text-[1.95rem]"
                : "text-[1.4rem] font-semibold leading-[1.22] sm:text-[1.6rem]",
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#4a6b5c]">
              {description}
            </p>
          )}
        </div>
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
