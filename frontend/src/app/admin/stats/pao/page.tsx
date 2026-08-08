"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { DirectionFilter } from "@/components/direction-filter";
import { ProgressBar } from "@/components/execution-badge";
import { StatCard, StatGrid } from "@/components/stat-card";
import { StatsQueryStatus } from "@/components/stats-query-status";
import {
  StatsPeriodFilter,
  useStatsPeriodState,
} from "@/components/stats-period-filter";
import { getStatsActivites } from "@/lib/api";

export default function StatsPaoPage() {
  return <StatsPaoContent />;
}

function StatsPaoContent() {
  const [direction, setDirection] = useState<string | null>(null);
  const periodState = useStatsPeriodState();
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-activites", direction, period],
    queryFn: () => getStatsActivites(direction ?? undefined, period),
  });

  return (
    <>
        <div>
          <Link href="/admin/stats" className="text-sm font-medium text-graphite hover:underline">
            ← Statistiques
          </Link>
          <h1 className="mt-2 font-display text-[var(--text-heading-sm)] text-graphite">
            Statistiques — Plan d&apos;Action
          </h1>
        </div>

        <StatsPeriodFilter
          dateFieldHint="Les activités PAO sont comptées selon leur date de début (ex. début en janvier → incluse dans le filtre janvier)."
          state={periodState}
        />

        <DirectionFilter value={direction} onChange={setDirection} />

        <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
          {stats ? (
            <>
              <StatGrid>
              <StatCard title="Total activités" value={stats.total} />
              <StatCard title="Non démarrées" value={stats.non_demare} />
              <StatCard title="En cours" value={stats.en_cours} />
              <StatCard title="Terminées" value={stats.termine} />
              <StatCard title="En retard" value={stats.en_retard} />
            </StatGrid>
            <div className="panel-grain">
              <ProgressBar
                label="Progression globale"
                value={stats.progression}
              />
            </div>
          </>
          ) : null}
        </StatsQueryStatus>
    </>
  );
}
