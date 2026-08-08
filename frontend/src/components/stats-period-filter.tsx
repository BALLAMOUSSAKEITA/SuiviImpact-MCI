"use client";

import { useId, useMemo, useState } from "react";

import {
  ANNEE_OPTIONS,
  DEFAULT_ANNEE,
  defaultYearRange,
  maxDateInput,
  minDateInput,
} from "@/lib/years";
import { normalizeStatsPeriod, yearToDateRange } from "@/lib/stats-period";
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
    let raw: StatsPeriodParams;
    if (mode === "annee") raw = { mode, annee };
    else if (mode === "plage") raw = { mode, annee, du, au };
    else raw = { mode, mois: moisParam };
    return normalizeStatsPeriod(raw);
  }, [mode, annee, du, au, moisParam]);

  const setAnneeSynced = (y: number) => {
    setAnnee(y);
    setMoisAnnee(y);
    const range = yearToDateRange(y);
    setDu(range.du);
    setAu(range.au);
  };

  const setModeSynced = (next: PaoExportMode) => {
    setMode(next);
    if (next === "plage") {
      const range = yearToDateRange(annee);
      setDu(range.du);
      setAu(range.au);
    }
    if (next === "mois") {
      setMoisAnnee(annee);
    }
  };

  const toggleMonth = (month: number) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month].sort((a, b) => a - b),
    );
  };

  return {
    mode,
    setMode: setModeSynced,
    annee,
    setAnnee: setAnneeSynced,
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

  const modeGroupName = useId();

  return (
    <div
      className={cn(
        "panel-grain",
        className,
      )}
    >
      <p className="text-base font-medium text-graphite">Période d&apos;analyse</p>
      <p className="mt-1 text-sm leading-[1.43] text-slate">{dateFieldHint}</p>

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
              "flex cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-3 py-2 text-center text-sm font-medium transition-colors",
              mode === value
                ? "bg-graphite text-white"
                : "bg-veil text-slate hover:text-graphite",
            )}
          >
            <input
              type="radio"
              name={modeGroupName}
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
                      "flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm",
                      checked
                        ? "bg-graphite text-white"
                        : "bg-veil text-slate hover:text-graphite",
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

export { appendStatsPeriodToSearch, normalizeStatsPeriod } from "@/lib/stats-period";
