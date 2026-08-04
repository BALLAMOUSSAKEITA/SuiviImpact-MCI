"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadExport } from "@/lib/api";
import type { ExportType } from "@/types";

const EXPORTS: { type: ExportType; label: string; desc: string }[] = [
  { type: "activites", label: "Activités", desc: "Activités par trimestre" },
  { type: "taches", label: "Tâches", desc: "Tâches par trimestre" },
  { type: "recommandations", label: "Recommandations RCC", desc: "Liste des RCC" },
  { type: "missions", label: "Missions", desc: "Liste des missions" },
  { type: "ppm", label: "Marchés PPM", desc: "Plan de passation des marchés" },
  { type: "projets", label: "Projets", desc: "Liste des projets" },
];

export default function ExportPage() {
  return (
    <ProtectedRoute>
      <ExportContent />
    </ProtectedRoute>
  );
}

function ExportContent() {
  const [loading, setLoading] = useState<ExportType | null>(null);

  const handleExport = async (type: ExportType) => {
    setLoading(type);
    try {
      await downloadExport(type);
      toast.success("Export téléchargé");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur export");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-graphite">Exports Excel</h1>
        <p className="mt-2 text-slate">
          Téléchargez les données au format .xlsx
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPORTS.map(({ type, label, desc }) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-lg">{label}</CardTitle>
                <p className="text-sm text-fog">{desc}</p>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  disabled={loading !== null}
                  onClick={() => handleExport(type)}
                >
                  {loading === type ? "Téléchargement…" : "Télécharger"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
