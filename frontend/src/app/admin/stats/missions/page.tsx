"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import Link from "next/link";
import { useState } from "react";

import { ProgressBar } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { StatCard, StatGrid } from "@/components/stat-card";
import { getStatsMissions } from "@/lib/api";
import { DEFAULT_ANNEE } from "@/types";

export default function StatsMissionsPage() {
  return (
    <ProtectedRoute>
      <StatsMissionsContent />
    </ProtectedRoute>
  );
}

function StatsMissionsContent() {
  const [trimestre, setTrimestre] = useState<number | undefined>(undefined);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-missions", trimestre, DEFAULT_ANNEE],
    queryFn: () => getStatsMissions({ trimestre, annee: DEFAULT_ANNEE }),
  });

  return (
    <AdminShell>
        <div className="space-y-8">
        <div>
          <Link href="/admin/stats" className="text-sm text-electric-blue hover:underline">
            ← Statistiques
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-charcoal">
            Statistiques — Missions
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTrimestre(undefined)}
            className={`rounded-[var(--radius-card)] px-3 py-1.5 text-sm font-medium ${
              trimestre === undefined
                ? "bg-midnight-ink text-white"
                : "bg-canvas-white ring-1 ring-ash"
            }`}
          >
            Année
          </button>
          {[1, 2, 3, 4].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrimestre(t)}
              className={`rounded-[var(--radius-card)] px-3 py-1.5 text-sm font-medium ${
                trimestre === t
                  ? "bg-midnight-ink text-white"
                  : "bg-canvas-white ring-1 ring-ash"
              }`}
            >
              T{t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-sm text-fog">Chargement…</p>
        ) : stats ? (
          <>
            <StatGrid>
              <StatCard title="Total missions" value={stats.total} />
              <StatCard title="Non démarrées" value={stats.non_demare} />
              <StatCard title="En cours" value={stats.en_cours} />
              <StatCard title="Terminées" value={stats.termine} />
            </StatGrid>
            <div className="rounded-[var(--radius-card)] border border-ash bg-canvas-white p-6 ">
              <ProgressBar label="Progression" value={stats.progression} />
            </div>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
