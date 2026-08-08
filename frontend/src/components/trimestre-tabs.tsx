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
    <div className={cn("inline-flex gap-1 rounded-[var(--radius-sm)] bg-veil p-1", className)}>
      {[1, 2, 3, 4].map((t) => {
        const href = `${basePath}/${t}`;
        const isActive = currentTrimestre === t;

        return (
          <Link
            key={t}
            href={href}
            className={cn(
              "relative rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors duration-[var(--duration-fast)]",
              isActive
                ? "bg-white text-graphite shadow-[var(--shadow-subtle)]"
                : "text-slate hover:text-graphite",
            )}
          >
            T{t}
          </Link>
        );
      })}
    </div>
  );
}

interface TrimestreFilterProps {
  value: number | undefined;
  onChange: (trimestre: number | undefined) => void;
  allLabel?: string;
  className?: string;
}

/** Filtre T1–T4 (boutons) pour stats et tableaux de bord. */
export function TrimestreFilter({
  value,
  onChange,
  allLabel = "Année",
  className,
}: TrimestreFilterProps) {
  const chip = (active: boolean) =>
    cn(
      "rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-graphite text-white"
        : "bg-white text-slate ring-1 ring-cloud hover:bg-veil",
    );

  return (
    <div className={cn("inline-flex flex-wrap gap-1 rounded-[var(--radius-sm)] bg-veil p-1", className)}>
      <button type="button" onClick={() => onChange(undefined)} className={chip(value === undefined)}>
        {allLabel}
      </button>
      {[1, 2, 3, 4].map((t) => (
        <button key={t} type="button" onClick={() => onChange(t)} className={chip(value === t)}>
          T{t}
        </button>
      ))}
    </div>
  );
}
