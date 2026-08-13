"use client";

import { useQuery } from "@tanstack/react-query";
import { PageBackLink, PageHeader } from "@/components/page-header";
import { useState } from "react";

import { ProgressBar } from "@/components/execution-badge";
import { StatCard, StatGrid } from "@/components/stat-card";
import { StatsQueryStatus } from "@/components/stats-query-status";
import {
  StatsPeriodFilter,
  useStatsPeriodState,
} from "@/components/stats-period-filter";
import { TrimestreFilter } from "@/components/trimestre-tabs";
import { getStatsRcc } from "@/lib/api";

export default function StatsRccPage() {
  return <StatsRccContent />;
}

function StatsRccContent() {
  const [trimestre, setTrimestre] = useState<number | undefined>(undefined);
  const periodState = useStatsPeriodState();
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-rcc", trimestre, period],
    queryFn: () => getStatsRcc({ trimestre, period }),
  });

  return (
    <>
      <PageBackLink href="/admin/stats">← Statistiques</PageBackLink>
      <PageHeader
        className="mt-2"
        title="Instructions IRC"
        description="Filtrage sur la date de l'instruction IRC."
      />

      <StatsPeriodFilter
        dateFieldHint="Filtrage sur la date de l'instruction IRC."
        state={periodState}
      />

      <TrimestreFilter value={trimestre} onChange={setTrimestre} allLabel="Tous trimestres" />

      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <>
            <StatGrid>
              <StatCard title="Total IRC" value={stats.total} />
              <StatCard title="Non démarrées" value={stats.non_demare} />
              <StatCard title="En cours" value={stats.en_cours} />
              <StatCard title="Terminées" value={stats.termine} />
            </StatGrid>
            <div className="panel-grain">
              <ProgressBar label="Progression" value={stats.progression} />
            </div>
          </>
        ) : null}
      </StatsQueryStatus>
    </>
  );
}
