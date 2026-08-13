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

/** Filtres et onglets — style portail (bordure, segment actif vert). */
export function SegmentedControl<T extends string | number | null | undefined>({
  value,
  onChange,
  options,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn("inline-flex flex-wrap border border-hairline bg-white", className)}
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
              "border-r border-hairline px-3 py-1.5 text-sm font-medium last:border-r-0 transition-colors",
              active
                ? "bg-[#0d4f38] text-white"
                : "bg-white text-slate hover:bg-pebble hover:text-graphite",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
