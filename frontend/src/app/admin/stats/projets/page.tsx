"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { ProgressBar } from "@/components/execution-badge";
import { StatCard, StatGrid } from "@/components/stat-card";
import { StatsQueryStatus } from "@/components/stats-query-status";
import {
  StatsPeriodFilter,
  useStatsPeriodState,
} from "@/components/stats-period-filter";
import { getStatsProjets } from "@/lib/api";

export default function StatsProjetsPage() {
  return <StatsProjetsContent />;
}

function StatsProjetsContent() {
  const periodState = useStatsPeriodState();
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-projets", period],
    queryFn: () => getStatsProjets(undefined, period),
  });

  return (
    <>
      <div>
        <Link href="/admin/stats" className="text-sm font-medium text-graphite hover:underline">
          ← Statistiques
        </Link>
        <h1 className="mt-2 font-display text-[var(--text-heading-sm)] text-graphite">
          Statistiques — Projets
        </h1>
      </div>

      <StatsPeriodFilter
        dateFieldHint="Filtrage sur la date de début du projet."
        state={periodState}
      />

      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <>
            <StatGrid>
            <StatCard title="Total projets" value={stats.total} />
          </StatGrid>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel-grain">
              <ProgressBar
                label="Exécution financière moyenne"
                value={stats.execution_financiere}
              />
            </div>
            <div className="panel-grain">
              <ProgressBar
                label="Exécution physique moyenne"
                value={stats.execution_physique}
              />
            </div>
          </div>
        </>
        ) : null}
      </StatsQueryStatus>
    </>
  );
}
