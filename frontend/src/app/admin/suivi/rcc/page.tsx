"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog, FormDialog } from "@/components/confirm-dialog";
import {
  DetailDrawerActions,
  DetailDrawerRows,
  DetailRow,
} from "@/components/detail-drawer";
import { ExecutionBadge } from "@/components/execution-badge";
import { SegmentedControl } from "@/components/segmented-control";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  createRecommandation,
  deleteRecommandation,
  finaliserRecommandation,
  listRecommandations,
  updateRecommandation,
} from "@/lib/api";
import type { ExecutionStatutFilter, Recommandation } from "@/types";
import { DEFAULT_ANNEE } from "@/types";

function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR");
}

const STATUT_TABS: { key: ExecutionStatutFilter; label: string }[] = [
  { key: null, label: "Toutes" },
  { key: "non_demare", label: "Non démarrées" },
  { key: "en_cours", label: "En cours" },
  { key: "termine", label: "Terminées" },
];

export default function SuiviRccPage() {
  return <SuiviRccContent />;
}

function SuiviRccContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [statut, setStatut] = useState<ExecutionStatutFilter>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Recommandation | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Recommandation | null>(null);
  const [form, setForm] = useState({
    date_recommandation: new Date().toISOString().slice(0, 10),
    description: "",
    responsable: "",
    execution: "0",
    observations: "",
  });

  const queryKey = ["recommandations", DEFAULT_ANNEE, statut];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      listRecommandations({
        annee: DEFAULT_ANNEE,
        statut: statut ?? undefined,
      }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["recommandations"] });

  const createMutation = useMutation({
    mutationFn: () =>
      createRecommandation({
        date_recommandation: form.date_recommandation,
        description: form.description,
        responsable: form.responsable,
        execution: parseFloat(form.execution),
        observations: form.observations || null,
      }),
    onSuccess: () => {
      toast.success("Instruction créée");
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
      toast.success("Instruction mise à jour");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecommandation,
    onSuccess: () => {
      toast.success("Instruction supprimée");
      setDeleteId(null);
      setSelected(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const finaliserMutation = useMutation({
    mutationFn: finaliserRecommandation,
    onSuccess: () => {
      toast.success("Instruction finalisée");
      setSelected(null);
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
    setSelected(null);
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
    <>
      <PageHeader
        title="Instructions RC"
        description="Suivi des instructions"
        actions={
          canWrite && !showForm ? (
            <Button onClick={() => setShowForm(true)}>Nouvelle IRC</Button>
          ) : undefined
        }
      />

      <SegmentedControl
        value={statut}
        onChange={setStatut}
        options={STATUT_TABS.map(({ key, label }) => ({ value: key, label }))}
      />

      {showForm && canWrite && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 panel-grain"
        >
          <h2 className="text-lg font-semibold">
            {editing ? "Modifier" : "Nouvelle instruction"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate">Date</label>
              <input
                type="date"
                required
                value={form.date_recommandation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date_recommandation: e.target.value }))
                }
                className="input-grain w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Responsable</label>
              <input
                required
                value={form.responsable}
                onChange={(e) =>
                  setForm((f) => ({ ...f, responsable: e.target.value }))
                }
                className="input-grain w-full"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-slate">Description</label>
              <textarea
                required
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                className="input-grain w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Exécution (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.execution}
                onChange={(e) =>
                  setForm((f) => ({ ...f, execution: e.target.value }))
                }
                className="input-grain w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Observations</label>
              <input
                value={form.observations}
                onChange={(e) =>
                  setForm((f) => ({ ...f, observations: e.target.value }))
                }
                className="input-grain w-full"
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
          <thead>
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate">Date</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Description</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Responsable</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Exécution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud/60">
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {data?.items.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer hover:bg-veil"
                onClick={() => setSelected(item)}
              >
                <td className="px-4 py-3">{item.date_recommandation}</td>
                <td className="max-w-xs truncate px-4 py-3">{item.description}</td>
                <td className="px-4 py-3">{item.responsable}</td>
                <td className="px-4 py-3">
                  <ExecutionBadge value={item.execution} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormDialog
        open={selected !== null}
        title="Instruction RC"
        subtitle={selected ? formatDate(selected.date_recommandation) : undefined}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <DetailDrawerRows>
              <DetailRow label="Date">{formatDate(selected.date_recommandation)}</DetailRow>
              <DetailRow label="Description">
                <p className="whitespace-pre-wrap">{selected.description}</p>
              </DetailRow>
              <DetailRow label="Responsable">{selected.responsable}</DetailRow>
              <DetailRow label="Exécution">
                <ExecutionBadge value={selected.execution} />
              </DetailRow>
              <DetailRow label="Observations">
                {selected.observations?.trim() ? (
                  <p className="whitespace-pre-wrap">{selected.observations}</p>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Période">
                T{selected.trimestre} · {selected.annee}
              </DetailRow>
            </DetailDrawerRows>
            {canWrite && (
              <DetailDrawerActions>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(selected)}
                  >
                    Modifier
                  </Button>
                  {parseFloat(selected.execution) < 100 && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={finaliserMutation.isPending}
                      onClick={() => finaliserMutation.mutate(selected.id)}
                    >
                      Finaliser
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(selected.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </DetailDrawerActions>
            )}
          </>
        )}
      </FormDialog>

      <ConfirmDialog
        open={deleteId !== null}
        title="Supprimer l'instruction"
        description="Cette instruction sera définitivement supprimée."
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId !== null) deleteMutation.mutate(deleteId);
        }}
      />
    </>
  );
}
