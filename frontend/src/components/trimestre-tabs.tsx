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
    <div className={cn("inline-flex rounded-[var(--radius)] border bg-gray-50 p-0.5", className)}>
      {[1, 2, 3, 4].map((t) => {
        const isActive = currentTrimestre === t;
        return (
          <Link
            key={t}
            href={`${basePath}/${t}`}
            className={cn(
              "rounded-[5px] px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-100",
              isActive
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            T{t}
          </Link>
        );
      })}
    </div>
  );
}
