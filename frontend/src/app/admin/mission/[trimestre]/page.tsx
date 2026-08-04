"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ExecutionBadge } from "@/components/execution-badge";
import { TrimestreTabs } from "@/components/trimestre-tabs";
import { Button } from "@/components/ui/button";
import {
  createMission,
  deleteMission,
  finaliserMission,
  listMissions,
  updateMission,
} from "@/lib/api";
import {
  DEFAULT_ANNEE,
  type ExecutionStatutFilter,
  type Mission,
} from "@/types";

const STATUT_TABS: { key: ExecutionStatutFilter; label: string }[] = [
  { key: null, label: "Toutes" },
  { key: "non_demare", label: "Non démarrées" },
  { key: "en_cours", label: "En cours" },
  { key: "termine", label: "Terminées" },
];

export default function MissionPage() {
  return <MissionContent />;
}

function MissionContent() {
  const params = useParams();
  const trimestre = Number(params.trimestre);
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [statut, setStatut] = useState<ExecutionStatutFilter>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Mission | null>(null);
  const [form, setForm] = useState({
    date_mission: new Date().toISOString().slice(0, 10),
    description: "",
    responsable: "",
    execution: "0",
    observations: "",
  });

  const queryKey = ["missions", trimestre, DEFAULT_ANNEE, statut];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      listMissions({
        trimestre,
        annee: DEFAULT_ANNEE,
        statut: statut ?? undefined,
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["missions"] });

  const createMutation = useMutation({
    mutationFn: () =>
      createMission({
        trimestre,
        annee: DEFAULT_ANNEE,
        date_mission: form.date_mission,
        description: form.description,
        responsable: form.responsable,
        execution: parseFloat(form.execution),
        observations: form.observations || null,
      }),
    onSuccess: () => {
      toast.success("Mission créée");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateMission(editing!.id, {
        date_mission: form.date_mission,
        description: form.description,
        responsable: form.responsable,
        execution: parseFloat(form.execution),
        observations: form.observations || null,
      }),
    onSuccess: () => {
      toast.success("Mission mise à jour");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMission,
    onSuccess: () => {
      toast.success("Mission supprimée");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const finaliserMutation = useMutation({
    mutationFn: finaliserMission,
    onSuccess: () => {
      toast.success("Mission finalisée");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      date_mission: new Date().toISOString().slice(0, 10),
      description: "",
      responsable: "",
      execution: "0",
      observations: "",
    });
  };

  const startEdit = (item: Mission) => {
    setEditing(item);
    setShowForm(true);
    setForm({
      date_mission: item.date_mission,
      description: item.description,
      responsable: item.responsable,
      execution: item.execution,
      observations: item.observations ?? "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  };

  return (
    <>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-graphite sm:text-2xl">
              Missions — T{trimestre} {DEFAULT_ANNEE}
            </h1>
            {data?.avg_execution != null && (
              <p className="mt-1 text-sm text-fog">
                Exécution moyenne :{" "}
                <ExecutionBadge value={data.avg_execution} />
              </p>
            )}
          </div>
          {canWrite && !showForm && (
            <Button onClick={() => setShowForm(true)}>Nouvelle mission</Button>
          )}
        </div>

        <TrimestreTabs basePath="/admin/mission" currentTrimestre={trimestre} />

        <div className="flex flex-wrap gap-2">
          {STATUT_TABS.map(({ key, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setStatut(key)}
              className={`rounded-card px-3 py-1.5 text-sm font-medium transition-colors ${
                statut === key
                  ? "bg-forest-ink text-white"
                  : "bg-paper text-slate ring-1 ring-cloud hover:bg-veil"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {showForm && canWrite && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-card border border-cloud bg-paper p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">
              {editing ? "Modifier" : "Nouvelle mission"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate">Date</label>
                <input
                  type="date"
                  required
                  value={form.date_mission}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date_mission: e.target.value }))
                  }
                  className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate">
                  Responsable
                </label>
                <input
                  required
                  value={form.responsable}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, responsable: e.target.value }))
                  }
                  className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate">
                  Description
                </label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate">
                  Exécution (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.execution}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, execution: e.target.value }))
                  }
                  className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate">
                  Observations
                </label>
                <input
                  value={form.observations}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, observations: e.target.value }))
                  }
                  className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editing ? "Enregistrer" : "Créer"}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        )}

        <div className="table-shell">
          <table className="table-grain min-w-[640px]">
            <thead className="bg-paper">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate">Description</th>
                <th className="px-4 py-3 text-left font-medium text-slate">Responsable</th>
                <th className="px-4 py-3 text-left font-medium text-slate">Exécution</th>
                <th className="px-4 py-3 text-right font-medium text-slate">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud/60">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ash">
                    Chargement…
                  </td>
                </tr>
              )}
              {data?.items.map((item) => (
                <tr key={item.id} className="hover:bg-paper">
                  <td className="px-4 py-3">{item.date_mission}</td>
                  <td className="max-w-xs truncate px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3">{item.responsable}</td>
                  <td className="px-4 py-3">
                    <ExecutionBadge value={item.execution} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canWrite && (
                      <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => startEdit(item)}
                        >
                          Modifier
                        </Button>
                        {parseFloat(item.execution) < 100 && (
                          <Button
                            variant="outline"
                            className="h-8 px-3 text-xs"
                            onClick={() => finaliserMutation.mutate(item.id)}
                          >
                            Finaliser
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="h-8 px-3 text-xs text-red-600"
                          onClick={() => {
                            if (window.confirm("Supprimer ?")) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </>
  );
}
