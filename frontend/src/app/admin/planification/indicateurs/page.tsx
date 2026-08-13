"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  createIndicateur,
  deleteIndicateur,
  listDirections,
  listIndicateurs,
  updateIndicateur,
} from "@/lib/api";
import type { Indicateur } from "@/types";

const emptyForm = {
  code: "",
  libelle: "",
  nombre_unites: "",
  direction_id: "",
  reference: "",
  cible: "",
};

export default function PlanificationIndicateursPage() {
  return <PlanificationIndicateursContent />;
}

function PlanificationIndicateursContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Indicateur | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const queryKey = ["indicateurs"];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: listIndicateurs,
  });

  const { data: directions = [] } = useQuery({
    queryKey: ["directions"],
    queryFn: () => listDirections(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createIndicateur({
        code: form.code.trim(),
        libelle: form.libelle.trim(),
        nombre_unites: form.nombre_unites.trim() || null,
        direction_id: form.direction_id ? Number(form.direction_id) : null,
        reference: form.reference ? parseFloat(form.reference) : null,
        cible: form.cible ? parseFloat(form.cible) : null,
        realise: 0,
      }),
    onSuccess: () => {
      toast.success("Indicateur planifié");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateIndicateur(editing!.id, {
        code: form.code.trim(),
        libelle: form.libelle.trim(),
        nombre_unites: form.nombre_unites.trim() || null,
        direction_id: form.direction_id ? Number(form.direction_id) : null,
        reference: form.reference ? parseFloat(form.reference) : null,
        cible: form.cible ? parseFloat(form.cible) : null,
      }),
    onSuccess: () => {
      toast.success("Indicateur mis à jour");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIndicateur,
    onSuccess: () => {
      toast.success("Indicateur supprimé");
      setDeleteId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startEdit = (item: Indicateur) => {
    setEditing(item);
    setShowForm(true);
    setForm({
      code: item.code,
      libelle: item.libelle,
      nombre_unites: item.nombre_unites ?? "",
      direction_id: item.direction_id != null ? String(item.direction_id) : "",
      reference: item.reference ?? "",
      cible: item.cible ?? "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <PageHeader
        title="Indicateurs"
        description="Planification des indicateurs : code, unités, direction, référence et cible"
        actions={
          canWrite && !showForm ? (
            <Button onClick={() => setShowForm(true)}>Nouvel indicateur</Button>
          ) : undefined
        }
      />

      {showForm && canWrite && (
        <form onSubmit={handleSubmit} className="space-y-4 panel-grain">
          <h2 className="text-lg font-semibold">
            {editing ? "Modifier l'indicateur" : "Nouvel indicateur"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-slate">Code</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="input-grain w-full"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-slate">Libellé</label>
              <input
                required
                value={form.libelle}
                onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
                className="input-grain w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Nombre d&apos;unités</label>
              <input
                type="text"
                maxLength={100}
                value={form.nombre_unites}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nombre_unites: e.target.value }))
                }
                className="input-grain w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Direction</label>
              <select
                required
                value={form.direction_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, direction_id: e.target.value }))
                }
                className="input-grain w-full"
              >
                <option value="">Choisir une direction…</option>
                {directions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} — {d.libelle}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="mb-2 text-sm font-medium text-slate">Valeur</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate">Référence</label>
                  <input
                    type="number"
                    step="any"
                    value={form.reference}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, reference: e.target.value }))
                    }
                    className="input-grain w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate">Cible</label>
                  <input
                    type="number"
                    step="any"
                    value={form.cible}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cible: e.target.value }))
                    }
                    className="input-grain w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {editing ? "Enregistrer" : "Créer"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Annuler
            </Button>
          </div>
        </form>
      )}

      <div className="table-shell">
        <table className="table-grain min-w-[800px]">
          <thead>
            <tr>
              <th rowSpan={2} className="px-4 py-3 text-left font-medium text-slate">
                Code
              </th>
              <th rowSpan={2} className="px-4 py-3 text-left font-medium text-slate">
                Libellé
              </th>
              <th rowSpan={2} className="px-4 py-3 text-left font-medium text-slate">
                Unités
              </th>
              <th rowSpan={2} className="px-4 py-3 text-left font-medium text-slate">
                Direction
              </th>
              <th
                colSpan={2}
                className="border-b border-cloud/60 px-4 py-2 text-center font-medium text-slate"
              >
                Valeur
              </th>
              <th rowSpan={2} className="px-4 py-3 text-right font-medium text-slate">
                Actions
              </th>
            </tr>
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate">Référence</th>
              <th className="px-4 py-2 text-left font-medium text-slate">Cible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud/60">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ash">
                  Aucun indicateur planifié
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-veil">
                <td className="px-4 py-3 font-medium">{item.code}</td>
                <td className="max-w-xs truncate px-4 py-3">{item.libelle}</td>
                <td className="px-4 py-3">{item.nombre_unites ?? "—"}</td>
                <td className="px-4 py-3">
                  {item.direction_code
                    ? `${item.direction_code}${
                        item.direction_libelle ? ` — ${item.direction_libelle}` : ""
                      }`
                    : "—"}
                </td>
                <td className="px-4 py-3">{item.reference ?? "—"}</td>
                <td className="px-4 py-3">{item.cible ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  {canWrite && (
                    <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(item)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(item.id)}
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

      <ConfirmDialog
        open={deleteId !== null}
        title="Supprimer l'indicateur"
        description="Cet indicateur sera définitivement supprimé."
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
