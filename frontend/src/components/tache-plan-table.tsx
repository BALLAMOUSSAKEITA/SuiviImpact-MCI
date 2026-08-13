"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog, FormDialog } from "@/components/confirm-dialog";
import { TableRowActions } from "@/components/table-row-actions";
import { Button } from "@/components/ui/button";
import { deleteTachePlan, updateTachePlan } from "@/lib/api";
import type { TachePlan } from "@/types";

interface TachePlanTableProps {
  taches: TachePlan[];
  queryKey: string[];
}

export function TachePlanTable({ taches, queryKey }: TachePlanTableProps) {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState<TachePlan | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TachePlan | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteTachePlan,
    onSuccess: () => {
      toast.success("Tâche supprimée");
      queryClient.invalidateQueries({ queryKey });
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateTachePlan(editing!.id, {
        code: editCode.trim(),
        description: editDescription.trim(),
      }),
    onSuccess: () => {
      toast.success("Tâche mise à jour");
      queryClient.invalidateQueries({ queryKey });
      setConfirmUpdate(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (tache: TachePlan) => {
    setEditing(tache);
    setEditCode(tache.code);
    setEditDescription(tache.description);
  };

  const closeEdit = () => {
    if (updateMutation.isPending) return;
    setEditing(null);
    setConfirmUpdate(false);
  };

  const requestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCode.trim() || !editDescription.trim()) return;
    setConfirmUpdate(true);
  };

  return (
    <>
      <div className="table-shell">
        <table className="table-grain">
          <thead>
            <tr>
              <th>Code</th>
              <th>Tâches</th>
              {canWrite && <th className="w-[1%] text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {taches.length === 0 && (
              <tr>
                <td colSpan={canWrite ? 3 : 2} className="py-8 text-center text-ash">
                  Aucune tâche enregistrée
                </td>
              </tr>
            )}
            {taches.map((tache) => (
              <tr key={tache.id}>
                <td>
                  <span className="inline-flex rounded-full bg-veil px-2.5 py-0.5 text-xs font-semibold text-graphite">
                    {tache.code}
                  </span>
                </td>
                <td className="text-slate">{tache.description}</td>
                {canWrite && (
                  <td className="text-right">
                    <TableRowActions
                      onEdit={() => openEdit(tache)}
                      onDelete={() => setDeleteTarget(tache)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormDialog
        open={editing !== null && !confirmUpdate}
        title="Modifier la tâche"
        onClose={closeEdit}
      >
        <form onSubmit={requestSave} className="space-y-4">
          <div>
            <label className="label-grain">Code</label>
            <input
              required
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              className="input-grain"
            />
          </div>
          <div>
            <label className="label-grain">Description</label>
            <input
              required
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="input-grain"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeEdit}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={confirmUpdate && editing !== null}
        title="Confirmer la modification"
        description={`Enregistrer les modifications de la tâche « ${editCode} » ?`}
        confirmLabel="Oui, enregistrer"
        loading={updateMutation.isPending}
        onCancel={() => setConfirmUpdate(false)}
        onConfirm={() => updateMutation.mutate()}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer la tâche"
        description={
          deleteTarget
            ? `Supprimer la tâche « ${deleteTarget.code} » ? Cette action est irréversible.`
            : ""
        }
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </>
  );
}
