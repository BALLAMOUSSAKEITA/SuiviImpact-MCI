"use client";

import { useQuery } from "@tanstack/react-query";
import { PageBackLink, PageHeader } from "@/components/page-header";

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
      <PageBackLink href="/admin/stats">← Statistiques</PageBackLink>
      <PageHeader className="mt-2" title="Projets" description="Filtrage sur la date de début du projet." />

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
