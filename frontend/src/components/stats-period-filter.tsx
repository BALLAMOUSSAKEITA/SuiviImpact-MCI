"use client";

import { useMemo, useState } from "react";

import {
  ANNEE_OPTIONS,
  DEFAULT_ANNEE,
  defaultYearRange,
  maxDateInput,
  minDateInput,
} from "@/lib/years";
import type { PaoExportMode, StatsPeriodParams } from "@/types";
import { cn } from "@/lib/utils";

const MOIS_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

export function useStatsPeriodState(initial?: Partial<StatsPeriodParams>) {
  const [mode, setMode] = useState<PaoExportMode>(initial?.mode ?? "annee");
  const [annee, setAnnee] = useState(initial?.annee ?? DEFAULT_ANNEE);
  const { du: defaultDu, au: defaultAu } = defaultYearRange();
  const [du, setDu] = useState(initial?.du ?? defaultDu);
  const [au, setAu] = useState(initial?.au ?? defaultAu);
  const [moisAnnee, setMoisAnnee] = useState(initial?.annee ?? DEFAULT_ANNEE);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([1]);

  const moisParam = useMemo(
    () =>
      selectedMonths
        .sort((a, b) => a - b)
        .map((m) => `${moisAnnee}-${String(m).padStart(2, "0")}`)
        .join(","),
    [moisAnnee, selectedMonths],
  );

  const params: StatsPeriodParams = useMemo(() => {
    if (mode === "annee") return { mode, annee };
    if (mode === "plage") return { mode, du, au };
    return { mode, mois: moisParam };
  }, [mode, annee, du, au, moisParam]);

  const toggleMonth = (month: number) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month].sort((a, b) => a - b),
    );
  };

  return {
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
  };
}

interface StatsPeriodFilterProps {
  dateFieldHint: string;
  state: ReturnType<typeof useStatsPeriodState>;
  className?: string;
}

export function StatsPeriodFilter({
  dateFieldHint,
  state,
  className,
}: StatsPeriodFilterProps) {
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
  } = state;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-cloud/70 bg-paper/50 p-4 sm:p-5",
        className,
      )}
    >
      <p className="text-sm font-semibold text-graphite">Période d&apos;analyse</p>
      <p className="mt-1 text-xs leading-relaxed text-slate">{dateFieldHint}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {(
          [
            ["annee", "Année entière"],
            ["plage", "Du … au …"],
            ["mois", "Mois"],
          ] as const
        ).map(([value, label]) => (
          <label
            key={value}
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border px-3 py-2 text-center text-xs font-medium transition-colors sm:text-sm",
              mode === value
                ? "border-forest-ink/40 bg-forest-ink/10 text-forest-ink"
                : "border-cloud text-slate hover:bg-veil/60",
            )}
          >
            <input
              type="radio"
              name="stats-period-mode"
              className="sr-only"
              checked={mode === value}
              onChange={() => setMode(value)}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-4">
        {mode === "annee" && (
          <select
            value={annee}
            onChange={(e) => setAnnee(Number(e.target.value))}
            className="input-grain w-full max-w-xs"
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label-grain">Du</label>
              <input
                type="date"
                value={du}
                min={minDateInput()}
                max={maxDateInput()}
                onChange={(e) => setDu(e.target.value)}
                className="input-grain mt-1 w-full"
              />
            </div>
            <div>
              <label className="label-grain">Au</label>
              <input
                type="date"
                value={au}
                min={minDateInput()}
                max={maxDateInput()}
                onChange={(e) => setAu(e.target.value)}
                className="input-grain mt-1 w-full"
              />
            </div>
          </div>
        )}

        {mode === "mois" && (
          <div className="space-y-3">
            <select
              value={moisAnnee}
              onChange={(e) => setMoisAnnee(Number(e.target.value))}
              className="input-grain w-full max-w-xs"
              aria-label="Année des mois"
            >
              {ANNEE_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {MOIS_LABELS.map((name, idx) => {
                const month = idx + 1;
                const checked = selectedMonths.includes(month);
                return (
                  <label
                    key={name}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border px-2 py-1.5 text-xs",
                      checked
                        ? "border-forest-ink/35 bg-forest-ink/8 text-forest-ink"
                        : "border-cloud text-slate hover:bg-veil",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMonth(month)}
                      className="accent-forest-ink"
                    />
                    {name}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function appendStatsPeriodToSearch(
  search: URLSearchParams,
  period: StatsPeriodParams,
) {
  search.set("mode", period.mode);
  if (period.mode === "annee" && period.annee != null) {
    search.set("annee", String(period.annee));
  }
  if (period.mode === "plage") {
    if (period.du) search.set("du", period.du);
    if (period.au) search.set("au", period.au);
  }
  if (period.mode === "mois" && period.mois) {
    search.set("mois", period.mois);
  }
}
