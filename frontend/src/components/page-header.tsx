import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  display?: boolean;
  actions?: React.ReactNode;
  hero?: boolean;
  aurora?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  display = false,
  actions,
  hero = true,
  aurora = false,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        hero && "page-hero",
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      {aurora && <div className="aurora-ribbon aurora-ribbon-sm" aria-hidden />}
      <div className="relative z-[1] min-w-0 space-y-2">
        {eyebrow && <p className="font-mono-label text-bioluminescent-teal">{eyebrow}</p>}
        <h1
          className={cn(
            "text-canvas-white",
            display
              ? "font-display text-[2rem] leading-none sm:text-[2.5rem] lg:text-[3rem] lg:tracking-[-0.02em]"
              : "font-display text-xl sm:text-[1.75rem]",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-warm-sand sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="relative z-[1] flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
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
