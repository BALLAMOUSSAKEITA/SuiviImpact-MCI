"use client";

import { useQuery } from "@tanstack/react-query";

import { ObjectifForm } from "@/components/objectif-form";
import { ObjectifTable } from "@/components/objectif-table";
import { PageHeader } from "@/components/page-header";
import { listObjectifs } from "@/lib/api";

export function ObjectifsPage() {
  const queryKey = ["objectifs"];

  const { data: objectifs = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listObjectifs(),
  });

  return (
    <>
      <PageHeader
        eyebrow="Paramétrage"
        title="Objectifs"
        description="Définir les objectifs du plan d'action (sans navigation vers les activités depuis ce tableau)."
      />

      <ObjectifForm queryKey={queryKey} />

      {isLoading ? (
        <p className="text-sm text-ash">Chargement…</p>
      ) : (
        <ObjectifTable objectifs={objectifs} queryKey={queryKey} />
      )}
    </>
  );
}
