"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string | number | null | undefined> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number | null | undefined> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
}

/** Filtres et onglets segmentés (fond veil, segment actif blanc). */
export function SegmentedControl<T extends string | number | null | undefined>({
  value,
  onChange,
  options,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-[var(--radius-sm)] bg-veil p-1",
        className,
      )}
      role="tablist"
    >
      {options.map(({ value: optionValue, label }) => {
        const active = value === optionValue;
        return (
          <button
            key={String(optionValue)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(optionValue)}
            className={cn(
              "rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-white text-graphite shadow-[var(--shadow-subtle)]"
                : "text-slate hover:text-graphite",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
