"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { FormDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadExport } from "@/lib/api";
import { DEFAULT_ANNEE, type ExportType, type PaoExportMode } from "@/types";
import { cn } from "@/lib/utils";

const ANNEE_OPTIONS = [2025, 2026, 2027] as const;

const MOIS_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

const EXPORTS: { type: ExportType; label: string; desc: string; pao?: boolean }[] = [
  {
    type: "pao",
    label: "PAO",
    desc: "Plan d'action opérationnel — activités et tâches selon la date de début",
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
  const [paoOpen, setPaoOpen] = useState(false);

  const [paoMode, setPaoMode] = useState<PaoExportMode>("annee");
  const [annee, setAnnee] = useState(DEFAULT_ANNEE);
  const [du, setDu] = useState(`${DEFAULT_ANNEE}-01-01`);
  const [au, setAu] = useState(`${DEFAULT_ANNEE}-12-31`);
  const [moisAnnee, setMoisAnnee] = useState(DEFAULT_ANNEE);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([1]);

  const moisParam = useMemo(() => {
    return selectedMonths
      .sort((a, b) => a - b)
      .map((m) => `${moisAnnee}-${String(m).padStart(2, "0")}`)
      .join(",");
  }, [moisAnnee, selectedMonths]);

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

  const runPaoExport = async () => {
    if (paoMode === "plage" && du > au) {
      toast.error("La date de début doit être avant la date de fin");
      return;
    }
    if (paoMode === "mois" && selectedMonths.length === 0) {
      toast.error("Sélectionnez au moins un mois");
      return;
    }

    setLoading("pao");
    try {
      await downloadExport("pao", {
        pao: {
          mode: paoMode,
          annee,
          du: paoMode === "plage" ? du : undefined,
          au: paoMode === "plage" ? au : undefined,
          mois: paoMode === "mois" ? moisParam : undefined,
        },
      });
      toast.success("Export PAO téléchargé");
      setPaoOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur export");
    } finally {
      setLoading(null);
    }
  };

  const toggleMonth = (month: number) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month].sort((a, b) => a - b),
    );
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
              <CardContent>
                <Button
                  variant="outline"
                  disabled={loading !== null}
                  onClick={() => (pao ? setPaoOpen(true) : handleExport(type))}
                >
                  {loading === type ? "Téléchargement…" : "Télécharger"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

      <FormDialog
        open={paoOpen}
        title="Exporter le PAO"
        onClose={() => !loading && setPaoOpen(false)}
        className="max-w-lg"
      >
        <p className="mb-4 text-sm leading-relaxed text-slate">
          Les activités sont retenues selon leur{" "}
          <span className="font-medium text-graphite">date de début</span> : par
          exemple, une activité démarrée en janvier et finissant en juin apparaît
          dans un export « janvier ».
        </p>

        <div className="space-y-2">
          {(
            [
              ["annee", "Année entière"],
              ["plage", "Plage de dates"],
              ["mois", "Mois précis"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3 transition-colors",
                paoMode === value
                  ? "border-forest-ink/40 bg-forest-ink/5"
                  : "border-cloud hover:bg-veil/50",
              )}
            >
              <input
                type="radio"
                name="pao-mode"
                checked={paoMode === value}
                onChange={() => setPaoMode(value)}
                className="accent-forest-ink"
              />
              <span className="text-sm font-medium text-graphite">{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {paoMode === "annee" && (
            <div>
              <label className="label-grain" htmlFor="pao-annee-full">
                Année calendaire
              </label>
              <select
                id="pao-annee-full"
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
                className="input-grain mt-1 w-full"
              >
                {ANNEE_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y} — toutes les activités dont la date de début est en {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {paoMode === "plage" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label-grain" htmlFor="pao-du">
                  Du (date de début activité)
                </label>
                <input
                  id="pao-du"
                  type="date"
                  value={du}
                  onChange={(e) => setDu(e.target.value)}
                  className="input-grain mt-1 w-full"
                />
              </div>
              <div>
                <label className="label-grain" htmlFor="pao-au">
                  Au (date de début activité)
                </label>
                <input
                  id="pao-au"
                  type="date"
                  value={au}
                  onChange={(e) => setAu(e.target.value)}
                  className="input-grain mt-1 w-full"
                />
              </div>
            </div>
          )}

          {paoMode === "mois" && (
            <>
              <div>
                <label className="label-grain" htmlFor="pao-mois-annee">
                  Année
                </label>
                <select
                  id="pao-mois-annee"
                  value={moisAnnee}
                  onChange={(e) => setMoisAnnee(Number(e.target.value))}
                  className="input-grain mt-1 w-full"
                >
                  {ANNEE_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="label-grain">Mois (date de début dans le mois)</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {MOIS_LABELS.map((name, idx) => {
                    const month = idx + 1;
                    const checked = selectedMonths.includes(month);
                    return (
                      <label
                        key={name}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border px-2 py-1.5 text-xs",
                          checked
                            ? "border-forest-ink/35 bg-forest-ink/8 text-forest-ink"
                            : "border-cloud text-slate hover:bg-veil",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMonth(month)}
                          className="accent-forest-ink"
                        />
                        {name}
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-cloud/60 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={loading === "pao"}
            onClick={() => setPaoOpen(false)}
          >
            Annuler
          </Button>
          <Button type="button" disabled={loading === "pao"} onClick={() => void runPaoExport()}>
            {loading === "pao" ? "Export en cours…" : "Télécharger l'Excel"}
          </Button>
        </div>
      </FormDialog>
    </>
  );
}
