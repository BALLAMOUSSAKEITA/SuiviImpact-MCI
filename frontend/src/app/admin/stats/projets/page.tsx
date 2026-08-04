"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import Link from "next/link";

import { ProgressBar } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
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
    <AdminShell>
        <div className="space-y-8">
        <div>
          <Link href="/admin/stats" className="text-sm text-electric-blue hover:underline">
            ← Statistiques
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-charcoal">
            Statistiques — Projets
          </h1>
        </div>

        {isLoading ? (
          <p className="text-sm text-fog">Chargement…</p>
        ) : stats ? (
          <>
            <StatGrid>
              <StatCard title="Total projets" value={stats.total} />
            </StatGrid>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[var(--radius-card)] border border-ash bg-canvas-white p-6 ">
                <ProgressBar
                  label="Exécution financière moyenne"
                  value={stats.execution_financiere}
                />
              </div>
              <div className="rounded-[var(--radius-card)] border border-ash bg-canvas-white p-6 ">
                <ProgressBar
                  label="Exécution physique moyenne"
                  value={stats.execution_physique}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
