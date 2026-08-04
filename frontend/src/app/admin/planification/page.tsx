"use client";

import Link from "next/link";

import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TRIMESTRES = [
  { num: 1, label: "Trimestre 1", periode: "Janvier — Mars" },
  { num: 2, label: "Trimestre 2", periode: "Avril — Juin" },
  { num: 3, label: "Trimestre 3", periode: "Juillet — Septembre" },
  { num: 4, label: "Trimestre 4", periode: "Octobre — Décembre" },
];

export default function PlanificationHubPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-paper">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-graphite">Planification</h1>
          <p className="mt-2 text-slate">
            Planifiez les activités et tâches par trimestre — BSD MIPME 2025.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRIMESTRES.map(({ num, label, periode }) => (
              <Card key={num}>
                <CardHeader>
                  <CardTitle className="text-lg">{label}</CardTitle>
                  <p className="text-sm text-fog">{periode}</p>
                </CardHeader>
                <CardContent>
                  <Link href={`/admin/planification/${num}`}>
                    <Button variant="outline">Consulter T{num}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
