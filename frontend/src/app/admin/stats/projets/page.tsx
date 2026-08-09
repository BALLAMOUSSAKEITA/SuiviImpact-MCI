"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageBackLink, PageHeader } from "@/components/page-header";

import { ProgressBar } from "@/components/execution-badge";
import { ProjetStatsFilter } from "@/components/projet-stats-filter";
import { StatCard, StatGrid } from "@/components/stat-card";
import { StatsQueryStatus } from "@/components/stats-query-status";
import {
  StatsPeriodFilter,
  useStatsPeriodState,
} from "@/components/stats-period-filter";
import { getStatsProjets } from "@/lib/api";
import {
  DEFAULT_PROJET_STATS_SCOPE,
  projetStatsScopeLabel,
  statsProjetsRequest,
  type ProjetStatsScope,
} from "@/lib/projet-stats-scope";

export default function StatsProjetsPage() {
  return <StatsProjetsContent />;
}

function StatsProjetsContent() {
  const periodState = useStatsPeriodState();
  const { params: period } = periodState;
  const [projetScope, setProjetScope] = useState<ProjetStatsScope>(
    DEFAULT_PROJET_STATS_SCOPE,
  );
  const statsParams = statsProjetsRequest(projetScope, period);

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-projets", projetScope, period],
    queryFn: () => getStatsProjets(statsParams),
  });

  const isSingleProject = projetScope.kind === "projet";
  const scopeLabel = projetStatsScopeLabel(projetScope);

  return (
    <>
      <PageBackLink href="/admin/stats">← Statistiques</PageBackLink>
      <PageHeader
        className="mt-2"
        title="Projets"
        description="Exécution financière et physique — filtrable par projet ou panier."
      />

      <StatsPeriodFilter
        dateFieldHint="Filtrage sur la date de début du projet."
        state={periodState}
      />

      <div className="mb-4">
        <ProjetStatsFilter value={projetScope} onChange={setProjetScope} />
      </div>

      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <>
            <p className="mb-3 text-sm text-slate">{scopeLabel}</p>
            <StatGrid>
              <StatCard
                title={isSingleProject ? "Projet dans le périmètre" : "Total projets"}
                value={stats.total}
              />
            </StatGrid>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="panel-grain">
                <ProgressBar
                  label={
                    isSingleProject
                      ? "Exécution financière"
                      : "Exécution financière moyenne"
                  }
                  value={stats.execution_financiere}
                />
              </div>
              <div className="panel-grain">
                <ProgressBar
                  label={
                    isSingleProject
                      ? "Exécution physique"
                      : "Exécution physique moyenne"
                  }
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
