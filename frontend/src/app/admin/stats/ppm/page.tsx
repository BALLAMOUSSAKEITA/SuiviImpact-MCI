"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { ProgressBar } from "@/components/execution-badge";
import { StatCard, StatGrid } from "@/components/stat-card";
import { getStatsPpm } from "@/lib/api";
import { PPM_STATUT_LABELS } from "@/types";

export default function StatsPpmPage() {
  return <StatsPpmContent />;
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
    <>
      <div>
        <Link href="/admin/stats" className="text-sm text-forest-ink hover:underline">
          ← Statistiques
        </Link>
        <h1 className="mt-2 text-xl font-bold text-graphite sm:text-2xl">
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
          <div className="rounded-card border border-cloud bg-paper p-4 shadow-sm sm:p-6">
            <ProgressBar
              label="Contrats signés / total"
              value={progression}
            />
          </div>
        </>
      ) : null}
    </>
  );
}
