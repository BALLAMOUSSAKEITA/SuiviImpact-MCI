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
    <div className={cn("flex gap-2", className)}>
      {[1, 2, 3, 4].map((t) => {
        const href = `${basePath}/${t}`;
        const isActive = currentTrimestre === t;

        return (
          <Link
            key={t}
            href={href}
            className={cn(
              "rounded-[var(--radius-btn)] px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sky-soft text-charcoal"
                : "border border-ash bg-canvas-white text-steel hover:bg-paper-mist hover:text-charcoal",
            )}
          >
            T{t}
          </Link>
        );
      })}
    </div>
  );
}
