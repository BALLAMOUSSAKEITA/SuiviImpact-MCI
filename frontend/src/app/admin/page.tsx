"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Briefcase,
  ClipboardList,
  FolderKanban,
  LayoutGrid,
  Scale,
  Target,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import { ComparisonBarChart } from "@/components/charts/comparison-bar-chart";
import { ChartPanel } from "@/components/charts/chart-panel";
import { FunnelBarChart } from "@/components/charts/funnel-bar-chart";
import { ProgressionRing } from "@/components/charts/progression-ring";
import {
  StatusDonutChart,
  StatusLegend,
} from "@/components/charts/status-donut-chart";
import {
  StatusStackBar,
  StatusStackLegend,
} from "@/components/charts/status-stack-bar";
import { DashboardToolbar } from "@/components/dashboard/dashboard-toolbar";
import { KpiMetric, ModuleTile } from "@/components/dashboard/kpi-metric";
import { DirectionFilter } from "@/components/direction-filter";
import { ProgressBar } from "@/components/execution-badge";
import { PageHeader } from "@/components/page-header";
import { StatCard, StatGrid } from "@/components/stat-card";
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
  { id: "synthese", label: "Synthèse", icon: LayoutGrid },
  { id: "activites", label: "Activités", icon: Activity },
  { id: "rcc", label: "RCC", icon: Scale },
  { id: "missions", label: "Missions", icon: Briefcase },
  { id: "ppm", label: "PPM", icon: ClipboardList },
  { id: "projets", label: "Projets", icon: FolderKanban },
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
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${BRAND.bureauShort} · ${BRAND.program}`}
        title="Tableau de bord"
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
      {currentView === "projets" && (
        <ProjetsView periodState={periodState} />
      )}
    </div>
  );
}

/* ─── Synthèse ─── */

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
        queryFn: () => getStatsProjets(undefined, period),
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

  return (
    <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
      <div className="space-y-5 animate-fade-in">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiMetric
            label="Éléments suivis"
            value={totalItems}
            hint="Tous modules"
            icon={Target}
            iconBgClassName="bg-mint"
            iconClassName="text-forest-ink"
          />
          <KpiMetric
            label="Progression moyenne"
            value={`${avgExec} %`}
            hint="Exécution globale"
            icon={TrendingUp}
            iconBgClassName="bg-sky"
            iconClassName="text-carbon"
          />
          <KpiMetric
            label="Activités en retard"
            value={activites?.en_retard ?? 0}
            hint="Tâches PAO dépassées"
            icon={AlertTriangle}
            iconBgClassName="bg-peach"
            iconClassName="text-[#c0392b]"
          />
          <KpiMetric
            label="Projets actifs"
            value={projets?.total ?? 0}
            hint="Suivi financier & physique"
            icon={FolderKanban}
            iconBgClassName="bg-lavender"
            iconClassName="text-carbon"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {activites && (
            <ModuleTile
              title="Activités PAO"
              subtitle={`${activites.total} activité${activites.total > 1 ? "s" : ""}`}
              progression={activites.progression}
              accentBar="bg-forest-ink"
              accentText="text-forest-ink"
              onClick={() => onNavigate("activites")}
            >
              <StatusStackBar
                segments={executionStatusSlices(activites, true)}
                height={8}
              />
              <StatusStackLegend
                segments={executionStatusSlices(activites, true)}
                compact
                className="mt-3"
              />
            </ModuleTile>
          )}
          {rcc && (
            <ModuleTile
              title="Recommandations RCC"
              subtitle={`${rcc.total} recommandation${rcc.total > 1 ? "s" : ""}`}
              progression={rcc.progression}
              accentBar="bg-ice-blue"
              accentText="text-carbon"
              onClick={() => onNavigate("rcc")}
            >
              <StatusStackBar segments={executionStatusSlices(rcc)} height={8} />
              <StatusStackLegend
                segments={executionStatusSlices(rcc)}
                compact
                className="mt-3"
              />
            </ModuleTile>
          )}
          {missions && (
            <ModuleTile
              title="Missions"
              subtitle={`${missions.total} mission${missions.total > 1 ? "s" : ""}`}
              progression={missions.progression}
              accentBar="bg-periwinkle"
              accentText="text-carbon"
              onClick={() => onNavigate("missions")}
            >
              <StatusStackBar segments={executionStatusSlices(missions)} height={8} />
              <StatusStackLegend
                segments={executionStatusSlices(missions)}
                compact
                className="mt-3"
              />
            </ModuleTile>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {ppm && (
            <ChartPanel
              title="Pipeline PPM"
              subtitle={`${ppm.total} marché${ppm.total > 1 ? "s" : ""}`}
              className="border border-cloud/70 shadow-[var(--shadow-subtle)]"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate("ppm")}
                  className="text-xs font-medium text-forest-ink hover:underline"
                >
                  Détail
                </button>
              }
            >
              <FunnelBarChart data={ppmFunnelSlices(ppm)} height={220} />
            </ChartPanel>
          )}
          {projets && (
            <ChartPanel
              title="Exécution projets"
              subtitle="Financier vs physique"
              className="border border-cloud/70 shadow-[var(--shadow-subtle)]"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate("projets")}
                  className="text-xs font-medium text-forest-ink hover:underline"
                >
                  Détail
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
      </div>
    </StatsQueryStatus>
  );
}

/* ─── Vues détaillées ─── */

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

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total" value={stats.total} accent="forest" className="lg:col-span-1" />
        <StatCard title="Non démarrées" value={stats.non_demare} accent="default" />
        <StatCard title="En cours" value={stats.en_cours} accent="sky" />
        <StatCard title="Terminées" value={stats.termine} accent="mint" />
        {includeRetard && stats.en_retard != null && (
          <StatCard title="En retard" value={stats.en_retard} accent="alert" />
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <ChartPanel
          title="Répartition"
          subtitle="Distribution par statut d'exécution"
          className="border border-cloud/70 shadow-[var(--shadow-subtle)] lg:col-span-8"
        >
          <StatusStackBar segments={slices} height={10} className="mb-4" />
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <StatusDonutChart
              data={slices}
              centerValue={stats.total}
              centerLabel="Total"
              height={240}
              innerRadius={58}
              outerRadius={82}
            />
            <StatusLegend items={slices} className="sm:min-w-[150px] sm:pt-6" />
          </div>
        </ChartPanel>

        <ChartPanel
          title="Progression"
          subtitle="Taux d'exécution"
          className="border border-cloud/70 shadow-[var(--shadow-subtle)] lg:col-span-4"
        >
          <div className="flex flex-col items-center py-2">
            <ProgressionRing
              value={stats.progression}
              size={128}
              strokeWidth={9}
              label="Exécution"
            />
            <ProgressBar
              label="Avancement"
              value={stats.progression}
              className="mt-6 w-full"
            />
          </div>
        </ChartPanel>
      </div>
    </div>
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
      {stats ? (
        <div className="animate-fade-in">
          <ExecutionDashboard stats={stats} includeRetard />
        </div>
      ) : null}
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
      {stats ? (
        <div className="animate-fade-in">
          <ExecutionDashboard stats={stats} />
        </div>
      ) : null}
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
      {stats ? (
        <div className="animate-fade-in">
          <ExecutionDashboard stats={stats} />
        </div>
      ) : null}
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
        <div className="space-y-4 animate-fade-in">
          <StatGrid className="xl:grid-cols-5">
            <StatCard title="Total marchés" value={stats.total} accent="forest" />
            <StatCard title={PPM_STATUT_LABELS.dao_elabore} value={stats.dao_elabore} accent="sky" />
            <StatCard title={PPM_STATUT_LABELS.dao_publie} value={stats.dao_publie} accent="sky" />
            <StatCard title={PPM_STATUT_LABELS.marche_attribue} value={stats.marche_attribue} accent="mint" />
            <StatCard title={PPM_STATUT_LABELS.contrat_signe} value={stats.contrat_signe} accent="forest" />
          </StatGrid>

          <div className="grid gap-3 lg:grid-cols-12">
            <ChartPanel
              title="Entonnoir des statuts"
              subtitle="Cycle de passation des marchés"
              className="border border-cloud/70 shadow-[var(--shadow-subtle)] lg:col-span-8"
            >
              <FunnelBarChart data={funnel} height={260} />
            </ChartPanel>

            <ChartPanel
              title="Contractualisation"
              subtitle="Contrats signés / total"
              className="border border-cloud/70 shadow-[var(--shadow-subtle)] lg:col-span-4"
            >
              <div className="flex flex-col items-center py-2">
                <ProgressionRing
                  value={progression}
                  size={128}
                  strokeWidth={9}
                  fillColor="#009959"
                  label="Signés"
                />
                <ProgressBar
                  label="Contrats signés / total"
                  value={progression}
                  className="mt-6 w-full"
                />
              </div>
            </ChartPanel>
          </div>
        </div>
      ) : null}
    </StatsQueryStatus>
  );
}

function ProjetsView({ periodState }: { periodState: StatsPeriodState }) {
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-projets", period],
    queryFn: () => getStatsProjets(undefined, period),
  });

  const fin = stats ? parseProgress(stats.execution_financiere) : 0;
  const phys = stats ? parseProgress(stats.execution_physique) : 0;
  const ecart = Math.abs(fin - phys);

  return (
    <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
      {stats ? (
        <div className="space-y-4 animate-fade-in">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard title="Total projets" value={stats.total} accent="forest" />
            <StatCard
              title="Exécution financière"
              value={`${fin.toFixed(0)} %`}
              accent="mint"
              showProgress
              progressValue={stats.execution_financiere}
            />
            <StatCard
              title="Exécution physique"
              value={`${phys.toFixed(0)} %`}
              accent="sky"
              showProgress
              progressValue={stats.execution_physique}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-12">
            <ChartPanel
              title="Comparaison des exécutions"
              subtitle="Moyennes financière et physique"
              className="border border-cloud/70 shadow-[var(--shadow-subtle)] lg:col-span-8"
            >
              <ComparisonBarChart
                financier={stats.execution_financiere}
                physique={stats.execution_physique}
                height={260}
              />
            </ChartPanel>

            <ChartPanel
              title="Écart d'exécution"
              subtitle="Financier − physique"
              className="border border-cloud/70 shadow-[var(--shadow-subtle)] lg:col-span-4"
            >
              <div className="flex h-[260px] flex-col items-center justify-center gap-4">
                <div className="flex gap-6">
                  <ProgressionRing
                    value={fin}
                    size={88}
                    strokeWidth={7}
                    fillColor="#009959"
                    label="Financier"
                  />
                  <ProgressionRing
                    value={phys}
                    size={88}
                    strokeWidth={7}
                    fillColor="#3de1ff"
                    label="Physique"
                  />
                </div>
                <p className="text-center text-sm text-slate">
                  Écart de{" "}
                  <span className="font-semibold text-graphite">
                    {ecart.toFixed(0)} pts
                  </span>
                </p>
              </div>
            </ChartPanel>
          </div>
        </div>
      ) : null}
    </StatsQueryStatus>
  );
}
