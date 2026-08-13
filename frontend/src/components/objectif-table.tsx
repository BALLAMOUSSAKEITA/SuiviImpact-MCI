"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog, FormDialog } from "@/components/confirm-dialog";
import { TableRowActions } from "@/components/table-row-actions";
import { Button } from "@/components/ui/button";
import { deleteObjectif, updateObjectif } from "@/lib/api";
import type { Objectif } from "@/types";

interface ObjectifTableProps {
  objectifs: Objectif[];
  queryKey: string[];
}

export function ObjectifTable({ objectifs, queryKey }: ObjectifTableProps) {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState<Objectif | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Objectif | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteObjectif,
    onSuccess: () => {
      toast.success("Objectif supprimé");
      queryClient.invalidateQueries({ queryKey });
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateObjectif(editing!.id, {
        code: editCode.trim(),
        description: editDescription.trim(),
      }),
    onSuccess: () => {
      toast.success("Objectif mis à jour");
      queryClient.invalidateQueries({ queryKey });
      setConfirmUpdate(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (objectif: Objectif) => {
    setEditing(objectif);
    setEditCode(objectif.code);
    setEditDescription(objectif.description);
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
      <div className="table-shell animate-fade-in">
        <table className="table-grain">
          <thead>
            <tr>
              <th>Code</th>
              <th>Objectifs</th>
              {canWrite && <th className="w-[1%] text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {objectifs.length === 0 && (
              <tr>
                <td colSpan={canWrite ? 3 : 2} className="py-12 text-center">
                  <p className="text-sm text-ash">Aucun objectif enregistré</p>
                </td>
              </tr>
            )}
            {objectifs.map((objectif) => (
              <tr key={objectif.id} className="group">
                <td>
                  <span className="inline-flex border border-[#d4e5dc] bg-[#f6faf7] px-2 py-0.5 text-xs font-semibold text-[#0d4f38]">
                    {objectif.code}
                  </span>
                </td>
                <td className="font-medium text-graphite">{objectif.description}</td>
                {canWrite && (
                  <td className="text-right">
                    <TableRowActions
                      onEdit={() => openEdit(objectif)}
                      onDelete={() => setDeleteTarget(objectif)}
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
        title="Modifier l'objectif"
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
            <textarea
              required
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="input-grain min-h-[80px] py-2"
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
        description={`Enregistrer les modifications de l'objectif « ${editCode} » ?`}
        confirmLabel="Oui, enregistrer"
        variant="info"
        loading={updateMutation.isPending}
        onCancel={() => setConfirmUpdate(false)}
        onConfirm={() => updateMutation.mutate()}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer l'objectif"
        description={
          deleteTarget
            ? `Supprimer l'objectif « ${deleteTarget.code} » ? Les activités associées seront aussi supprimées.`
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
