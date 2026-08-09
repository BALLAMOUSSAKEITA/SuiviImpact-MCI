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
import {
  PROJET_TYPE_FILTER_OPTIONS,
  PROJET_TYPE_LABELS,
  projetTypeBadgeClass,
  type ProjetTypeFilter,
} from "@/lib/projet-types";
import { cn } from "@/lib/utils";
import type { Projet, ProjetType } from "@/types";

export default function ProjetsPage() {
  return <ProjetsContent />;
}

function ProjetsContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<ProjetTypeFilter>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [nom, setNom] = useState("");
  const [typeProjet, setTypeProjet] = useState<ProjetType>("ordinaire");
  const [editing, setEditing] = useState<Projet | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editType, setEditType] = useState<ProjetType>("ordinaire");
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Projet | null>(null);

  const queryKey = ["projets", typeFilter];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      listProjets(
        typeFilter === "all" ? undefined : { type_projet: typeFilter },
      ),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["projets"] });

  const createMutation = useMutation({
    mutationFn: () =>
      createProjet({
        code: code.trim(),
        description: nom.trim(),
        type_projet: typeProjet,
      }),
    onSuccess: (projet) => {
      toast.success(`Projet créé — ${projet.code}`);
      setCode("");
      setNom("");
      setTypeProjet("ordinaire");
      setShowCreate(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProjet(editing!.id, {
        description: editNom.trim(),
        type_projet: editType,
      }),
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
    setEditType(item.type_projet);
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
      ? `Enregistrer « ${editNom.trim()} » (${PROJET_TYPE_LABELS[editType]}) pour le projet ${editing.code} ?`
      : "";

  return (
    <>
      <PageHeader
        eyebrow="Paramétrage"
        title="Projets"
        description="Référentiel des projets ordinaires et méga-projets Simandou — code saisi à la création."
        actions={
          canWrite && !showCreate ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Nouveau projet
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2">
        {PROJET_TYPE_FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTypeFilter(option.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              typeFilter === option.value
                ? "bg-forest-ink text-white"
                : "bg-veil text-slate hover:bg-cloud hover:text-graphite",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {showCreate && canWrite && (
        <div className="panel-grain">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!code.trim() || !nom.trim()) return;
              createMutation.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label-grain">Code</label>
                <input
                  required
                  maxLength={32}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input-grain w-full font-mono"
                  placeholder="Ex. SIM-01"
                  autoComplete="off"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-grain">Nom du projet</label>
                <input
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="input-grain w-full"
                  placeholder="Ex. Appui aux MPME de Kindia"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="label-grain">Type de projet</label>
                <select
                  value={typeProjet}
                  onChange={(e) => setTypeProjet(e.target.value as ProjetType)}
                  className="input-grain w-full sm:max-w-xs"
                >
                  <option value="ordinaire">{PROJET_TYPE_LABELS.ordinaire}</option>
                  <option value="mega_simandou">{PROJET_TYPE_LABELS.mega_simandou}</option>
                </select>
              </div>
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
                  setCode("");
                  setNom("");
                  setTypeProjet("ordinaire");
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
              <th className="w-[140px]">Code</th>
              <th className="w-[200px]">Type</th>
              <th>Nom du projet</th>
              {canWrite && <th className="w-[1%] text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={canWrite ? 4 : 3} className="py-8 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={canWrite ? 4 : 3} className="py-8 text-center text-ash">
                  Aucun projet pour ce filtre.
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
                <td>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                      projetTypeBadgeClass(item.type_projet),
                    )}
                  >
                    {PROJET_TYPE_LABELS[item.type_projet]}
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
              className="input-grain w-full"
            />
          </div>
          <div>
            <label className="label-grain">Type de projet</label>
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as ProjetType)}
              className="input-grain w-full"
            >
              <option value="ordinaire">{PROJET_TYPE_LABELS.ordinaire}</option>
              <option value="mega_simandou">{PROJET_TYPE_LABELS.mega_simandou}</option>
            </select>
          </div>
          <p className="text-[11px] text-ash">
            Le code {editing?.code} ne peut pas être modifié après création.
          </p>
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
