"use client";

import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/brand";

const TRIMESTRES = [
  { num: 1, label: "Trimestre 1", periode: "Janvier — Mars" },
  { num: 2, label: "Trimestre 2", periode: "Avril — Juin" },
  { num: 3, label: "Trimestre 3", periode: "Juillet — Septembre" },
  { num: 4, label: "Trimestre 4", periode: "Octobre — Décembre" },
];

export default function PlanActionTachesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Plan d'action"
        title="Tâches"
        description={`Planifier et ajouter des tâches par trimestre, rattachées aux activités — ${BRAND.bureauShort}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TRIMESTRES.map(({ num, label, periode }) => (
          <Card key={num}>
            <CardHeader>
              <CardTitle className="text-lg">{label}</CardTitle>
              <p className="text-sm text-fog">{periode}</p>
            </CardHeader>
            <CardContent>
              <Link href={`/admin/planification/${num}`}>
                <Button variant="outline">Gérer les tâches — T{num}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
