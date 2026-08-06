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
    <div className={cn("flex flex-wrap gap-2", className)}>
      {[1, 2, 3, 4].map((t) => {
        const href = `${basePath}/${t}`;
        const isActive = currentTrimestre === t;

        return (
          <Link
            key={t}
            href={href}
            className={cn(
              "rounded-card px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-forest-ink text-paper"
                : "bg-paper text-slate ring-1 ring-cloud hover:bg-veil hover:text-forest-ink",
            )}
          >
            T{t}
          </Link>
        );
      })}
    </div>
  );
}
