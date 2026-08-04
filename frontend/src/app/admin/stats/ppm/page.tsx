"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { ProgressBar } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { StatCard, StatGrid } from "@/components/stat-card";
import { getStatsPpm } from "@/lib/api";
import { PPM_STATUT_LABELS } from "@/types";

export default function StatsPpmPage() {
  return (
    <ProtectedRoute>
      <StatsPpmContent />
    </ProtectedRoute>
  );
}

function StatsPpmContent() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-ppm"],
    queryFn: () => getStatsPpm(),
  });

  const progression =
    stats && stats.total > 0
      ? ((stats.contrat_signe / stats.total) * 100).toFixed(0)
      : "0";

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 space-y-6 p-8">
        <div>
          <Link href="/admin/stats" className="text-sm text-forest-ink hover:underline">
            ← Statistiques
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-graphite">
            Statistiques — PPM
          </h1>
        </div>

        {isLoading ? (
          <p className="text-sm text-ash">Chargement…</p>
        ) : stats ? (
          <>
            <StatGrid>
              <StatCard title="Total marchés" value={stats.total} />
              <StatCard
                title={PPM_STATUT_LABELS.dao_elabore}
                value={stats.dao_elabore}
              />
              <StatCard
                title={PPM_STATUT_LABELS.dao_publie}
                value={stats.dao_publie}
              />
              <StatCard
                title={PPM_STATUT_LABELS.marche_attribue}
                value={stats.marche_attribue}
              />
              <StatCard
                title={PPM_STATUT_LABELS.contrat_signe}
                value={stats.contrat_signe}
              />
            </StatGrid>
            <div className="rounded-card border border-cloud bg-paper p-6 shadow-sm">
              <ProgressBar
                label="Contrats signés / total"
                value={progression}
              />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
