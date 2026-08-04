"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { ProgressBar } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
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
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 space-y-6 p-8">
        <div>
          <Link href="/admin/stats" className="text-sm text-emerald-700 hover:underline">
            ← Statistiques
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            Statistiques — Missions
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTrimestre(undefined)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              trimestre === undefined
                ? "bg-emerald-700 text-white"
                : "bg-white ring-1 ring-zinc-200"
            }`}
          >
            Année
          </button>
          {[1, 2, 3, 4].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrimestre(t)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                trimestre === t
                  ? "bg-emerald-700 text-white"
                  : "bg-white ring-1 ring-zinc-200"
              }`}
            >
              T{t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-sm text-zinc-400">Chargement…</p>
        ) : stats ? (
          <>
            <StatGrid>
              <StatCard title="Total missions" value={stats.total} />
              <StatCard title="Non démarrées" value={stats.non_demare} />
              <StatCard title="En cours" value={stats.en_cours} />
              <StatCard title="Terminées" value={stats.termine} />
            </StatGrid>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <ProgressBar label="Progression" value={stats.progression} />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
