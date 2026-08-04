"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { DirectionFilter } from "@/components/direction-filter";
import { ProgressBar } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { StatCard, StatGrid } from "@/components/stat-card";
import { getStatsActivites } from "@/lib/api";

export default function StatsPaoPage() {
  return (
    <ProtectedRoute>
      <StatsPaoContent />
    </ProtectedRoute>
  );
}

function StatsPaoContent() {
  const [direction, setDirection] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-activites", direction],
    queryFn: () => getStatsActivites(direction ?? undefined),
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
            Statistiques — Plan d&apos;Action
          </h1>
        </div>

        <DirectionFilter value={direction} onChange={setDirection} />

        {isLoading ? (
          <p className="text-sm text-zinc-400">Chargement…</p>
        ) : stats ? (
          <>
            <StatGrid>
              <StatCard title="Total activités" value={stats.total} />
              <StatCard title="Non démarrées" value={stats.non_demare} />
              <StatCard title="En cours" value={stats.en_cours} />
              <StatCard title="Terminées" value={stats.termine} />
              <StatCard title="En retard" value={stats.en_retard} />
            </StatGrid>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <ProgressBar
                label="Progression globale"
                value={stats.progression}
              />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
