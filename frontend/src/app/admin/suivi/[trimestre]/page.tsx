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
import { getSuivi } from "@/lib/api";
import { DEFAULT_ANNEE } from "@/types";

export default function SuiviTrimestrePage() {
  return <SuiviContent />;
}

function SuiviContent() {
  const params = useParams();
  const trimestre = Number(params.trimestre);
  const [direction, setDirection] = useState<string | null>(null);

  const { data: activites = [], isLoading } = useQuery({
    queryKey: ["suivi", DEFAULT_ANNEE, trimestre, direction],
    queryFn: () => getSuivi(DEFAULT_ANNEE, trimestre, direction ?? undefined),
    enabled: trimestre >= 1 && trimestre <= 4,
  });

  return (
    <>
      <PageHeader
        title={`Suivi — T${trimestre} ${DEFAULT_ANNEE}`}
        description="Tableau de suivi des activités et taux d'exécution"
      />

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <TrimestreTabs basePath="/admin/suivi" currentTrimestre={trimestre} />
          <DirectionFilter value={direction} onChange={setDirection} />
        </div>

        <div className="table-shell">
          <table className="table-grain min-w-[720px]">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate">Code</th>
                <th className="px-4 py-3 text-left font-medium text-slate">Description</th>
                <th className="px-4 py-3 text-left font-medium text-slate">Exécution</th>
                <th className="px-4 py-3 text-left font-medium text-slate">Tâches</th>
                <th className="px-4 py-3 text-left font-medium text-slate">Terminées</th>
                <th className="px-4 py-3 text-left font-medium text-slate">En retard</th>
                <th className="px-4 py-3 text-right font-medium text-slate">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud/60">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ash">
                    Chargement…
                  </td>
                </tr>
              )}
              {!isLoading && activites.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ash">
                    Aucune activité pour ce trimestre.
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
                  <td className="px-4 py-3">{a.nb_taches}</td>
                  <td className="px-4 py-3 text-forest-ink">{a.nb_terminees}</td>
                  <td className="px-4 py-3 text-red-600">{a.nb_en_retard}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/suivi/${trimestre}/taches/${a.id}`}>
                      <Button variant="outline" className="h-8 px-3 text-xs">
                        Détail
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
