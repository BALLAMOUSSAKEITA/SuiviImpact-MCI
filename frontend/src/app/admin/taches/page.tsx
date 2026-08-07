"use client";

import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/page-header";
import { TachePlanForm } from "@/components/tache-plan-form";
import { TachePlanTable } from "@/components/tache-plan-table";
import { listTachesPlan } from "@/lib/api";

export default function PlanActionTachesPage() {
  const queryKey = ["taches-plan"];

  const { data: taches = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listTachesPlan(),
  });

  return (
    <>
      <PageHeader
        eyebrow="Paramétrage"
        title="Tâches"
        description="Référentiel des tâches du plan d'action (code et description)"
      />

      <TachePlanForm queryKey={queryKey} />

      {isLoading ? (
        <p className="text-sm text-ash">Chargement…</p>
      ) : (
        <TachePlanTable taches={taches} queryKey={queryKey} />
      )}
    </>
  );
}
