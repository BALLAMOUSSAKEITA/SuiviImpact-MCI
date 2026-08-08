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
import { getStatsPpm } from "@/lib/api";
import { PPM_STATUT_LABELS } from "@/types";

export default function StatsPpmPage() {
  return <StatsPpmContent />;
}

function StatsPpmContent() {
  const periodState = useStatsPeriodState();
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-ppm", period],
    queryFn: () => getStatsPpm(undefined, period),
  });

  const progression =
    stats && stats.total > 0
      ? ((stats.contrat_signe / stats.total) * 100).toFixed(0)
      : "0";

  return (
    <>
      <PageBackLink href="/admin/stats">← Statistiques</PageBackLink>
      <PageHeader className="mt-2" title="PPM" description="Filtrage sur la date du marché (PPM)." />

      <StatsPeriodFilter
        dateFieldHint="Filtrage sur la date du marché (PPM)."
        state={periodState}
      />

      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <>
            <StatGrid>
            <StatCard title="Total marchés" value={stats.total} />
            <StatCard
              title={PPM_STATUT_LABELS.dao_elabore}
              value={stats.dao_elabore}
            />
            <StatCard
              title={PPM_STATUT_LABELS.dao_publie}
              value={stats.dao_publie}
            />
            <StatCard
              title={PPM_STATUT_LABELS.marche_attribue}
              value={stats.marche_attribue}
            />
            <StatCard
              title={PPM_STATUT_LABELS.contrat_signe}
              value={stats.contrat_signe}
            />
          </StatGrid>
          <div className="panel-grain">
            <ProgressBar
              label="Contrats signés / total"
              value={progression}
            />
          </div>
        </>
        ) : null}
      </StatsQueryStatus>
    </>
  );
}
