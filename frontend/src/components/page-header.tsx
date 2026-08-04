import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  display?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  display = false,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-2", className)}>
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-widest text-forest-ink">
          {eyebrow}
        </p>
      )}
      <h1
        className={cn(
          "text-graphite",
          display
            ? "font-display text-[32px] leading-[1.25] sm:text-[38px]"
            : "text-2xl font-semibold text-graphite",
        )}
      >
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-sm leading-relaxed text-slate">
          {description}
        </p>
      )}
    </header>
  );
}
