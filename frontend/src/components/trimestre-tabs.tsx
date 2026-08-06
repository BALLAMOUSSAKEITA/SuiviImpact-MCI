"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

interface TrimestreTabsProps {
  basePath: string;
  currentTrimestre: number;
  className?: string;
}

export function TrimestreTabs({
  basePath,
  currentTrimestre,
  className,
}: TrimestreTabsProps) {
  return (
    <div className={cn("inline-flex gap-1 rounded-[var(--radius-card)] bg-veil/80 p-1", className)}>
      {[1, 2, 3, 4].map((t) => {
        const href = `${basePath}/${t}`;
        const isActive = currentTrimestre === t;

        return (
          <Link
            key={t}
            href={href}
            className={cn(
              "relative rounded-[var(--radius-sm)] px-4 py-2 text-sm font-semibold transition-all duration-[var(--duration-fast)]",
              isActive
                ? "bg-white text-forest-ink shadow-sm"
                : "text-fog hover:text-graphite",
            )}
          >
            T{t}
          </Link>
        );
      })}
    </div>
  );
}
