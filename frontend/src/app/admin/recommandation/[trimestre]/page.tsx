"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ExecutionBadge } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { TrimestreTabs } from "@/components/trimestre-tabs";
import { Button } from "@/components/ui/button";
import {
  createRecommandation,
  deleteRecommandation,
  finaliserRecommandation,
  listRecommandations,
  updateRecommandation,
} from "@/lib/api";
import {
  DEFAULT_ANNEE,
  type ExecutionStatutFilter,
  type Recommandation,
} from "@/types";

const STATUT_TABS: { key: ExecutionStatutFilter; label: string }[] = [
  { key: null, label: "Toutes" },
  { key: "non_demare", label: "Non démarrées" },
  { key: "en_cours", label: "En cours" },
  { key: "termine", label: "Terminées" },
];

export default function RecommandationPage() {
  return (
    <ProtectedRoute>
      <RecommandationContent />
    </ProtectedRoute>
  );
}

function RecommandationContent() {
  const params = useParams();
  const trimestre = Number(params.trimestre);
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [statut, setStatut] = useState<ExecutionStatutFilter>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Recommandation | null>(null);
  const [form, setForm] = useState({
    date_recommandation: new Date().toISOString().slice(0, 10),
    description: "",
    responsable: "",
    execution: "0",
    observations: "",
  });

  const queryKey = ["recommandations", trimestre, DEFAULT_ANNEE, statut];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      listRecommandations({
        trimestre,
        annee: DEFAULT_ANNEE,
        statut: statut ?? undefined,
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["recommandations"] });

  const createMutation = useMutation({
    mutationFn: () =>
      createRecommandation({
        trimestre,
        annee: DEFAULT_ANNEE,
        date_recommandation: form.date_recommandation,
        description: form.description,
        responsable: form.responsable,
        execution: parseFloat(form.execution),
        observations: form.observations || null,
      }),
    onSuccess: () => {
      toast.success("Recommandation créée");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateRecommandation(editing!.id, {
        date_recommandation: form.date_recommandation,
        description: form.description,
        responsable: form.responsable,
        execution: parseFloat(form.execution),
        observations: form.observations || null,
      }),
    onSuccess: () => {
      toast.success("Recommandation mise à jour");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecommandation,
    onSuccess: () => {
      toast.success("Recommandation supprimée");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const finaliserMutation = useMutation({
    mutationFn: finaliserRecommandation,
    onSuccess: () => {
      toast.success("Recommandation finalisée");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      date_recommandation: new Date().toISOString().slice(0, 10),
      description: "",
      responsable: "",
      execution: "0",
      observations: "",
    });
  };

  const startEdit = (item: Recommandation) => {
    setEditing(item);
    setShowForm(true);
    setForm({
      date_recommandation: item.date_recommandation,
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
    <AdminShell>
        <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">
              Recommandations RCC — T{trimestre} {DEFAULT_ANNEE}
            </h1>
            {data?.avg_execution != null && (
              <p className="mt-1 text-sm text-fog">
                Exécution moyenne :{" "}
                <ExecutionBadge value={data.avg_execution} />
              </p>
            )}
          </div>
          {canWrite && !showForm && (
            <Button onClick={() => setShowForm(true)}>Nouvelle RCC</Button>
          )}
        </div>

        <TrimestreTabs
          basePath="/admin/recommandation"
          currentTrimestre={trimestre}
        />

        <div className="flex gap-2">
          {STATUT_TABS.map(({ key, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setStatut(key)}
              className={`rounded-[var(--radius-card)] px-3 py-1.5 text-sm font-medium transition-colors ${
                statut === key
                  ? "bg-midnight-ink text-white"
                  : "bg-canvas-white text-steel ring-1 ring-ash hover:bg-paper-mist"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {showForm && canWrite && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[var(--radius-card)] border border-ash bg-canvas-white p-6"
          >
            <h2 className="text-lg font-semibold">
              {editing ? "Modifier" : "Nouvelle recommandation"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-steel">Date</label>
                <input
                  type="date"
                  required
                  value={form.date_recommandation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date_recommandation: e.target.value }))
                  }
                  className="w-full rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-steel">
                  Responsable
                </label>
                <input
                  required
                  value={form.responsable}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, responsable: e.target.value }))
                  }
                  className="w-full rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-steel">
                  Description
                </label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  className="w-full rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-steel">
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
                  className="w-full rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-steel">
                  Observations
                </label>
                <input
                  value={form.observations}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, observations: e.target.value }))
                  }
                  className="w-full rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
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

        <div className="overflow-hidden rounded-[var(--radius-card)] border border-ash bg-canvas-white">
          <table className="min-w-full divide-y divide-cloud text-sm">
            <thead className="bg-paper-mist">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-steel">Date</th>
                <th className="px-4 py-3 text-left font-medium text-steel">Description</th>
                <th className="px-4 py-3 text-left font-medium text-steel">Responsable</th>
                <th className="px-4 py-3 text-left font-medium text-steel">Exécution</th>
                <th className="px-4 py-3 text-right font-medium text-steel">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ash/60">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-fog">
                    Chargement…
                  </td>
                </tr>
              )}
              {data?.items.map((item) => (
                <tr key={item.id} className="hover:bg-paper-mist">
                  <td className="px-4 py-3">{item.date_recommandation}</td>
                  <td className="max-w-xs truncate px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3">{item.responsable}</td>
                  <td className="px-4 py-3">
                    <ExecutionBadge value={item.execution} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canWrite && (
                      <div className="flex justify-end gap-2">
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
      </div>
    </AdminShell>
  );
}
