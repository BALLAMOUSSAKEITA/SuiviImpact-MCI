"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  createActivite,
  deleteActivite,
  listActivites,
  listDirections,
  listObjectifs,
} from "@/lib/api";
import type { TrimestrePlan } from "@/types";

const YEARS = [2025, 2026, 2027];
const TRIMESTRES = [1, 2, 3, 4];

export default function ActivitesPage() {
  return <ActivitesContent />;
}

function ActivitesContent() {
  const params = useParams<{ objectifId: string }>();
  const objectifId = Number(params.objectifId);
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["activites", objectifId];

  const { data: objectifs = [] } = useQuery({
    queryKey: ["objectifs"],
    queryFn: () => listObjectifs(),
  });
  const objectif = objectifs.find((o) => o.id === objectifId);

  const { data: activites = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listActivites(objectifId),
    enabled: !Number.isNaN(objectifId),
  });

  const { data: directions = [] } = useQuery({
    queryKey: ["directions"],
    queryFn: listDirections,
  });

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("0");
  const [selectedDirections, setSelectedDirections] = useState<number[]>([]);
  const [selectedTrimestres, setSelectedTrimestres] = useState<TrimestrePlan[]>([]);

  const directionMap = useMemo(
    () => new Map(directions.map((d) => [d.id, d.code])),
    [directions],
  );

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createActivite>[1]) =>
      createActivite(objectifId, payload),
    onSuccess: () => {
      toast.success("Activité créée");
      queryClient.invalidateQueries({ queryKey });
      setCode("");
      setDescription("");
      setBudget("0");
      setSelectedDirections([]);
      setSelectedTrimestres([]);
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivite,
    onSuccess: () => {
      toast.success("Activité supprimée");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleDirection = (id: number) => {
    setSelectedDirections((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const toggleTrimestre = (annee: number, trimestre: number) => {
    const key = `${annee}-${trimestre}`;
    const exists = selectedTrimestres.some(
      (t) => `${t.annee}-${t.trimestre}` === key,
    );
    setSelectedTrimestres((prev) =>
      exists
        ? prev.filter((t) => `${t.annee}-${t.trimestre}` !== key)
        : [...prev, { annee, trimestre }],
    );
  };

  const isTrimestreSelected = (annee: number, trimestre: number) =>
    selectedTrimestres.some((t) => t.annee === annee && t.trimestre === trimestre);

  return (
    <>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin/objectifs" className="text-sm text-forest-ink hover:underline">
              ← Objectifs
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-graphite">
              Activités — {objectif?.code ?? `Objectif #${objectifId}`}
            </h1>
            <p className="mt-1 text-sm text-fog">{objectif?.description}</p>
          </div>
        </div>

        {canWrite && (
          <div className="rounded-card border border-cloud bg-paper p-4 shadow-sm">
            <button
              type="button"
              className="text-sm font-medium text-forest-ink"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "− Masquer" : "+ Nouvelle activité"}
            </button>
            {open && (
              <div className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    placeholder="Code activité"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="rounded-card border border-mist px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded-card border border-mist px-3 py-2 text-sm sm:col-span-2"
                  />
                  <input
                    type="number"
                    placeholder="Budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="rounded-card border border-mist px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate">Directions</p>
                  <div className="flex flex-wrap gap-2">
                    {directions.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDirection(d.id)}
                        className={
                          selectedDirections.includes(d.id)
                            ? "rounded-full bg-forest-ink px-3 py-1 text-xs text-white"
                            : "rounded-full bg-veil px-3 py-1 text-xs text-slate"
                        }
                      >
                        {d.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate">Trimestres</p>
                  <div className="space-y-2">
                    {YEARS.map((year) => (
                      <div key={year} className="flex flex-wrap items-center gap-2">
                        <span className="w-12 text-xs font-semibold text-fog">{year}</span>
                        {TRIMESTRES.map((t) => (
                          <button
                            key={`${year}-${t}`}
                            type="button"
                            onClick={() => toggleTrimestre(year, t)}
                            className={
                              isTrimestreSelected(year, t)
                                ? "rounded bg-forest-ink px-2 py-1 text-xs text-white"
                                : "rounded bg-veil px-2 py-1 text-xs text-slate"
                            }
                          >
                            T{t}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() =>
                    createMutation.mutate({
                      code,
                      description,
                      budget: Number(budget),
                      direction_ids: selectedDirections,
                      trimestres: selectedTrimestres,
                    })
                  }
                  disabled={createMutation.isPending}
                >
                  Enregistrer l&apos;activité
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="table-shell">
          <table className="min-w-full text-sm">
            <thead className="bg-paper">
              <tr>
                <th className="px-3 py-3 text-left">Code</th>
                <th className="px-3 py-3 text-left">Activité</th>
                <th className="px-3 py-3 text-left">Directions</th>
                <th className="px-3 py-3 text-left">Budget</th>
                {YEARS.map((year) =>
                  TRIMESTRES.map((t) => (
                    <th key={`${year}-T${t}`} className="px-2 py-3 text-center text-xs">
                      {year} T{t}
                    </th>
                  )),
                )}
                <th className="px-3 py-3 text-left">Exécution</th>
                {canWrite && <th className="px-3 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud/60">
              {isLoading && (
                <tr>
                  <td colSpan={20} className="px-4 py-8 text-center text-ash">
                    Chargement…
                  </td>
                </tr>
              )}
              {activites.map((activite) => (
                <tr key={activite.id} className="hover:bg-veil/80">
                  <td className="px-3 py-3 font-medium">{activite.code}</td>
                  <td className="px-3 py-3">{activite.description}</td>
                  <td className="px-3 py-3 text-xs">
                    {activite.direction_ids
                      .map((id) => directionMap.get(id) ?? id)
                      .join(", ")}
                  </td>
                  <td className="px-3 py-3">
                    {Number(activite.budget).toLocaleString("fr-FN")}
                  </td>
                  {YEARS.map((year) =>
                    TRIMESTRES.map((t) => {
                      const planned = activite.trimestres.some(
                        (tr) => tr.annee === year && tr.trimestre === t,
                      );
                      return (
                        <td key={`${activite.id}-${year}-T${t}`} className="px-2 py-3 text-center">
                          {planned ? "X" : ""}
                        </td>
                      );
                    }),
                  )}
                  <td className="px-3 py-3">{activite.execution}%</td>
                  {canWrite && (
                    <td className="px-3 py-3 text-right">
                      <Link href={`/admin/activites/${activite.id}/modifier`}>
                        <Button variant="outline" className="mr-2 h-8 px-3 text-xs">
                          Modifier
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-xs text-red-600"
                        onClick={() => {
                          if (window.confirm("Supprimer cette activité ?")) {
                            deleteMutation.mutate(activite.id);
                          }
                        }}
                      >
                        Supprimer
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </>
  );
}
