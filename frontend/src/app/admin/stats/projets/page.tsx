"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { ProgressBar } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { StatCard, StatGrid } from "@/components/stat-card";
import { getStatsProjets } from "@/lib/api";

export default function StatsProjetsPage() {
  return (
    <ProtectedRoute>
      <StatsProjetsContent />
    </ProtectedRoute>
  );
}

function StatsProjetsContent() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-projets"],
    queryFn: () => getStatsProjets(),
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
            Statistiques — Projets
          </h1>
        </div>

        {isLoading ? (
          <p className="text-sm text-zinc-400">Chargement…</p>
        ) : stats ? (
          <>
            <StatGrid>
              <StatCard title="Total projets" value={stats.total} />
            </StatGrid>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <ProgressBar
                  label="Exécution financière moyenne"
                  value={stats.execution_financiere}
                />
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <ProgressBar
                  label="Exécution physique moyenne"
                  value={stats.execution_physique}
                />
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
