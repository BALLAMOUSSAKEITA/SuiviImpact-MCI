"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ComparisonBarChart } from "@/components/charts/comparison-bar-chart";
import { ChartPanel } from "@/components/charts/chart-panel";
import { FunnelBarChart } from "@/components/charts/funnel-bar-chart";
import { RadialStat } from "@/components/charts/radial-stat";
import { StatusBarChart } from "@/components/charts/status-bar-chart";
import {
  StatusDonutChart,
  StatusLegend,
} from "@/components/charts/status-donut-chart";
import { DashboardToolbar } from "@/components/dashboard/dashboard-toolbar";
import {
  DashboardSurface,
  MetricStrip,
  type MetricItem,
} from "@/components/dashboard/kpi-metric";
import { DirectionFilter } from "@/components/direction-filter";
import { PageHeader } from "@/components/page-header";
import { StatsQueryStatus } from "@/components/stats-query-status";
import { useStatsPeriodState } from "@/components/stats-period-filter";
import { BRAND } from "@/lib/brand";
import {
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
import { FinanceAmountsChart } from "@/components/charts/finance-amounts-chart";
import { FinancePieChart } from "@/components/charts/finance-pie-chart";
import { FinanceRatesChart } from "@/components/charts/finance-rates-chart";
import {
  getFinances,
  getStatsActivites,
  getStatsMissions,
  getStatsPpm,
  getStatsProjets,
  getStatsRcc,
} from "@/lib/api";
import {
  computeFinanceStats,
  formatMontantGnfCompact,
  formatTauxPct,
} from "@/lib/finances";
import { PPM_STATUT_LABELS } from "@/types";
import { TrimestreFilter } from "@/components/trimestre-tabs";

type StatsPeriodState = ReturnType<typeof useStatsPeriodState>;

const views = [
  { id: "finances", label: "Finances" },
  { id: "activites", label: "Activités" },
  { id: "rcc", label: "RCC" },
  { id: "missions", label: "Missions" },
  { id: "ppm", label: "PPM" },
  { id: "projets", label: "Projets" },
] as const;

type ViewId = (typeof views)[number]["id"];

export default function AdminDashboardPage() {
  const [currentView, setCurrentView] = useState<ViewId>("finances");
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

      {currentView === "finances" && <FinancesView />}
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

function FinancesView() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["finances"],
    queryFn: getFinances,
  });

  const stats = computeFinanceStats(data?.lignes ?? []);

  return (
    <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
      {stats ? (
        <DashboardSurface>
          <MetricStrip
            metrics={[
              {
                label: "Prévu / LFI",
                value: formatMontantGnfCompact(stats.prevu),
                hint: "Montants en GNF",
              },
              {
                label: "Engagés",
                value: formatMontantGnfCompact(stats.engage),
                hint: "Montants en GNF",
              },
              {
                label: "Taux d'engagement",
                value: formatTauxPct(stats.tauxEngagement),
                hint: "Engagés / prévus",
              },
              {
                label: "Taux de caisse",
                value: formatTauxPct(stats.tauxCaisse),
                hint: "Payés / prévus",
              },
            ]}
          />

          <div className="grid gap-3 lg:grid-cols-12">
            <ChartPanel
              title="Montants par titre"
              subtitle="Prévus, engagés et payés"
              className="lg:col-span-8"
            >
              <FinanceAmountsChart titres={stats.titres} height={280} />
            </ChartPanel>

            <ChartPanel
              title="Décaissement"
              subtitle="Taux globaux"
              className="lg:col-span-4"
            >
              <div className="grid gap-4">
                <RadialStat
                  value={stats.tauxEngagement}
                  size={132}
                  label="Base engagement (2)/(1)"
                />
                <RadialStat
                  value={stats.tauxCaisse}
                  size={132}
                  label="Base caisse (3)/(1)"
                />
              </div>
            </ChartPanel>
          </div>

          <div className="grid gap-3 lg:grid-cols-12">
            <ChartPanel
              title="Répartition des titres"
              subtitle="Part de chaque titre dans le prévu / LFI"
              className="lg:col-span-5"
            >
              <FinancePieChart titres={stats.titres} height={240} />
            </ChartPanel>

            <ChartPanel
              title="Taux de décaissement par titre"
              subtitle="Comparaison engagement et caisse"
              className="lg:col-span-7"
            >
              <FinanceRatesChart titres={stats.titres} height={260} />
            </ChartPanel>
          </div>
        </DashboardSurface>
      ) : (
        <DashboardSurface>
          <p className="px-1 py-8 text-center text-sm text-slate">
            Aucune donnée financière. Importez le fichier Excel depuis l’onglet
            Finances du menu.
          </p>
        </DashboardSurface>
      )}
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
          className="lg:col-span-7"
        >
          <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_11.5rem]">
            <StatusDonutChart
              data={slices}
              height={240}
              innerRadius={58}
              outerRadius={92}
              centerValue={stats.total}
              centerLabel="Total"
            />
            <StatusLegend items={slices} />
          </div>
        </ChartPanel>

        <ChartPanel
          title="Taux d'exécution"
          subtitle="Progression globale"
          className="lg:col-span-5"
        >
          <RadialStat
            value={stats.progression}
            label="Exécution"
            hint="Part des éléments terminés"
          />
        </ChartPanel>
      </div>

      <ChartPanel
        title="Volume par statut"
        subtitle="Comparaison des effectifs"
      >
        <StatusBarChart data={slices} height={260} />
      </ChartPanel>
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
              title="Répartition des marchés"
              subtitle={`${stats.total} marché${stats.total > 1 ? "s" : ""} sur la période`}
              className="lg:col-span-7"
            >
              <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
                <StatusDonutChart
                  data={funnel}
                  height={240}
                  innerRadius={58}
                  outerRadius={92}
                  centerValue={stats.total}
                  centerLabel="Marchés"
                />
                <StatusLegend items={funnel} />
              </div>
            </ChartPanel>

            <ChartPanel
              title="Contractualisation"
              subtitle="Contrats signés / total"
              className="lg:col-span-5"
            >
              <RadialStat
                value={progression}
                label="Taux de contractualisation"
                hint={`${stats.contrat_signe} contrat${stats.contrat_signe > 1 ? "s" : ""} signé${stats.contrat_signe > 1 ? "s" : ""}`}
              />
            </ChartPanel>
          </div>

          <div className="grid gap-3 lg:grid-cols-12">
            <ChartPanel
              title="Cycle de passation"
              subtitle="Progression par statut de marché"
              className="lg:col-span-7"
            >
              <FunnelBarChart data={funnel} height={260} />
            </ChartPanel>
            <ChartPanel
              title="Volume par statut"
              subtitle="DAO, attribution et signature"
              className="lg:col-span-5"
            >
              <StatusBarChart data={funnel} height={260} />
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

            <div className="grid gap-3 lg:grid-cols-12">
              <ChartPanel
                title="Jauges d'exécution"
                subtitle={projetStatsScopeLabel(projetScope)}
                className="lg:col-span-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <RadialStat
                    value={fin}
                    size={140}
                    label="Financière"
                    hint="Décaissement"
                  />
                  <RadialStat
                    value={phys}
                    size={140}
                    label="Physique"
                    hint="Avancement terrain"
                  />
                </div>
              </ChartPanel>

              <ChartPanel
                title="Comparaison des exécutions"
                subtitle="Financier vs physique"
                className="lg:col-span-7"
              >
                <ComparisonBarChart
                  financier={stats.execution_financiere}
                  physique={stats.execution_physique}
                  height={280}
                />
              </ChartPanel>
            </div>
          </DashboardSurface>
        ) : null}
      </StatsQueryStatus>
    </div>
  );
}
