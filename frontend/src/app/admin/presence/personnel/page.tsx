"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog, FormDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { TableRowActions } from "@/components/table-row-actions";
import { Button } from "@/components/ui/button";
import {
  createPersonnelCabinet,
  deletePersonnelCabinet,
  listPersonnelCabinet,
  regeneratePersonnelCodes,
  updatePersonnelCabinet,
} from "@/lib/api";
import type { PersonnelCabinet } from "@/types";

const emptyForm = {
  num_ordre: "",
  nom_complet: "",
  fonction: "",
  contact: "",
  email: "",
  categorie: "",
  code_presence: "",
};

export default function PersonnelPresencePage() {
  return <PersonnelPresenceContent />;
}

function PersonnelPresenceContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<PersonnelCabinet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PersonnelCabinet | null>(null);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const queryKey = ["presence-personnel"];

  const { data = [], isLoading } = useQuery({
    queryKey,
    queryFn: listPersonnelCabinet,
  });

  const categories = useMemo(
    () => [...new Set(data.map((p) => p.categorie).filter(Boolean))].sort(),
    [data],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((p) => {
      if (categorieFilter && p.categorie !== categorieFilter) return false;
      if (!q) return true;
      return (
        p.nom_complet.toLowerCase().includes(q) ||
        p.fonction.toLowerCase().includes(q) ||
        p.code_presence.includes(q) ||
        (p.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [data, search, categorieFilter]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: () =>
      createPersonnelCabinet({
        num_ordre: Number(form.num_ordre),
        nom_complet: form.nom_complet.trim(),
        fonction: form.fonction.trim(),
        contact: form.contact.trim() || null,
        email: form.email.trim() || null,
        categorie: form.categorie.trim(),
      }),
    onSuccess: () => {
      toast.success("Personnel ajouté");
      setShowCreate(false);
      setForm(emptyForm);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updatePersonnelCabinet(editing!.id, {
        num_ordre: Number(form.num_ordre),
        nom_complet: form.nom_complet.trim(),
        fonction: form.fonction.trim(),
        contact: form.contact.trim() || null,
        email: form.email.trim() || null,
        categorie: form.categorie.trim(),
        code_presence: form.code_presence.trim(),
      }),
    onSuccess: () => {
      toast.success("Personnel mis à jour");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePersonnelCabinet,
    onSuccess: () => {
      toast.success("Personnel supprimé");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const regenerateMutation = useMutation({
    mutationFn: regeneratePersonnelCodes,
    onSuccess: (res) => {
      toast.success(`${res.updated} code(s) régénéré(s) aléatoirement`);
      setConfirmRegenerate(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (item: PersonnelCabinet) => {
    setEditing(item);
    setForm({
      num_ordre: String(item.num_ordre),
      nom_complet: item.nom_complet,
      fonction: item.fonction,
      contact: item.contact ?? "",
      email: item.email ?? "",
      categorie: item.categorie,
      code_presence: item.code_presence,
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Présence"
        title="Personnel"
        description="Liste complète de 89 lignes (Conseil de Cabinet). Les lignes sans nom servent à l'export ; seules les personnes identifiées pointent via QR."
        actions={
          canWrite ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setConfirmRegenerate(true)}>
                Régénérer les codes
              </Button>
              <Button onClick={() => { setForm(emptyForm); setShowCreate(true); }}>
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="panel-grain mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="label-grain">Rechercher</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-grain pl-9"
              placeholder="Nom, fonction, code, e-mail…"
            />
          </div>
        </div>
        <div className="min-w-[180px]">
          <label className="label-grain">Catégorie</label>
          <select
            value={categorieFilter}
            onChange={(e) => setCategorieFilter(e.target.value)}
            className="input-grain"
          >
            <option value="">Toutes</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <p className="pb-2 text-sm text-slate">{filtered.length} personne(s)</p>
      </div>

      <div className="table-shell overflow-x-auto">
        <table className="table-grain min-w-[960px]">
          <thead>
            <tr>
              <th>N°</th>
              <th>Nom complet</th>
              <th>Fonction</th>
              <th>Catégorie</th>
              <th>Contact</th>
              <th>E-mail</th>
              <th>Code</th>
              {canWrite && <th className="w-[1%] text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={canWrite ? 8 : 7} className="py-8 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={canWrite ? 8 : 7} className="py-8 text-center text-ash">
                  Aucun personnel trouvé
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className={!p.actif ? "opacity-50" : undefined}>
                <td className="text-slate">{p.num_ordre}</td>
                <td className="font-medium text-graphite">{p.nom_complet.trim() || "—"}</td>
                <td className="max-w-xs text-sm text-slate">{p.fonction}</td>
                <td className="text-sm text-slate">{p.categorie || "—"}</td>
                <td className="text-sm text-slate">{p.contact || "—"}</td>
                <td className="text-sm text-slate">{p.email || "—"}</td>
                <td>
                  <span className="rounded bg-[#e0f5ea] px-2 py-0.5 font-mono text-sm font-semibold text-forest-ink">
                    {p.code_presence}
                  </span>
                </td>
                {canWrite && (
                  <td className="text-right">
                    <TableRowActions
                      onEdit={() => openEdit(p)}
                      onDelete={() => setDeleteTarget(p)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormDialog
        open={showCreate}
        title="Ajouter un membre du personnel"
        onClose={() => setShowCreate(false)}
      >
        <PersonnelForm
          form={form}
          setForm={setForm}
          isEdit={false}
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          loading={createMutation.isPending}
          onCancel={() => setShowCreate(false)}
        />
      </FormDialog>

      <FormDialog
        open={editing !== null}
        title="Modifier le personnel"
        onClose={() => setEditing(null)}
      >
        <PersonnelForm
          form={form}
          setForm={setForm}
          isEdit
          onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }}
          loading={updateMutation.isPending}
          onCancel={() => setEditing(null)}
        />
      </FormDialog>

      <ConfirmDialog
        open={confirmRegenerate}
        title="Régénérer tous les codes"
        description="Attribuer un nouveau code aléatoire à 4 chiffres à chaque membre du personnel ? Les anciens codes ne fonctionneront plus."
        confirmLabel="Régénérer"
        loading={regenerateMutation.isPending}
        onCancel={() => setConfirmRegenerate(false)}
        onConfirm={() => regenerateMutation.mutate()}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer"
        description={
          deleteTarget
            ? `Supprimer « ${deleteTarget.nom_complet} » ? Cette action est irréversible.`
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

function PersonnelForm({
  form,
  setForm,
  isEdit,
  onSubmit,
  loading,
  onCancel,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  isEdit?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-grain">N° d&apos;ordre</label>
          <input
            required
            type="number"
            min={1}
            max={9999}
            value={form.num_ordre}
            onChange={(e) => setForm((f) => ({ ...f, num_ordre: e.target.value }))}
            className="input-grain"
          />
        </div>
        {isEdit ? (
          <div>
            <label className="label-grain">Code présence</label>
            <input
              required
              pattern="\d{4}"
              maxLength={4}
              value={form.code_presence}
              onChange={(e) => setForm((f) => ({ ...f, code_presence: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
              className="input-grain font-mono"
            />
          </div>
        ) : (
          <div className="flex items-end">
            <p className="text-sm text-slate">Un code aléatoire à 4 chiffres sera généré automatiquement.</p>
          </div>
        )}
      </div>
      <div>
        <label className="label-grain">Nom complet</label>
        <input
          required
          value={form.nom_complet}
          onChange={(e) => setForm((f) => ({ ...f, nom_complet: e.target.value }))}
          className="input-grain"
        />
      </div>
      <div>
        <label className="label-grain">Fonction</label>
        <textarea
          required
          rows={2}
          value={form.fonction}
          onChange={(e) => setForm((f) => ({ ...f, fonction: e.target.value }))}
          className="input-grain"
        />
      </div>
      <div>
        <label className="label-grain">Catégorie</label>
        <input
          value={form.categorie}
          onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}
          className="input-grain"
          placeholder="Cabinet, Directions nationales…"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-grain">Contact</label>
          <input
            value={form.contact}
            onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
            className="input-grain"
          />
        </div>
        <div>
          <label className="label-grain">E-mail</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="input-grain"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
