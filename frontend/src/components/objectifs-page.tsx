"use client";

import { useQuery } from "@tanstack/react-query";

import { ObjectifForm } from "@/components/objectif-form";
import { ObjectifTable } from "@/components/objectif-table";
import { ObjectifTabs } from "@/components/objectif-tabs";
import { PageHeader } from "@/components/page-header";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { listObjectifs } from "@/lib/api";
import { OBJECTIF_LABELS, type ObjectifType } from "@/types";

export function ObjectifsPage({ type }: { type: ObjectifType }) {
  const queryKey = ["objectifs", type];
  const { label, year } = OBJECTIF_LABELS[type];

  const { data: objectifs = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listObjectifs(type),
  });

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-paper">
        <Sidebar />
        <main className="flex-1 space-y-8 p-8">
          <PageHeader
            eyebrow="Plan d'action"
            title={`Objectifs ${label} — ${year}`}
            description="Objectifs clés de transformation et activités associées"
          />

          <ObjectifTabs />
          <ObjectifForm type={type} queryKey={queryKey} />

          {isLoading ? (
            <p className="text-sm text-ash">Chargement…</p>
          ) : (
            <ObjectifTable objectifs={objectifs} queryKey={queryKey} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
