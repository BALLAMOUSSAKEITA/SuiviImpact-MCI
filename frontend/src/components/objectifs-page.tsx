"use client";

import { useQuery } from "@tanstack/react-query";

import { AdminShell } from "@/components/admin-shell";
import { ObjectifForm } from "@/components/objectif-form";
import { ObjectifTable } from "@/components/objectif-table";
import { ObjectifTabs } from "@/components/objectif-tabs";
import { PageHeader } from "@/components/page-header";
import { ProtectedRoute } from "@/components/protected-route";
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
      <AdminShell>
        <div className="space-y-8">
          <PageHeader
            eyebrow="Plan d'action"
            title={`Objectifs ${label} — ${year}`}
            description="Objectifs clés de transformation et activités associées"
          />

          <ObjectifTabs />
          <ObjectifForm type={type} queryKey={queryKey} />

          {isLoading ? (
            <p className="text-sm text-fog">Chargement…</p>
          ) : (
            <ObjectifTable objectifs={objectifs} queryKey={queryKey} />
          )}
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
