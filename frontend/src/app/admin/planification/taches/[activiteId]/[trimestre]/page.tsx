"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { TacheStatutBadge } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  createTache,
  deleteTache,
  listTaches,
  updateTache,
} from "@/lib/api";
import {
  DEFAULT_ANNEE,
  MOIS_LABELS,
  TRIMESTRE_MOIS,
  type SemainePlan,
  type Tache,
} from "@/types";

export default function PlanificationTachesPage() {
  return (
    <ProtectedRoute>
      <TachesContent />
    </ProtectedRoute>
  );
}

function TachesContent() {
  const params = useParams();
  const activiteId = Number(params.activiteId);
  const trimestre = Number(params.trimestre);
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["taches", activiteId, trimestre, DEFAULT_ANNEE];

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tache | null>(null);
  const [form, setForm] = useState({
    description: "",
    responsable: "",
    email_responsable: "",
    ponderation: "10",
    semaines: [] as SemainePlan[],
  });

  const { data: taches = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listTaches(activiteId, trimestre, DEFAULT_ANNEE),
  });

  const moisList = TRIMESTRE_MOIS[trimestre] ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: () =>
      createTache(activiteId, {
        trimestre,
        annee: DEFAULT_ANNEE,
        description: form.description,
        responsable: form.responsable,
        email_responsable: form.email_responsable || null,
        ponderation: parseFloat(form.ponderation),
        semaines: form.semaines,
      }),
    onSuccess: () => {
      toast.success("Tâche créée");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateTache(editing!.id, {
        description: form.description,
        responsable: form.responsable,
        email_responsable: form.email_responsable || null,
        ponderation: parseFloat(form.ponderation),
        semaines: form.semaines,
      }),
    onSuccess: () => {
      toast.success("Tâche mise à jour");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTache,
    onSuccess: () => {
      toast.success("Tâche supprimée");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      description: "",
      responsable: "",
      email_responsable: "",
      ponderation: "10",
      semaines: [],
    });
  };

  const startEdit = (tache: Tache) => {
    setEditing(tache);
    setShowForm(true);
    setForm({
      description: tache.description,
      responsable: tache.responsable,
      email_responsable: tache.email_responsable ?? "",
      ponderation: tache.ponderation,
      semaines: tache.semaines.map((s) => ({ mois: s.mois, semaine: s.semaine })),
    });
  };

  const toggleSemaine = (mois: number, semaine: number) => {
    const exists = form.semaines.some(
      (s) => s.mois === mois && s.semaine === semaine,
    );
    setForm((prev) => ({
      ...prev,
      semaines: exists
        ? prev.semaines.filter(
            (s) => !(s.mois === mois && s.semaine === semaine),
          )
        : [...prev.semaines, { mois, semaine }],
    }));
  };

  const isSemaineSelected = (mois: number, semaine: number) =>
    form.semaines.some((s) => s.mois === mois && s.semaine === semaine);

  const isSemainePlanned = (tache: Tache, mois: number, semaine: number) =>
    tache.semaines.some(
      (s) => s.mois === mois && s.semaine === semaine && s.planifie,
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/admin/planification/${trimestre}`}
              className="text-sm text-emerald-700 hover:underline"
            >
              ← Retour planification T{trimestre}
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-zinc-900">
              Tâches — Activité #{activiteId} — T{trimestre}
            </h1>
          </div>
          {canWrite && !showForm && (
            <Button onClick={() => setShowForm(true)}>Nouvelle tâche</Button>
          )}
        </div>

        {showForm && canWrite && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-zinc-900">
              {editing ? "Modifier la tâche" : "Nouvelle tâche"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-zinc-600">
                  Description
                </label>
                <input
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-600">
                  Responsable
                </label>
                <input
                  required
                  value={form.responsable}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, responsable: e.target.value }))
                  }
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-600">
                  Email responsable
                </label>
                <input
                  type="email"
                  value={form.email_responsable}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      email_responsable: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-600">
                  Pondération (%)
                </label>
                <input
                  required
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={form.ponderation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ponderation: e.target.value }))
                  }
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700">
                Calendrier des semaines
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="border border-zinc-200 bg-zinc-50 px-2 py-1">
                        Mois
                      </th>
                      {[1, 2, 3, 4].map((s) => (
                        <th
                          key={s}
                          className="border border-zinc-200 bg-zinc-50 px-2 py-1"
                        >
                          S{s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {moisList.map((mois) => (
                      <tr key={mois}>
                        <td className="border border-zinc-200 px-2 py-1 font-medium">
                          {MOIS_LABELS[mois - 1]}
                        </td>
                        {[1, 2, 3, 4].map((semaine) => (
                          <td
                            key={semaine}
                            className="border border-zinc-200 p-1 text-center"
                          >
                            <button
                              type="button"
                              onClick={() => toggleSemaine(mois, semaine)}
                              className={`h-8 w-full rounded transition-colors ${
                                isSemaineSelected(mois, semaine)
                                  ? "bg-emerald-600 text-white"
                                  : "bg-zinc-100 hover:bg-emerald-100"
                              }`}
                            >
                              {isSemaineSelected(mois, semaine) ? "✓" : ""}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editing ? "Enregistrer" : "Créer"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-zinc-400">Chargement…</p>
        ) : taches.length === 0 ? (
          <p className="text-sm text-zinc-400">Aucune tâche pour cette activité.</p>
        ) : (
          <div className="space-y-4">
            {taches.map((tache) => (
              <div
                key={tache.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-900">
                      {tache.description}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {tache.responsable} — Pondération : {tache.ponderation} %
                    </p>
                    <div className="mt-2">
                      <TacheStatutBadge statut={tache.statut} />
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="h-8 px-3 text-xs"
                        onClick={() => startEdit(tache)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-xs text-red-600"
                        onClick={() => {
                          if (window.confirm("Supprimer cette tâche ?")) {
                            deleteMutation.mutate(tache.id);
                          }
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="border border-zinc-200 bg-zinc-50 px-2 py-1">
                          Mois
                        </th>
                        {[1, 2, 3, 4].map((s) => (
                          <th
                            key={s}
                            className="border border-zinc-200 bg-zinc-50 px-2 py-1"
                          >
                            S{s}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {moisList.map((mois) => (
                        <tr key={mois}>
                          <td className="border border-zinc-200 px-2 py-1 font-medium">
                            {MOIS_LABELS[mois - 1]}
                          </td>
                          {[1, 2, 3, 4].map((semaine) => (
                            <td
                              key={semaine}
                              className={`border border-zinc-200 p-1 text-center ${
                                isSemainePlanned(tache, mois, semaine)
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-zinc-50"
                              }`}
                            >
                              {isSemainePlanned(tache, mois, semaine) ? "●" : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
