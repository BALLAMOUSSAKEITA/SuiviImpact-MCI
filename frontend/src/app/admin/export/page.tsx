"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadExport } from "@/lib/api";
import { DEFAULT_ANNEE, type ExportType } from "@/types";

const ANNEE_OPTIONS = [2025, 2026, 2027] as const;

const EXPORTS: { type: ExportType; label: string; desc: string; pao?: boolean }[] = [
  {
    type: "pao",
    label: "PAO",
    desc: "Plan d'action opérationnel — feuilles Activités et Tâches (suivi inclus)",
    pao: true,
  },
  { type: "recommandations", label: "Recommandations RCC", desc: "Liste des RCC" },
  { type: "missions", label: "Missions", desc: "Liste des missions" },
  { type: "ppm", label: "Marchés PPM", desc: "Plan de passation des marchés" },
  { type: "projets", label: "Projets", desc: "Liste des projets" },
];

export default function ExportPage() {
  return <ExportContent />;
}

function ExportContent() {
  const [loading, setLoading] = useState<ExportType | null>(null);
  const [anneePao, setAnneePao] = useState(DEFAULT_ANNEE);

  const handleExport = async (type: ExportType) => {
    setLoading(type);
    try {
      await downloadExport(type, type === "pao" ? { annee: anneePao } : undefined);
      toast.success("Export téléchargé");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur export");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
        <h1 className="text-2xl font-bold text-graphite">Exports Excel</h1>
        <p className="mt-2 text-slate">
          Téléchargez les données au format .xlsx
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPORTS.map(({ type, label, desc, pao }) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-lg">{label}</CardTitle>
                <p className="text-sm text-fog">{desc}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {pao && (
                  <div>
                    <label className="label-grain" htmlFor="export-pao-annee">
                      Année
                    </label>
                    <select
                      id="export-pao-annee"
                      value={anneePao}
                      onChange={(e) => setAnneePao(Number(e.target.value))}
                      className="input-grain mt-1 w-full"
                    >
                      {ANNEE_OPTIONS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
    </>
  );
}
