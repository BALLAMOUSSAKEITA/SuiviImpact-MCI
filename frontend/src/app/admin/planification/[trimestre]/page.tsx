"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { DirectionFilter } from "@/components/direction-filter";
import { ExecutionBadge } from "@/components/execution-badge";
import { PageHeader } from "@/components/page-header";
import { TrimestreTabs } from "@/components/trimestre-tabs";
import { Button } from "@/components/ui/button";
import { getPlanification } from "@/lib/api";
import { DEFAULT_ANNEE } from "@/types";

export default function PlanificationTrimestrePage() {
  return <PlanificationContent />;
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
    <>
      <PageHeader
        title={`Planification — T${trimestre} ${DEFAULT_ANNEE}`}
        description="Activités planifiées pour le trimestre"
      />

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <TrimestreTabs
            basePath="/admin/planification"
            currentTrimestre={trimestre}
          />
          <DirectionFilter value={direction} onChange={setDirection} />
        </div>

        <div className="table-shell">
          <table className="table-grain min-w-[720px]">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate">Code</th>
                <th className="px-4 py-3 text-left font-medium text-slate">Description</th>
                <th className="px-4 py-3 text-left font-medium text-slate">Exécution</th>
                <th className="px-4 py-3 text-left font-medium text-slate">Budget</th>
                <th className="px-4 py-3 text-left font-medium text-slate">Tâches</th>
                <th className="px-4 py-3 text-right font-medium text-slate">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud/60">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ash">
                    Chargement…
                  </td>
                </tr>
              )}
              {!isLoading && activites.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ash">
                    Aucune activité planifiée pour ce trimestre.
                  </td>
                </tr>
              )}
              {activites.map((a) => (
                <tr key={a.id} className="hover:bg-veil">
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
    </>
  );
}
