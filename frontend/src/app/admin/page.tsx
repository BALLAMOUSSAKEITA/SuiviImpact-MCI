"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { DirectionFilter } from "@/components/direction-filter";
import { ProgressBar } from "@/components/execution-badge";
import { PageHeader } from "@/components/page-header";
import { StatCard, StatGrid } from "@/components/stat-card";
import { StatsQueryStatus } from "@/components/stats-query-status";
import {
  StatsPeriodFilter,
  useStatsPeriodState,
} from "@/components/stats-period-filter";
import { BRAND } from "@/lib/brand";
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
  { id: "activites", label: "Activités" },
  { id: "rcc", label: "RCC" },
  { id: "missions", label: "Missions" },
  { id: "ppm", label: "PPM" },
  { id: "projets", label: "Projets" },
] as const;

type ViewId = (typeof views)[number]["id"];

const PERIOD_HINTS: Record<ViewId, string> = {
  activites:
    "Les activités PAO sont comptées selon leur date de début.",
  rcc: "Filtrage sur la date de la recommandation RCC.",
  missions: "Filtrage sur la date de la mission.",
  ppm: "Filtrage sur la date du marché (PPM).",
  projets: "Filtrage sur la date de début du projet.",
};

export default function AdminDashboardPage() {
  const [currentView, setCurrentView] = useState<ViewId>("activites");
  const periodState = useStatsPeriodState();

  return (
    <>
      <PageHeader
        eyebrow={`${BRAND.bureauShort} · ${BRAND.program}`}
        title="Tableau de bord"
        description="Vue d'ensemble des indicateurs de suivi."
        display
      />

      {/* Sélecteur de vue */}
      <div className="inline-flex flex-wrap gap-1 rounded-[var(--radius-sm)] bg-veil p-1">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => setCurrentView(view.id)}
            className={cn(
              "rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors duration-[var(--duration-fast)]",
              currentView === view.id
                ? "bg-white text-graphite shadow-[var(--shadow-subtle)]"
                : "text-slate hover:text-graphite",
            )}
          >
            {view.label}
          </button>
        ))}
      </div>

      <StatsPeriodFilter
        dateFieldHint={PERIOD_HINTS[currentView]}
        state={periodState}
      />

      {/* Contenu selon la vue */}
      {currentView === "activites" && <ActivitesView periodState={periodState} />}
      {currentView === "rcc" && <RccView periodState={periodState} />}
      {currentView === "missions" && <MissionsView periodState={periodState} />}
      {currentView === "ppm" && <PpmView periodState={periodState} />}
      {currentView === "projets" && <ProjetsView periodState={periodState} />}
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
    <>
      <DirectionFilter value={direction} onChange={setDirection} />
      <StatsQueryStatus
        isLoading={isLoading}
        isError={isError}
        error={error}
      >
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
            <ProgressBar label="Progression globale" value={stats.progression} />
          </div>
        </>
        ) : null}
      </StatsQueryStatus>
    </>
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
    <>
      <TrimestreFilter value={trimestre} onChange={setTrimestre} />
      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <>
            <StatGrid>
            <StatCard title="Total RCC" value={stats.total} />
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

function MissionsView({ periodState }: { periodState: StatsPeriodState }) {
  const [trimestre, setTrimestre] = useState<number | undefined>(undefined);
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-missions", trimestre, period],
    queryFn: () => getStatsMissions({ trimestre, period }),
  });

  return (
    <>
      <TrimestreFilter value={trimestre} onChange={setTrimestre} />
      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <>
            <StatGrid>
            <StatCard title="Total missions" value={stats.total} />
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

function PpmView({ periodState }: { periodState: StatsPeriodState }) {
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
      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <>
            <StatGrid>
            <StatCard title="Total marchés" value={stats.total} />
            <StatCard title={PPM_STATUT_LABELS.dao_elabore} value={stats.dao_elabore} />
            <StatCard title={PPM_STATUT_LABELS.dao_publie} value={stats.dao_publie} />
            <StatCard title={PPM_STATUT_LABELS.marche_attribue} value={stats.marche_attribue} />
            <StatCard title={PPM_STATUT_LABELS.contrat_signe} value={stats.contrat_signe} />
          </StatGrid>
          <div className="panel-grain">
            <ProgressBar label="Contrats signés / total" value={progression} />
          </div>
        </>
        ) : null}
      </StatsQueryStatus>
    </>
  );
}

function ProjetsView({ periodState }: { periodState: StatsPeriodState }) {
  const { params: period } = periodState;

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["stats-projets", period],
    queryFn: () => getStatsProjets(undefined, period),
  });

  return (
    <>
      <StatsQueryStatus isLoading={isLoading} isError={isError} error={error}>
        {stats ? (
          <>
            <StatGrid>
            <StatCard title="Total projets" value={stats.total} />
          </StatGrid>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel-grain">
              <ProgressBar label="Exécution financière moyenne" value={stats.execution_financiere} />
            </div>
            <div className="panel-grain">
              <ProgressBar label="Exécution physique moyenne" value={stats.execution_physique} />
            </div>
          </div>
        </>
        ) : null}
      </StatsQueryStatus>
    </>
  );
}
