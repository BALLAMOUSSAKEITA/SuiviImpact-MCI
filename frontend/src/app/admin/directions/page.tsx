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
import { createDirection, listDirections, updateDirection } from "@/lib/api";
import type { Direction } from "@/types";

export default function DirectionsPage() {
  return <DirectionsContent />;
}

function DirectionsContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["directions"];

  const { data: directions = [], isLoading } = useQuery({
    queryKey,
    queryFn: listDirections,
  });

  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [libelle, setLibelle] = useState("");
  const [directeurNom, setDirecteurNom] = useState("");
  const [emailDirecteur, setEmailDirecteur] = useState("");

  const [editing, setEditing] = useState<Direction | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editLibelle, setEditLibelle] = useState("");
  const [editDirecteurNom, setEditDirecteurNom] = useState("");
  const [editEmailDirecteur, setEditEmailDirecteur] = useState("");
  const [confirmUpdate, setConfirmUpdate] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const resetCreateForm = () => {
    setCode("");
    setLibelle("");
    setDirecteurNom("");
    setEmailDirecteur("");
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createDirection({
        code: code.trim(),
        libelle: libelle.trim(),
        directeur_nom: directeurNom.trim(),
        email_directeur: emailDirecteur.trim(),
      }),
    onSuccess: (d) => {
      toast.success(`Direction créée — ${d.code}`);
      resetCreateForm();
      setShowCreate(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateDirection(editing!.id, {
        code: editCode.trim(),
        libelle: editLibelle.trim(),
        directeur_nom: editDirecteurNom.trim(),
        email_directeur: editEmailDirecteur.trim(),
      }),
    onSuccess: () => {
      toast.success("Direction mise à jour");
      setConfirmUpdate(false);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (item: Direction) => {
    setEditing(item);
    setEditCode(item.code);
    setEditLibelle(item.libelle);
    setEditDirecteurNom(item.directeur_nom ?? "");
    setEditEmailDirecteur(item.email_directeur ?? "");
    setConfirmUpdate(false);
  };

  const closeEdit = () => {
    if (updateMutation.isPending) return;
    setEditing(null);
    setConfirmUpdate(false);
  };

  const requestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editCode.trim() ||
      !editLibelle.trim() ||
      !editDirecteurNom.trim() ||
      !editEmailDirecteur.trim()
    ) {
      return;
    }
    setConfirmUpdate(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Paramétrage"
        title="Directions"
        description="Référentiel des directions : acronyme, libellé, directeur et adresse e-mail."
        actions={
          canWrite && !showCreate ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Ajouter une direction
            </Button>
          ) : undefined
        }
      />

      {showCreate && canWrite && (
        <div className="panel-grain mb-6">
          <h3 className="mb-4 text-base font-semibold text-graphite">Nouvelle direction</h3>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
          >
            <div>
              <label className="label-grain">Acronyme</label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input-grain"
                placeholder="Ex. DNI"
              />
            </div>
            <div>
              <label className="label-grain">Direction</label>
              <input
                required
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                className="input-grain"
                placeholder="Libellé complet"
              />
            </div>
            <div>
              <label className="label-grain">Directeur</label>
              <input
                required
                value={directeurNom}
                onChange={(e) => setDirecteurNom(e.target.value)}
                className="input-grain"
                placeholder="Nom du directeur"
              />
            </div>
            <div>
              <label className="label-grain">E-mail du directeur</label>
              <input
                required
                type="email"
                value={emailDirecteur}
                onChange={(e) => setEmailDirecteur(e.target.value)}
                className="input-grain"
                placeholder="directeur@direction.gn"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit" disabled={createMutation.isPending}>
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowCreate(false);
                  resetCreateForm();
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
              <th className="w-[100px]">Acronyme</th>
              <th>Direction</th>
              <th>Directeur</th>
              <th>E-mail du directeur</th>
              {canWrite && <th className="w-[1%] text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={canWrite ? 5 : 4} className="py-8 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && directions.length === 0 && (
              <tr>
                <td colSpan={canWrite ? 5 : 4} className="py-8 text-center text-ash">
                  Aucune direction enregistrée
                </td>
              </tr>
            )}
            {directions.map((d) => (
              <tr key={d.id}>
                <td>
                  <span className="inline-flex rounded-full bg-forest-ink/8 px-2.5 py-0.5 text-xs font-bold text-forest-ink">
                    {d.code}
                  </span>
                </td>
                <td className="font-medium text-graphite">{d.libelle}</td>
                <td className="text-slate">{d.directeur_nom?.trim() || "—"}</td>
                <td className="text-sm text-slate">{d.email_directeur?.trim() || "—"}</td>
                {canWrite && (
                  <td className="text-right">
                    <TableRowActions onEdit={() => openEdit(d)} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormDialog
        open={editing !== null && !confirmUpdate}
        title="Modifier la direction"
        onClose={closeEdit}
      >
        <form onSubmit={requestSave} className="space-y-4">
          <div>
            <label className="label-grain">Acronyme</label>
            <input
              required
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              className="input-grain"
            />
          </div>
          <div>
            <label className="label-grain">Direction</label>
            <input
              required
              value={editLibelle}
              onChange={(e) => setEditLibelle(e.target.value)}
              className="input-grain"
            />
          </div>
          <div>
            <label className="label-grain">Directeur</label>
            <input
              required
              value={editDirecteurNom}
              onChange={(e) => setEditDirecteurNom(e.target.value)}
              className="input-grain"
            />
          </div>
          <div>
            <label className="label-grain">E-mail du directeur</label>
            <input
              required
              type="email"
              value={editEmailDirecteur}
              onChange={(e) => setEditEmailDirecteur(e.target.value)}
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
        description={`Enregistrer les modifications de la direction « ${editCode} » ?`}
        confirmLabel="Oui, enregistrer"
        loading={updateMutation.isPending}
        onCancel={() => setConfirmUpdate(false)}
        onConfirm={() => updateMutation.mutate()}
      />
    </>
  );
}
