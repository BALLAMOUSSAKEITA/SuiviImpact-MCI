"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog, FormDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { TableRowActions } from "@/components/table-row-actions";
import { Button } from "@/components/ui/button";
import { createProjet, deleteProjet, listProjets, updateProjet } from "@/lib/api";
import type { Projet } from "@/types";

export default function ProjetsPage() {
  return <ProjetsContent />;
}

function ProjetsContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [nom, setNom] = useState("");
  const [editing, setEditing] = useState<Projet | null>(null);
  const [editNom, setEditNom] = useState("");
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Projet | null>(null);

  const queryKey = ["projets"];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listProjets(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: () => createProjet({ description: nom.trim() }),
    onSuccess: (projet) => {
      toast.success(`Projet créé — ${projet.code}`);
      setNom("");
      setShowCreate(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateProjet(editing!.id, { description: editNom.trim() }),
    onSuccess: () => {
      toast.success("Projet mis à jour");
      setConfirmUpdate(false);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProjet,
    onSuccess: () => {
      toast.success("Projet supprimé");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (item: Projet) => {
    setEditing(item);
    setEditNom(item.description);
    setConfirmUpdate(false);
  };

  const closeEdit = () => {
    if (updateMutation.isPending) return;
    setEditing(null);
    setConfirmUpdate(false);
  };

  const requestUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNom.trim()) return;
    setConfirmUpdate(true);
  };

  const projectLabel = (item: Projet) => item.description.trim() || item.code;

  const updateConfirmDescription =
    editing !== null
      ? `Enregistrer le nom « ${editNom.trim()} » pour le projet ${editing.code} ?`
      : "";

  return (
    <>
      <PageHeader
        eyebrow="Paramétrage"
        title="Projets"
        description="Référentiel des projets — identifiant généré automatiquement à la création."
        actions={
          canWrite && !showCreate ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Nouveau projet
            </Button>
          ) : undefined
        }
      />

      {showCreate && canWrite && (
        <div className="panel-grain">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              if (!nom.trim()) return;
              createMutation.mutate();
            }}
          >
            <div className="flex-1">
              <label className="label-grain">Nom du projet</label>
              <input
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="input-grain"
                placeholder="Ex. Appui aux MPME de Kindia"
              />
              <p className="mt-1.5 text-[11px] text-ash">
                L&apos;identifiant (ex. A1B2C3D4) sera généré automatiquement.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowCreate(false);
                  setNom("");
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="table-shell">
        <table className="table-grain">
          <thead>
            <tr>
              <th className="w-[140px]">Identifiant</th>
              <th>Nom du projet</th>
              {canWrite && <th className="w-[1%] text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={canWrite ? 3 : 2} className="py-8 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={canWrite ? 3 : 2} className="py-8 text-center text-ash">
                  Aucun projet enregistré.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="inline-flex rounded-full bg-forest-ink/8 px-2.5 py-0.5 text-xs font-bold text-forest-ink">
                    {item.code}
                  </span>
                </td>
                <td className="font-medium text-graphite">{item.description}</td>
                {canWrite && (
                  <td className="text-right">
                    <TableRowActions
                      onEdit={() => openEdit(item)}
                      onDelete={() => setDeleteTarget(item)}
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
        title={`Modifier — ${editing?.code ?? ""}`}
        onClose={closeEdit}
      >
        <form onSubmit={requestUpdate} className="space-y-4">
          <div>
            <label className="label-grain">Nom du projet</label>
            <input
              required
              value={editNom}
              onChange={(e) => setEditNom(e.target.value)}
              className="input-grain"
            />
            <p className="mt-1.5 text-[11px] text-ash">
              L&apos;identifiant {editing?.code} ne change pas.
            </p>
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
        description={updateConfirmDescription}
        confirmLabel="Oui, enregistrer"
        loading={updateMutation.isPending}
        onCancel={() => setConfirmUpdate(false)}
        onConfirm={() => updateMutation.mutate()}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer le projet"
        description={
          deleteTarget
            ? `Supprimer le projet ${deleteTarget.code} « ${projectLabel(deleteTarget)} » ?`
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
