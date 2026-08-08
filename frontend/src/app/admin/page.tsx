"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import {
  Activity,
  Briefcase,
  ClipboardList,
  FolderKanban,
  LayoutGrid,
  Scale,
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
import { DirectionFilter } from "@/components/direction-filter";
import { ProgressBar } from "@/components/execution-badge";
import { PageHeader } from "@/components/page-header";
import { HeroStat, StatCard, StatGrid } from "@/components/stat-card";
import { StatsQueryStatus } from "@/components/stats-query-status";
import {
  StatsPeriodFilter,
  useStatsPeriodState,
} from "@/components/stats-period-filter";
import { BRAND } from "@/lib/brand";
import {
  avgProgression,
  executionStatusSlices,
  MODULE_ACCENTS,
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
import { cn } from "@/lib/utils";

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

const PERIOD_HINTS: Record<ViewId, string> = {
  synthese: "Vue consolidée sur l'ensemble des modules de suivi.",
  activites: "Les activités PAO sont comptées selon leur date de début.",
  rcc: "Filtrage sur la date de la recommandation RCC.",
  missions: "Filtrage sur la date de la mission.",
  ppm: "Filtrage sur la date du marché (PPM).",
  projets: "Filtrage sur la date de début du projet.",
};

export default function AdminDashboardPage() {
  const [currentView, setCurrentView] = useState<ViewId>("synthese");
  const periodState = useStatsPeriodState();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${BRAND.bureauShort} · ${BRAND.program}`}
        title="Tableau de bord"
        description="Indicateurs consolidés et visualisations interactives du suivi d'exécution."
        display
      />

      <div className="inline-flex flex-wrap gap-1 rounded-[var(--radius-sm)] bg-veil p-1">
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              type="button"
              onClick={() => setCurrentView(view.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors duration-[var(--duration-fast)]",
                currentView === view.id
                  ? "bg-white text-graphite shadow-[var(--shadow-subtle)]"
                  : "text-slate hover:text-graphite",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-70" />
              {view.label}
            </button>
          );
        })}
      </div>

      <StatsPeriodFilter
        dateFieldHint={PERIOD_HINTS[currentView]}
        state={periodState}
      />

      {currentView === "synthese" && (
        <SyntheseView periodState={periodState} onNavigate={setCurrentView} />
      )}
      {currentView === "activites" && (
        <ActivitesView periodState={periodState} />
      )}
      {currentView === "rcc" && <RccView periodState={periodState} />}
      {currentView === "missions" && (
        <MissionsView periodState={periodState} />
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

  const retards = activites?.en_retard ?? 0;

  return (
    <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
      <div className="space-y-6 animate-fade-in">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-forest-ink via-[#00804a] to-[#006b3d] px-6 py-8 sm:px-10 sm:py-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #00ff95 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3de1ff 0%, transparent 40%)",
            }}
          />
          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <HeroStat
              label="Éléments suivis"
              value={totalItems}
              sublabel="Tous modules confondus"
            />
            <HeroStat
              label="Progression moyenne"
              value={`${avgExec} %`}
              sublabel="Exécution globale"
            />
            <HeroStat
              label="Activités en retard"
              value={retards}
              sublabel="PAO — tâches dépassées"
            />
            <HeroStat
              label="Projets actifs"
              value={projets?.total ?? 0}
              sublabel="Suivi financier & physique"
            />
          </div>
        </section>

        {/* Bento grid */}
        <div className="grid gap-4 lg:grid-cols-12">
          {activites && (
            <ModuleCard
              className="lg:col-span-4"
              title="Activités PAO"
              accent={MODULE_ACCENTS.activites}
              total={activites.total}
              progression={activites.progression}
              slices={executionStatusSlices(activites, true)}
              onDetail={() => onNavigate("activites")}
            />
          )}
          {rcc && (
            <ModuleCard
              className="lg:col-span-4"
              title="Recommandations RCC"
              accent={MODULE_ACCENTS.rcc}
              total={rcc.total}
              progression={rcc.progression}
              slices={executionStatusSlices(rcc)}
              onDetail={() => onNavigate("rcc")}
            />
          )}
          {missions && (
            <ModuleCard
              className="lg:col-span-4"
              title="Missions"
              accent={MODULE_ACCENTS.missions}
              total={missions.total}
              progression={missions.progression}
              slices={executionStatusSlices(missions)}
              onDetail={() => onNavigate("missions")}
            />
          )}
          {ppm && (
            <div className="lg:col-span-6">
              <ChartPanel
                title="Pipeline PPM"
                subtitle={`${ppm.total} marché${ppm.total > 1 ? "s" : ""} — avancement des statuts`}
                action={
                  <button
                    type="button"
                    onClick={() => onNavigate("ppm")}
                    className="text-xs font-medium text-forest-ink hover:underline"
                  >
                    Détail →
                  </button>
                }
              >
                <FunnelBarChart data={ppmFunnelSlices(ppm)} height={200} />
              </ChartPanel>
            </div>
          )}
          {projets && (
            <div className="lg:col-span-6">
              <ChartPanel
                title="Exécution projets"
                subtitle={`${projets.total} projet${projets.total > 1 ? "s" : ""} — comparaison financier / physique`}
                action={
                  <button
                    type="button"
                    onClick={() => onNavigate("projets")}
                    className="text-xs font-medium text-forest-ink hover:underline"
                  >
                    Détail →
                  </button>
                }
              >
                <ComparisonBarChart
                  financier={projets.execution_financiere}
                  physique={projets.execution_physique}
                  height={200}
                />
              </ChartPanel>
            </div>
          )}
        </div>
      </div>
    </StatsQueryStatus>
  );
}

function ModuleCard({
  title,
  accent,
  total,
  progression,
  slices,
  onDetail,
  className,
}: {
  title: string;
  accent: (typeof MODULE_ACCENTS)[keyof typeof MODULE_ACCENTS];
  total: number;
  progression: number | string;
  slices: ReturnType<typeof executionStatusSlices>;
  onDetail: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "panel-grain flex flex-col border",
        accent.bg,
        accent.border,
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className={cn("text-sm font-semibold", accent.text)}>{title}</h3>
          <p className="mt-0.5 text-xs text-slate">
            {total} élément{total > 1 ? "s" : ""}
          </p>
        </div>
        <ProgressionRing
          value={progression}
          size={56}
          strokeWidth={5}
          fillColor="#009959"
        />
      </div>
      <StatusDonutChart
        data={slices}
        height={140}
        innerRadius={42}
        outerRadius={58}
      />
      <StatusLegend items={slices} className="mt-2 border-t border-cloud/60 pt-2" />
      <button
        type="button"
        onClick={onDetail}
        className="mt-3 text-left text-xs font-medium text-forest-ink hover:underline"
      >
        Voir le détail →
      </button>
    </div>
  );
}

/* ─── Vues détaillées ─── */

function ExecutionDashboard({
  stats,
  includeRetard,
  progressionLabel,
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
  progressionLabel?: string;
}) {
  const slices = executionStatusSlices(
    stats as Parameters<typeof executionStatusSlices>[0],
    includeRetard,
  );

  return (
    <>
      <StatGrid>
        <StatCard title="Total" value={stats.total} accent="forest" />
        <StatCard
          title="Non démarrées"
          value={stats.non_demare}
          accent="default"
        />
        <StatCard title="En cours" value={stats.en_cours} accent="sky" />
        <StatCard title="Terminées" value={stats.termine} accent="mint" />
        {includeRetard && stats.en_retard != null && (
          <StatCard title="En retard" value={stats.en_retard} accent="alert" />
        )}
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartPanel
          title="Répartition par statut"
          subtitle="Distribution des éléments sur la période"
          className="lg:col-span-3"
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <StatusDonutChart
              data={slices}
              centerValue={stats.total}
              centerLabel="Total"
              height={260}
            />
            <StatusLegend items={slices} className="sm:min-w-[160px] sm:pt-4" />
          </div>
        </ChartPanel>

        <ChartPanel
          title="Progression globale"
          subtitle={progressionLabel ?? "Taux d'exécution moyen"}
          className="lg:col-span-2 flex flex-col items-center justify-center"
        >
          <ProgressionRing
            value={stats.progression}
            size={140}
            strokeWidth={10}
            label="Exécution"
          />
          <div className="mt-6 w-full">
            <ProgressBar label="Avancement" value={stats.progression} />
          </div>
        </ChartPanel>
      </div>
    </>
  );
}

function ActivitesView({ periodState }: { periodState: StatsPeriodState }) {
  const [direction, setDirection] = useState<string | null>(null);
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-activites", direction, period],
    queryFn: () => getStatsActivites(direction ?? undefined, period),
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <DirectionFilter value={direction} onChange={setDirection} />
      <StatsQueryStatus
        isLoading={isLoading}
        isError={isError}
        error={error}
      >
        {stats ? (
          <ExecutionDashboard stats={stats} includeRetard progressionLabel="Activités PAO" />
        ) : null}
      </StatsQueryStatus>
    </div>
  );
}

function RccView({ periodState }: { periodState: StatsPeriodState }) {
  const [trimestre, setTrimestre] = useState<number | undefined>(undefined);
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-rcc", trimestre, period],
    queryFn: () => getStatsRcc({ trimestre, period }),
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <TrimestreFilter value={trimestre} onChange={setTrimestre} />
      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <ExecutionDashboard stats={stats} progressionLabel="Recommandations RCC" />
        ) : null}
      </StatsQueryStatus>
    </div>
  );
}

function MissionsView({ periodState }: { periodState: StatsPeriodState }) {
  const [trimestre, setTrimestre] = useState<number | undefined>(undefined);
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-missions", trimestre, period],
    queryFn: () => getStatsMissions({ trimestre, period }),
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <TrimestreFilter value={trimestre} onChange={setTrimestre} />
      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <ExecutionDashboard stats={stats} progressionLabel="Missions" />
        ) : null}
      </StatsQueryStatus>
    </div>
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
    <div className="space-y-4 animate-fade-in">
      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <>
            <StatGrid className="xl:grid-cols-5">
              <StatCard title="Total marchés" value={stats.total} accent="forest" />
              <StatCard
                title={PPM_STATUT_LABELS.dao_elabore}
                value={stats.dao_elabore}
                accent="sky"
              />
              <StatCard
                title={PPM_STATUT_LABELS.dao_publie}
                value={stats.dao_publie}
                accent="sky"
              />
              <StatCard
                title={PPM_STATUT_LABELS.marche_attribue}
                value={stats.marche_attribue}
                accent="mint"
              />
              <StatCard
                title={PPM_STATUT_LABELS.contrat_signe}
                value={stats.contrat_signe}
                accent="forest"
              />
            </StatGrid>

            <div className="grid gap-4 lg:grid-cols-5">
              <ChartPanel
                title="Entonnoir des statuts"
                subtitle="Progression du cycle de passation"
                className="lg:col-span-3"
              >
                <FunnelBarChart data={funnel} height={280} />
              </ChartPanel>

              <ChartPanel
                title="Taux de contractualisation"
                subtitle="Contrats signés / total marchés"
                className="lg:col-span-2 flex flex-col items-center justify-center"
              >
                <ProgressionRing
                  value={progression}
                  size={140}
                  strokeWidth={10}
                  fillColor="#009959"
                  label="Signés"
                />
                <div className="mt-6 w-full">
                  <ProgressBar
                    label="Contrats signés / total"
                    value={progression}
                  />
                </div>
              </ChartPanel>
            </div>
          </>
        ) : null}
      </StatsQueryStatus>
    </div>
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
    <div className="space-y-4 animate-fade-in">
      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <>
            <StatGrid className="sm:grid-cols-3">
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
            </StatGrid>

            <div className="grid gap-4 lg:grid-cols-5">
              <ChartPanel
                title="Comparaison des exécutions"
                subtitle="Moyennes financière et physique"
                className="lg:col-span-3"
              >
                <ComparisonBarChart
                  financier={stats.execution_financiere}
                  physique={stats.execution_physique}
                  height={280}
                />
              </ChartPanel>

              <ChartPanel
                title="Écart d'exécution"
                subtitle="Différence financier − physique"
                className="lg:col-span-2"
              >
                <div className="flex h-[280px] flex-col items-center justify-center gap-6">
                  <ProgressionRing
                    value={fin}
                    size={100}
                    strokeWidth={8}
                    fillColor="#009959"
                    label="Financier"
                  />
                  <ProgressionRing
                    value={phys}
                    size={100}
                    strokeWidth={8}
                    fillColor="#3de1ff"
                    label="Physique"
                  />
                  <p className="text-center text-sm text-slate">
                    Écart de{" "}
                    <span className="font-semibold text-graphite">
                      {ecart.toFixed(0)} points
                    </span>
                  </p>
                </div>
              </ChartPanel>
            </div>
          </>
        ) : null}
      </StatsQueryStatus>
    </div>
  );
}
