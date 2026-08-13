"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TacheStatutBadge } from "@/components/execution-badge";
import { PageBackLink, PageHeader } from "@/components/page-header";
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
  return <TachesContent />;
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
  const [deleteTacheId, setDeleteTacheId] = useState<number | null>(null);
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
      setDeleteTacheId(null);
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
    <>
      <PageBackLink href={`/admin/planification/${trimestre}`}>
        ← Retour planification T{trimestre}
      </PageBackLink>
      <PageHeader
        className="mt-2"
        title={`Tâches — Activité #${activiteId} — T${trimestre}`}
        actions={
          canWrite && !showForm ? (
            <Button onClick={() => setShowForm(true)}>Nouvelle tâche</Button>
          ) : undefined
        }
      />

        {showForm && canWrite && (
          <form
            onSubmit={handleSubmit}
            className="panel-grain space-y-4"
          >
            <h2 className="text-lg font-semibold text-graphite">
              {editing ? "Modifier la tâche" : "Nouvelle tâche"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate">
                  Description
                </label>
                <input
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="input-grain w-full"
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
                  className="input-grain w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate">
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
                  className="input-grain w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate">
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
                  className="input-grain w-full"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate">
                Calendrier des semaines
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="border border-cloud bg-veil px-2 py-1">
                        Mois
                      </th>
                      {[1, 2, 3, 4].map((s) => (
                        <th
                          key={s}
                          className="border border-cloud bg-veil px-2 py-1"
                        >
                          S{s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {moisList.map((mois) => (
                      <tr key={mois}>
                        <td className="border border-cloud px-2 py-1 font-medium">
                          {MOIS_LABELS[mois - 1]}
                        </td>
                        {[1, 2, 3, 4].map((semaine) => (
                          <td
                            key={semaine}
                            className="border border-cloud p-1 text-center"
                          >
                            <button
                              type="button"
                              onClick={() => toggleSemaine(mois, semaine)}
                              className={`h-8 w-full rounded transition-colors ${
                                isSemaineSelected(mois, semaine)
                                  ? "bg-forest-ink text-white"
                                  : "bg-veil hover:bg-veil"
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
          <p className="text-sm text-ash">Chargement…</p>
        ) : taches.length === 0 ? (
          <p className="text-sm text-ash">Aucune tâche pour cette activité.</p>
        ) : (
          <div className="space-y-4">
            {taches.map((tache) => (
              <div
                key={tache.id}
                className="panel-grain"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-graphite">
                      {tache.description}
                    </p>
                    <p className="mt-1 text-sm text-fog">
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
                        size="sm"
                        onClick={() => startEdit(tache)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTacheId(tache.id)}
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
                        <th className="border border-cloud bg-veil px-2 py-1">
                          Mois
                        </th>
                        {[1, 2, 3, 4].map((s) => (
                          <th
                            key={s}
                            className="border border-cloud bg-veil px-2 py-1"
                          >
                            S{s}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {moisList.map((mois) => (
                        <tr key={mois}>
                          <td className="border border-cloud px-2 py-1 font-medium">
                            {MOIS_LABELS[mois - 1]}
                          </td>
                          {[1, 2, 3, 4].map((semaine) => (
                            <td
                              key={semaine}
                              className={`border border-cloud p-1 text-center ${
                                isSemainePlanned(tache, mois, semaine)
                                  ? "bg-veil text-forest-ink"
                                  : "bg-veil"
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
      <ConfirmDialog
        open={deleteTacheId !== null}
        title="Supprimer la tâche"
        description="Cette tâche sera définitivement supprimée."
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTacheId(null)}
        onConfirm={() => {
          if (deleteTacheId !== null) deleteMutation.mutate(deleteTacheId);
        }}
      />
    </>
  );
}
