"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { DirectionFilter } from "@/components/direction-filter";
import { ExecutionBadge } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { TrimestreTabs } from "@/components/trimestre-tabs";
import { Button } from "@/components/ui/button";
import { getPlanification } from "@/lib/api";
import { DEFAULT_ANNEE } from "@/types";

export default function PlanificationTrimestrePage() {
  return (
    <ProtectedRoute>
      <PlanificationContent />
    </ProtectedRoute>
  );
}

function PlanificationContent() {
  const params = useParams();
  const trimestre = Number(params.trimestre);
  const [direction, setDirection] = useState<string | null>(null);

  const { data: activites = [], isLoading } = useQuery({
    queryKey: ["planification", DEFAULT_ANNEE, trimestre, direction],
    queryFn: () => getPlanification(DEFAULT_ANNEE, trimestre, direction ?? undefined),
    enabled: trimestre >= 1 && trimestre <= 4,
  });

  return (
    <AdminShell>
        <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">
            Planification — T{trimestre} {DEFAULT_ANNEE}
          </h1>
          <p className="mt-1 text-sm text-fog">
            Activités planifiées pour le trimestre
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <TrimestreTabs
            basePath="/admin/planification"
            currentTrimestre={trimestre}
          />
          <DirectionFilter value={direction} onChange={setDirection} />
        </div>

        <div className="overflow-hidden rounded-[var(--radius-card)] border border-ash bg-canvas-white">
          <table className="min-w-full divide-y divide-cloud text-sm">
            <thead className="bg-paper-mist">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-steel">Code</th>
                <th className="px-4 py-3 text-left font-medium text-steel">Description</th>
                <th className="px-4 py-3 text-left font-medium text-steel">Exécution</th>
                <th className="px-4 py-3 text-left font-medium text-steel">Budget</th>
                <th className="px-4 py-3 text-left font-medium text-steel">Tâches</th>
                <th className="px-4 py-3 text-right font-medium text-steel">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ash/60">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-fog">
                    Chargement…
                  </td>
                </tr>
              )}
              {!isLoading && activites.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-fog">
                    Aucune activité planifiée pour ce trimestre.
                  </td>
                </tr>
              )}
              {activites.map((a) => (
                <tr key={a.id} className="hover:bg-paper-mist">
                  <td className="px-4 py-3 font-medium">{a.code}</td>
                  <td className="max-w-xs truncate px-4 py-3">{a.description}</td>
                  <td className="px-4 py-3">
                    <ExecutionBadge value={a.execution} />
                  </td>
                  <td className="px-4 py-3">{a.budget}</td>
                  <td className="px-4 py-3">{a.nb_taches}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/planification/taches/${a.id}/${trimestre}`}
                    >
                      <Button variant="outline" className="h-8 px-3 text-xs">
                        Tâches
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
