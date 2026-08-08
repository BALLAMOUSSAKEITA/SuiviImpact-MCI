"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { FormDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { SegmentedControl } from "@/components/segmented-control";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadExport } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  ANNEE_OPTIONS,
  DEFAULT_ANNEE,
  maxDateInput,
  minDateInput,
} from "@/lib/years";
import { type ExportType, type PaoExportMode } from "@/types";

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

const PAO_MODE_OPTIONS: { value: PaoExportMode; label: string }[] = [
  { value: "annee", label: "Année entière" },
  { value: "plage", label: "Plage de dates" },
  { value: "mois", label: "Mois précis" },
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
      <PageHeader
        eyebrow="Données"
        title="Exports Excel"
        description="Téléchargez les jeux de données au format .xlsx."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORTS.map(({ type, label, desc, pao }) => (
          <Card key={type} className="p-4 sm:p-5">
            <CardHeader className="p-0 pb-2">
              <CardTitle>{label}</CardTitle>
              <p className="text-sm text-slate">{desc}</p>
            </CardHeader>
            <CardContent className="p-0 pt-2">
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
        <p className="mb-4 text-sm leading-[1.43] text-slate">
          Les activités sont retenues selon leur{" "}
          <span className="font-medium text-graphite">date de début</span> : par
          exemple, une activité démarrée en janvier et finissant en juin apparaît
          dans un export « janvier ».
        </p>

        <SegmentedControl
          value={paoMode}
          onChange={setPaoMode}
          options={PAO_MODE_OPTIONS}
          className="w-full"
        />

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
                  Du
                </label>
                <input
                  id="pao-du"
                  type="date"
                  value={du}
                  min={minDateInput()}
                  max={maxDateInput()}
                  onChange={(e) => setDu(e.target.value)}
                  className="input-grain mt-1 w-full"
                />
              </div>
              <div>
                <label className="label-grain" htmlFor="pao-au">
                  Au
                </label>
                <input
                  id="pao-au"
                  type="date"
                  value={au}
                  min={minDateInput()}
                  max={maxDateInput()}
                  onChange={(e) => setAu(e.target.value)}
                  className="input-grain mt-1 w-full"
                />
              </div>
            </div>
          )}

          {paoMode === "mois" && (
            <div className="space-y-3">
              <select
                value={moisAnnee}
                onChange={(e) => setMoisAnnee(Number(e.target.value))}
                className="input-grain w-full max-w-xs"
                aria-label="Année des mois"
              >
                {ANNEE_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {MOIS_LABELS.map((name, idx) => {
                  const month = idx + 1;
                  const checked = selectedMonths.includes(month);
                  return (
                    <label
                      key={name}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm",
                        checked
                          ? "bg-graphite text-white"
                          : "bg-veil text-slate hover:text-graphite",
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
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading === "pao"}
            onClick={() => setPaoOpen(false)}
          >
            Annuler
          </Button>
          <Button type="button" disabled={loading === "pao"} onClick={() => void runPaoExport()}>
            {loading === "pao" ? "Export…" : "Télécharger"}
          </Button>
        </div>
      </FormDialog>
    </>
  );
}
