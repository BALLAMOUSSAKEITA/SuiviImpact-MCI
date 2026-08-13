"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

import { SegmentedControl } from "@/components/segmented-control";
import {
  ANNEE_OPTIONS,
  maxDateInput,
  minDateInput,
} from "@/lib/years";
import { formatPeriodLabel } from "@/lib/stats-period";
import type { PaoExportMode } from "@/types";
import { cn } from "@/lib/utils";

import type { useStatsPeriodState } from "./stats-period-filter";

const MOIS_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc",
] as const;

const MODE_OPTIONS: { value: PaoExportMode; label: string }[] = [
  { value: "annee", label: "Année" },
  { value: "plage", label: "Plage" },
  { value: "mois", label: "Mois" },
];

type PeriodState = ReturnType<typeof useStatsPeriodState>;

interface StatsPeriodCompactProps {
  state: PeriodState;
  className?: string;
}

/** Sélecteur de période compact (popover) pour la toolbar dashboard. */
export function StatsPeriodCompact({ state, className }: StatsPeriodCompactProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const {
    mode,
    setMode,
    annee,
    setAnnee,
    du,
    setDu,
    au,
    setAu,
    moisAnnee,
    setMoisAnnee,
    selectedMonths,
    toggleMonth,
    params,
  } = state;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-cloud bg-white px-3 py-1.5 text-sm text-graphite transition-colors hover:bg-veil/80",
          open && "border-graphite/30",
        )}
      >
        <Calendar className="size-3.5 shrink-0 text-slate" aria-hidden />
        <span className="max-w-[180px] truncate tabular-nums sm:max-w-[240px]">
          {formatPeriodLabel(params)}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-slate transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Période d'analyse"
          className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,320px)] animate-scale-in border border-hairline bg-white p-4 shadow-[var(--shadow-elevated)]"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate">
            Période
          </p>

          <div className="mt-2">
            <SegmentedControl
              value={mode}
              onChange={setMode}
              options={MODE_OPTIONS}
              className="w-full [&>button]:flex-1 [&>button]:px-2 [&>button]:text-xs"
            />
          </div>

          <div className="mt-3">
            {mode === "annee" && (
              <select
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
                className="input-grain w-full text-sm"
                aria-label="Année"
              >
                {ANNEE_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}

            {mode === "plage" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate">Du</label>
                  <input
                    type="date"
                    value={du}
                    min={minDateInput()}
                    max={maxDateInput()}
                    onChange={(e) => setDu(e.target.value)}
                    className="input-grain mt-1 w-full text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate">Au</label>
                  <input
                    type="date"
                    value={au}
                    min={minDateInput()}
                    max={maxDateInput()}
                    onChange={(e) => setAu(e.target.value)}
                    className="input-grain mt-1 w-full text-sm"
                  />
                </div>
              </div>
            )}

            {mode === "mois" && (
              <div className="space-y-2">
                <select
                  value={moisAnnee}
                  onChange={(e) => setMoisAnnee(Number(e.target.value))}
                  className="input-grain w-full text-sm"
                  aria-label="Année"
                >
                  {ANNEE_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-4 gap-1">
                  {MOIS_LABELS.map((name, idx) => {
                    const month = idx + 1;
                    const checked = selectedMonths.includes(month);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleMonth(month)}
                        className={cn(
                          "rounded-[var(--radius-sm)] px-1 py-1.5 text-xs font-medium transition-colors",
                          checked
                            ? "bg-graphite text-white"
                            : "bg-veil text-slate hover:text-graphite",
                        )}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full rounded-[var(--radius-sm)] bg-graphite py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
}
