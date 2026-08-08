"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { ProgressBar } from "@/components/execution-badge";
import { StatCard, StatGrid } from "@/components/stat-card";
import {
  StatsPeriodFilter,
  useStatsPeriodState,
} from "@/components/stats-period-filter";
import { getStatsRcc } from "@/lib/api";

export default function StatsRccPage() {
  return <StatsRccContent />;
}

function StatsRccContent() {
  const [trimestre, setTrimestre] = useState<number | undefined>(undefined);
  const periodState = useStatsPeriodState();
  const { params: period } = periodState;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-rcc", trimestre, period],
    queryFn: () => getStatsRcc({ trimestre, period }),
  });

  return (
    <>
      <div>
        <Link href="/admin/stats" className="text-sm text-forest-ink hover:underline">
          ← Statistiques
        </Link>
        <h1 className="mt-2 text-xl font-bold text-graphite sm:text-2xl">
          Statistiques — Recommandations RCC
        </h1>
      </div>

      <StatsPeriodFilter
        dateFieldHint="Filtrage sur la date de la recommandation RCC."
        state={periodState}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTrimestre(undefined)}
          className={`rounded-card px-3 py-1.5 text-sm font-medium ${
            trimestre === undefined
              ? "bg-forest-ink text-white"
              : "bg-paper ring-1 ring-cloud"
          }`}
        >
          Tous trimestres
        </button>
        {[1, 2, 3, 4].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTrimestre(t)}
            className={`rounded-card px-3 py-1.5 text-sm font-medium ${
              trimestre === t
                ? "bg-forest-ink text-white"
                : "bg-paper ring-1 ring-cloud"
            }`}
          >
            T{t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-ash">Chargement…</p>
      ) : stats ? (
        <>
          <StatGrid>
            <StatCard title="Total RCC" value={stats.total} />
            <StatCard title="Non démarrées" value={stats.non_demare} />
            <StatCard title="En cours" value={stats.en_cours} />
            <StatCard title="Terminées" value={stats.termine} />
          </StatGrid>
          <div className="rounded-card border border-cloud bg-paper p-4 shadow-sm sm:p-6">
            <ProgressBar label="Progression" value={stats.progression} />
          </div>
        </>
      ) : null}
    </>
  );
}
