"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import Link from "next/link";
import { useState } from "react";

import { DirectionFilter } from "@/components/direction-filter";
import { ProgressBar } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
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
    <AdminShell>
        <div className="space-y-8">
        <div>
          <Link href="/admin/stats" className="text-sm text-electric-blue hover:underline">
            ← Statistiques
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-charcoal">
            Statistiques — Plan d&apos;Action
          </h1>
        </div>

        <DirectionFilter value={direction} onChange={setDirection} />

        {isLoading ? (
          <p className="text-sm text-fog">Chargement…</p>
        ) : stats ? (
          <>
            <StatGrid>
              <StatCard title="Total activités" value={stats.total} />
              <StatCard title="Non démarrées" value={stats.non_demare} />
              <StatCard title="En cours" value={stats.en_cours} />
              <StatCard title="Terminées" value={stats.termine} />
              <StatCard title="En retard" value={stats.en_retard} />
            </StatGrid>
            <div className="rounded-[var(--radius-card)] border border-ash bg-canvas-white p-6 ">
              <ProgressBar
                label="Progression globale"
                value={stats.progression}
              />
            </div>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
