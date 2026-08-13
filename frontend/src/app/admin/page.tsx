"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ComparisonBarChart } from "@/components/charts/comparison-bar-chart";
import { ChartPanel } from "@/components/charts/chart-panel";
import { FunnelBarChart } from "@/components/charts/funnel-bar-chart";
import {
  StatusStackBar,
} from "@/components/charts/status-stack-bar";
import { DashboardToolbar } from "@/components/dashboard/dashboard-toolbar";
import {
  DashboardSurface,
  ExecutionGauge,
  MetricStrip,
  ModuleOverview,
  StatusBreakdown,
  type MetricItem,
} from "@/components/dashboard/kpi-metric";
import { DirectionFilter } from "@/components/direction-filter";
import { PageHeader } from "@/components/page-header";
import { StatsQueryStatus } from "@/components/stats-query-status";
import { useStatsPeriodState } from "@/components/stats-period-filter";
import { BRAND } from "@/lib/brand";
import {
  avgProgression,
  executionStatusSlices,
  parseProgress,
  ppmFunnelSlices,
  ppmProgression,
} from "@/lib/dashboard-charts";
import {
  DEFAULT_PROJET_STATS_SCOPE,
  projetStatsScopeLabel,
  statsProjetsRequest,
  type ProjetStatsScope,
} from "@/lib/projet-stats-scope";
import { ProjetStatsFilter } from "@/components/projet-stats-filter";
import {
  getStatsActivites,
  getStatsMissions,
  getStatsPpm,
  getStatsProjets,
  getStatsRcc,
} from "@/lib/api";
import { PPM_STATUT_LABELS } from "@/types";
import { TrimestreFilter } from "@/components/trimestre-tabs";

type StatsPeriodState = ReturnType<typeof useStatsPeriodState>;

const views = [
  { id: "synthese", label: "Synthèse" },
  { id: "activites", label: "Activités" },
  { id: "rcc", label: "RCC" },
  { id: "missions", label: "Missions" },
  { id: "ppm", label: "PPM" },
  { id: "projets", label: "Projets" },
] as const;

type ViewId = (typeof views)[number]["id"];

export default function AdminDashboardPage() {
  const [currentView, setCurrentView] = useState<ViewId>("synthese");
  const periodState = useStatsPeriodState();

  const [direction, setDirection] = useState<string | null>(null);
  const [trimestreRcc, setTrimestreRcc] = useState<number | undefined>();
  const [trimestreMissions, setTrimestreMissions] = useState<number | undefined>();

  const secondaryFilter =
    currentView === "activites" ? (
      <DirectionFilter
        value={direction}
        onChange={setDirection}
        className="[&_select]:py-1.5 [&_select]:text-sm"
        compact
      />
    ) : currentView === "rcc" ? (
      <TrimestreFilter value={trimestreRcc} onChange={setTrimestreRcc} />
    ) : currentView === "missions" ? (
      <TrimestreFilter value={trimestreMissions} onChange={setTrimestreMissions} />
    ) : null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <PageHeader
        eyebrow={`${BRAND.bureauShort} · ${BRAND.ministryShort}`}
        title="Vue d'ensemble"
        description="Tableau de bord de suivi des politiques publiques du gouvernement."
        display
      />

      <DashboardToolbar
        tabs={[...views]}
        currentTab={currentView}
        onTabChange={(id) => setCurrentView(id as ViewId)}
        periodState={periodState}
        secondaryFilter={secondaryFilter}
      />

      {currentView === "synthese" && (
        <SyntheseView periodState={periodState} onNavigate={setCurrentView} />
      )}
      {currentView === "activites" && (
        <ActivitesView periodState={periodState} direction={direction} />
      )}
      {currentView === "rcc" && (
        <RccView periodState={periodState} trimestre={trimestreRcc} />
      )}
      {currentView === "missions" && (
        <MissionsView periodState={periodState} trimestre={trimestreMissions} />
      )}
      {currentView === "ppm" && <PpmView periodState={periodState} />}
      {currentView === "projets" && <ProjetsView periodState={periodState} />}
    </div>
  );
}

function SyntheseView({
  periodState,
  onNavigate,
}: {
  periodState: StatsPeriodState;
  onNavigate: (view: ViewId) => void;
}) {
  const { params: period } = periodState;

  const results = useQueries({
    queries: [
      {
        queryKey: ["stats-activites", null, period],
        queryFn: () => getStatsActivites(undefined, period),
      },
      {
        queryKey: ["stats-rcc", undefined, period],
        queryFn: () => getStatsRcc({ period }),
      },
      {
        queryKey: ["stats-missions", undefined, period],
        queryFn: () => getStatsMissions({ period }),
      },
      {
        queryKey: ["stats-ppm", period],
        queryFn: () => getStatsPpm(undefined, period),
      },
      {
        queryKey: ["stats-projets", period],
        queryFn: () => getStatsProjets({ period }),
      },
    ],
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  const error = results.find((r) => r.error)?.error ?? null;

  const activites = results[0].data;
  const rcc = results[1].data;
  const missions = results[2].data;
  const ppm = results[3].data;
  const projets = results[4].data;

  const totalItems =
    (activites?.total ?? 0) +
    (rcc?.total ?? 0) +
    (missions?.total ?? 0) +
    (ppm?.total ?? 0) +
    (projets?.total ?? 0);

  const avgExec = avgProgression([
    activites?.progression ?? 0,
    rcc?.progression ?? 0,
    missions?.progression ?? 0,
    ppm ? ppmProgression(ppm) : 0,
    projets?.execution_physique ?? 0,
  ]);

  const retards = activites?.en_retard ?? 0;

  const modules = [
    activites && {
      id: "activites",
      title: "Activités PAO",
      total: activites.total,
      progression: activites.progression,
      segments: executionStatusSlices(activites, true),
    },
    rcc && {
      id: "rcc",
      title: "Recommandations RCC",
      total: rcc.total,
      progression: rcc.progression,
      segments: executionStatusSlices(rcc),
    },
    missions && {
      id: "missions",
      title: "Missions",
      total: missions.total,
      progression: missions.progression,
      segments: executionStatusSlices(missions),
    },
  ].filter(Boolean) as {
    id: ViewId;
    title: string;
    total: number;
    progression: string;
    segments: ReturnType<typeof executionStatusSlices>;
  }[];

  return (
    <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
      <DashboardSurface>
        <MetricStrip
          metrics={[
            {
              label: "Éléments suivis",
              value: totalItems,
              hint: "Ensemble des modules",
            },
            {
              label: "Progression moyenne",
              value: `${avgExec} %`,
              hint: "Taux d'exécution global",
            },
            {
              label: "Activités en retard",
              value: retards,
              hint: "Tâches PAO dépassées",
              emphasize: retards > 0,
            },
            {
              label: "Projets actifs",
              value: projets?.total ?? 0,
              hint: "Suivi financier et physique",
            },
          ]}
        />

        <ModuleOverview
          modules={modules}
          onSelect={(id) => onNavigate(id as ViewId)}
        />

        <div className="grid gap-3 lg:grid-cols-2">
          {ppm && (
            <ChartPanel
              title="Pipeline PPM"
              subtitle={`${ppm.total} marché${ppm.total > 1 ? "s" : ""} sur la période`}
              action={
                <button
                  type="button"
                  onClick={() => onNavigate("ppm")}
                  className="text-xs font-medium text-slate hover:text-graphite"
                >
                  Ouvrir
                </button>
              }
            >
              <FunnelBarChart data={ppmFunnelSlices(ppm)} height={220} />
            </ChartPanel>
          )}
          {projets && (
            <ChartPanel
              title="Exécution projets"
              subtitle="Moyennes financière et physique"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate("projets")}
                  className="text-xs font-medium text-slate hover:text-graphite"
                >
                  Ouvrir
                </button>
              }
            >
              <ComparisonBarChart
                financier={projets.execution_financiere}
                physique={projets.execution_physique}
                height={220}
              />
            </ChartPanel>
          )}
        </div>
      </DashboardSurface>
    </StatsQueryStatus>
  );
}

function ExecutionDashboard({
  stats,
  includeRetard,
}: {
  stats: {
    total: number;
    non_demare: number;
    en_cours: number;
    termine: number;
    en_retard?: number;
    progression: string;
  };
  includeRetard?: boolean;
}) {
  const slices = executionStatusSlices(
    stats as Parameters<typeof executionStatusSlices>[0],
    includeRetard,
  );

  const metrics: MetricItem[] = [
    { label: "Total", value: stats.total },
    { label: "Non démarrées", value: stats.non_demare },
    { label: "En cours", value: stats.en_cours },
    { label: "Terminées", value: stats.termine },
  ];
  if (includeRetard && stats.en_retard != null) {
    metrics.push({
      label: "En retard",
      value: stats.en_retard,
      emphasize: stats.en_retard > 0,
    });
  }

  return (
    <DashboardSurface>
      <MetricStrip metrics={metrics} />

      <div className="grid gap-3 lg:grid-cols-12">
        <ChartPanel
          title="Répartition par statut"
          subtitle={`${stats.total} élément${stats.total > 1 ? "s" : ""} sur la période`}
          className="lg:col-span-8"
        >
          <StatusStackBar segments={slices} height={6} className="mb-5" />
          <StatusBreakdown segments={slices} />
        </ChartPanel>

        <ChartPanel
          title="Taux d'exécution"
          className="lg:col-span-4"
        >
          <ExecutionGauge value={stats.progression} label="Progression globale" />
        </ChartPanel>
      </div>
    </DashboardSurface>
  );
}

function ActivitesView({
  periodState,
  direction,
}: {
  periodState: StatsPeriodState;
  direction: string | null;
}) {
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-activites", direction, period],
    queryFn: () => getStatsActivites(direction ?? undefined, period),
  });

  return (
    <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
      {stats ? <ExecutionDashboard stats={stats} includeRetard /> : null}
    </StatsQueryStatus>
  );
}

function RccView({
  periodState,
  trimestre,
}: {
  periodState: StatsPeriodState;
  trimestre?: number;
}) {
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-rcc", trimestre, period],
    queryFn: () => getStatsRcc({ trimestre, period }),
  });

  return (
    <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
      {stats ? <ExecutionDashboard stats={stats} /> : null}
    </StatsQueryStatus>
  );
}

function MissionsView({
  periodState,
  trimestre,
}: {
  periodState: StatsPeriodState;
  trimestre?: number;
}) {
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-missions", trimestre, period],
    queryFn: () => getStatsMissions({ trimestre, period }),
  });

  return (
    <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
      {stats ? <ExecutionDashboard stats={stats} /> : null}
    </StatsQueryStatus>
  );
}

function PpmView({ periodState }: { periodState: StatsPeriodState }) {
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-ppm", period],
    queryFn: () => getStatsPpm(undefined, period),
  });

  const progression = stats ? ppmProgression(stats) : "0";
  const funnel = stats ? ppmFunnelSlices(stats) : [];

  return (
    <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
      {stats ? (
        <DashboardSurface>
          <MetricStrip
            metrics={[
              { label: "Total marchés", value: stats.total },
              { label: PPM_STATUT_LABELS.dao_elabore, value: stats.dao_elabore },
              { label: PPM_STATUT_LABELS.dao_publie, value: stats.dao_publie },
              { label: PPM_STATUT_LABELS.contrat_signe, value: stats.contrat_signe },
            ]}
          />

          <div className="grid gap-3 lg:grid-cols-12">
            <ChartPanel
              title="Cycle de passation"
              subtitle="Progression par statut de marché"
              className="lg:col-span-8"
            >
              <FunnelBarChart data={funnel} height={260} />
            </ChartPanel>

            <ChartPanel
              title="Contractualisation"
              subtitle="Part des contrats signés"
              className="lg:col-span-4"
            >
              <ExecutionGauge
                value={progression}
                label="Contrats signés / total"
              />
            </ChartPanel>
          </div>
        </DashboardSurface>
      ) : null}
    </StatsQueryStatus>
  );
}

function ProjetsView({ periodState }: { periodState: StatsPeriodState }) {
  const { params: period } = periodState;
  const [projetScope, setProjetScope] = useState<ProjetStatsScope>(
    DEFAULT_PROJET_STATS_SCOPE,
  );
  const statsParams = statsProjetsRequest(projetScope, period);

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-projets", projetScope, period],
    queryFn: () => getStatsProjets(statsParams),
  });

  const fin = stats ? parseProgress(stats.execution_financiere) : 0;
  const phys = stats ? parseProgress(stats.execution_physique) : 0;
  const ecart = fin - phys;
  const isSingleProject = projetScope.kind === "projet";

  return (
    <div className="space-y-4">
      <ProjetStatsFilter value={projetScope} onChange={setProjetScope} />

      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <DashboardSurface>
            <MetricStrip
              metrics={[
                {
                  label: isSingleProject ? "Projet suivi" : "Total projets",
                  value: stats.total,
                },
                {
                  label: isSingleProject
                    ? "Exécution financière"
                    : "Exécution financière moyenne",
                  value: `${fin.toFixed(0)} %`,
                },
                {
                  label: isSingleProject
                    ? "Exécution physique"
                    : "Exécution physique moyenne",
                  value: `${phys.toFixed(0)} %`,
                },
                {
                  label: "Écart financier − physique",
                  value: `${ecart >= 0 ? "+" : ""}${ecart.toFixed(0)} pts`,
                  emphasize: Math.abs(ecart) >= 15,
                },
              ]}
            />

            <ChartPanel
              title="Comparaison des exécutions"
              subtitle={projetStatsScopeLabel(projetScope)}
            >
              <ComparisonBarChart
                financier={stats.execution_financiere}
                physique={stats.execution_physique}
                height={280}
              />
            </ChartPanel>
          </DashboardSurface>
        ) : null}
      </StatsQueryStatus>
    </div>
  );
}
