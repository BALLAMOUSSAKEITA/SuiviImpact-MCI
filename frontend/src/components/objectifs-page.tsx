"use client";

import { useQuery } from "@tanstack/react-query";

import { ObjectifForm } from "@/components/objectif-form";
import { ObjectifTable } from "@/components/objectif-table";
import { ObjectifTabs } from "@/components/objectif-tabs";
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
      <div className="flex min-h-screen bg-zinc-50">
        <Sidebar />
        <main className="flex-1 space-y-6 p-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Objectifs {label} — {year}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Plan d&apos;action — objectifs clés de transformation
            </p>
          </div>

          <ObjectifTabs />
          <ObjectifForm type={type} queryKey={queryKey} />

          {isLoading ? (
            <p className="text-sm text-zinc-400">Chargement…</p>
          ) : (
            <ObjectifTable objectifs={objectifs} queryKey={queryKey} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
