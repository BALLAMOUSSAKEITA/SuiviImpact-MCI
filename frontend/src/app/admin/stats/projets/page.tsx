"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { ProgressBar } from "@/components/execution-badge";
import { StatCard, StatGrid } from "@/components/stat-card";
import { getStatsProjets } from "@/lib/api";

export default function StatsProjetsPage() {
  return <StatsProjetsContent />;
}

function StatsProjetsContent() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats-projets"],
    queryFn: () => getStatsProjets(),
  });

  return (
    <>
      <div>
        <Link href="/admin/stats" className="text-sm text-forest-ink hover:underline">
          ← Statistiques
        </Link>
        <h1 className="mt-2 text-xl font-bold text-graphite sm:text-2xl">
          Statistiques — Projets
        </h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-ash">Chargement…</p>
      ) : stats ? (
        <>
          <StatGrid>
            <StatCard title="Total projets" value={stats.total} />
          </StatGrid>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-card border border-cloud bg-paper p-4 shadow-sm sm:p-6">
              <ProgressBar
                label="Exécution financière moyenne"
                value={stats.execution_financiere}
              />
            </div>
            <div className="rounded-card border border-cloud bg-paper p-4 shadow-sm sm:p-6">
              <ProgressBar
                label="Exécution physique moyenne"
                value={stats.execution_physique}
              />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
