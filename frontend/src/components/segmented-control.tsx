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

/** Filtres en onglets documentaires (soulignement vert). */
export function SegmentedControl<T extends string | number | null | undefined>({
  value,
  onChange,
  options,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn("inline-flex flex-wrap gap-0 border-b border-hairline", className)}
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
              "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
              active
                ? "border-forest-ink font-semibold text-graphite"
                : "border-transparent font-medium text-slate hover:text-graphite",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
