"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderKanban,
  Pause,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import { DirectionFilter } from "@/components/direction-filter";
import { ProgressBar } from "@/components/execution-badge";
import { PageHeader } from "@/components/page-header";
import { StatCard, StatGrid } from "@/components/stat-card";
import { BRAND } from "@/lib/brand";
import {
  getStatsActivites,
  getStatsMissions,
  getStatsPpm,
  getStatsProjets,
  getStatsRcc,
} from "@/lib/api";
import { DEFAULT_ANNEE, PPM_STATUT_LABELS } from "@/types";
import { cn } from "@/lib/utils";

const views = [
  { id: "activites", label: "Activités" },
  { id: "rcc", label: "RCC" },
  { id: "missions", label: "Missions" },
  { id: "ppm", label: "PPM" },
  { id: "projets", label: "Projets" },
] as const;

type ViewId = (typeof views)[number]["id"];

export default function AdminDashboardPage() {
  const [currentView, setCurrentView] = useState<ViewId>("activites");

  return (
    <>
      <PageHeader
        eyebrow={`${BRAND.bureauShort} · ${BRAND.program}`}
        title="Tableau de bord"
        description="Vue d'ensemble des indicateurs de suivi."
        display
      />

      {/* Sélecteur de vue */}
      <div className="flex flex-wrap gap-1 rounded-[var(--radius-card)] border border-cloud/80 bg-veil/50 p-1">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => setCurrentView(view.id)}
            className={cn(
              "rounded-[calc(var(--radius-card)-4px)] px-4 py-2 text-[13px] font-medium transition-all duration-[var(--duration-fast)]",
              currentView === view.id
                ? "bg-white text-forest-ink shadow-sm ring-1 ring-cloud/80"
                : "text-slate hover:text-graphite",
            )}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Contenu selon la vue */}
      {currentView === "activites" && <ActivitesView />}
      {currentView === "rcc" && <RccView />}
      {currentView === "missions" && <MissionsView />}
      {currentView === "ppm" && <PpmView />}
      {currentView === "projets" && <ProjetsView />}
    </>
  );
}

function ActivitesView() {
  const [direction, setDirection] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-activites", direction],
    queryFn: () => getStatsActivites(direction ?? undefined),
  });

  return (
    <>
      <DirectionFilter value={direction} onChange={setDirection} />
      {isLoading ? (
        <StatGrid>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-[var(--radius-card)]" />
          ))}
        </StatGrid>
      ) : stats ? (
        <>
          <StatGrid>
            <StatCard title="Total activités" value={stats.total} icon={Activity} accent="default" />
            <StatCard title="Non démarrées" value={stats.non_demare} icon={Pause} accent="blue" />
            <StatCard title="En cours" value={stats.en_cours} icon={Clock} accent="amber" />
            <StatCard title="Terminées" value={stats.termine} icon={CheckCircle2} accent="green" />
            <StatCard title="En retard" value={stats.en_retard} icon={AlertTriangle} accent="red" />
          </StatGrid>
          <div className="rounded-[var(--radius-card)] border border-cloud bg-white p-6 shadow-[var(--shadow-card)]">
            <ProgressBar label="Progression globale" value={stats.progression} />
          </div>
        </>
      ) : null}
    </>
  );
}

function TrimestreSelector({ value, onChange }: { value: number | undefined; onChange: (v: number | undefined) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-[var(--radius-card)] border border-cloud/80 bg-veil/50 p-1 w-fit">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={cn(
          "rounded-[calc(var(--radius-card)-4px)] px-3.5 py-1.5 text-sm font-medium transition-all",
          value === undefined
            ? "bg-white text-forest-ink shadow-sm ring-1 ring-cloud/80"
            : "text-slate hover:text-graphite",
        )}
      >
        Année
      </button>
      {[1, 2, 3, 4].map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "rounded-[calc(var(--radius-card)-4px)] px-3.5 py-1.5 text-sm font-medium transition-all",
            value === t
              ? "bg-white text-forest-ink shadow-sm ring-1 ring-cloud/80"
              : "text-slate hover:text-graphite",
          )}
        >
          T{t}
        </button>
      ))}
    </div>
  );
}

function RccView() {
  const [trimestre, setTrimestre] = useState<number | undefined>(undefined);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-rcc", trimestre, DEFAULT_ANNEE],
    queryFn: () => getStatsRcc({ trimestre, annee: DEFAULT_ANNEE }),
  });

  return (
    <>
      <TrimestreSelector value={trimestre} onChange={setTrimestre} />
      {isLoading ? (
        <StatGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-[var(--radius-card)]" />
          ))}
        </StatGrid>
      ) : stats ? (
        <>
          <StatGrid>
            <StatCard title="Total RCC" value={stats.total} icon={Activity} accent="default" />
            <StatCard title="Non démarrées" value={stats.non_demare} icon={Pause} accent="blue" />
            <StatCard title="En cours" value={stats.en_cours} icon={Clock} accent="amber" />
            <StatCard title="Terminées" value={stats.termine} icon={CheckCircle2} accent="green" />
          </StatGrid>
          <div className="rounded-[var(--radius-card)] border border-cloud bg-white p-6 shadow-[var(--shadow-card)]">
            <ProgressBar label="Progression" value={stats.progression} />
          </div>
        </>
      ) : null}
    </>
  );
}

function MissionsView() {
  const [trimestre, setTrimestre] = useState<number | undefined>(undefined);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-missions", trimestre, DEFAULT_ANNEE],
    queryFn: () => getStatsMissions({ trimestre, annee: DEFAULT_ANNEE }),
  });

  return (
    <>
      <TrimestreSelector value={trimestre} onChange={setTrimestre} />
      {isLoading ? (
        <StatGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-[var(--radius-card)]" />
          ))}
        </StatGrid>
      ) : stats ? (
        <>
          <StatGrid>
            <StatCard title="Total missions" value={stats.total} icon={Activity} accent="default" />
            <StatCard title="Non démarrées" value={stats.non_demare} icon={Pause} accent="blue" />
            <StatCard title="En cours" value={stats.en_cours} icon={Clock} accent="amber" />
            <StatCard title="Terminées" value={stats.termine} icon={CheckCircle2} accent="green" />
          </StatGrid>
          <div className="rounded-[var(--radius-card)] border border-cloud bg-white p-6 shadow-[var(--shadow-card)]">
            <ProgressBar label="Progression" value={stats.progression} />
          </div>
        </>
      ) : null}
    </>
  );
}

function PpmView() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-ppm"],
    queryFn: () => getStatsPpm(),
  });

  const progression =
    stats && stats.total > 0
      ? ((stats.contrat_signe / stats.total) * 100).toFixed(0)
      : "0";

  return (
    <>
      {isLoading ? (
        <StatGrid>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-[var(--radius-card)]" />
          ))}
        </StatGrid>
      ) : stats ? (
        <>
          <StatGrid>
            <StatCard title="Total marchés" value={stats.total} icon={Activity} accent="default" />
            <StatCard title={PPM_STATUT_LABELS.dao_elabore} value={stats.dao_elabore} accent="blue" />
            <StatCard title={PPM_STATUT_LABELS.dao_publie} value={stats.dao_publie} accent="amber" />
            <StatCard title={PPM_STATUT_LABELS.marche_attribue} value={stats.marche_attribue} accent="green" />
            <StatCard title={PPM_STATUT_LABELS.contrat_signe} value={stats.contrat_signe} icon={CheckCircle2} accent="green" />
          </StatGrid>
          <div className="rounded-[var(--radius-card)] border border-cloud bg-white p-6 shadow-[var(--shadow-card)]">
            <ProgressBar label="Contrats signés / total" value={progression} />
          </div>
        </>
      ) : null}
    </>
  );
}

function ProjetsView() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-projets"],
    queryFn: () => getStatsProjets(),
  });

  return (
    <>
      {isLoading ? (
        <StatGrid>
          <div className="skeleton h-28 rounded-[var(--radius-card)]" />
        </StatGrid>
      ) : stats ? (
        <>
          <StatGrid>
            <StatCard title="Total projets" value={stats.total} icon={FolderKanban} accent="default" />
          </StatGrid>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-cloud bg-white p-6 shadow-[var(--shadow-card)]">
              <ProgressBar label="Exécution financière moyenne" value={stats.execution_financiere} />
            </div>
            <div className="rounded-[var(--radius-card)] border border-cloud bg-white p-6 shadow-[var(--shadow-card)]">
              <ProgressBar label="Exécution physique moyenne" value={stats.execution_physique} />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
