"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { createPpm, deletePpm, listPpm, updatePpm } from "@/lib/api";
import { PPM_STATUT_LABELS, type Ppm, type PpmStatut } from "@/types";

const STATUTS: PpmStatut[] = [
  "dao_elabore",
  "dao_publie",
  "marche_attribue",
  "contrat_signe",
];

export default function SuiviPpmPage() {
  return <SuiviPpmContent />;
}

function SuiviPpmContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ppm | null>(null);
  const [form, setForm] = useState({
    numero: "",
    intitule: "",
    type_marche: "",
    mode_passation: "",
    montant_estime: "",
    montant_attribue: "",
    financement: "",
    date_marche: "",
    statut: "dao_elabore" as PpmStatut,
    observations: "",
  });

  const queryKey = ["ppm"];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listPpm(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: () =>
      createPpm({
        numero: form.numero || null,
        intitule: form.intitule,
        type_marche: form.type_marche || null,
        mode_passation: form.mode_passation || null,
        montant_estime: form.montant_estime ? parseFloat(form.montant_estime) : null,
        montant_attribue: form.montant_attribue ? parseFloat(form.montant_attribue) : null,
        financement: form.financement || null,
        date_marche: form.date_marche || null,
        statut: form.statut,
        observations: form.observations || null,
      }),
    onSuccess: () => {
      toast.success("Marché PPM créé");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updatePpm(editing!.id, {
        numero: form.numero || null,
        intitule: form.intitule,
        type_marche: form.type_marche || null,
        mode_passation: form.mode_passation || null,
        montant_estime: form.montant_estime ? parseFloat(form.montant_estime) : null,
        montant_attribue: form.montant_attribue ? parseFloat(form.montant_attribue) : null,
        financement: form.financement || null,
        date_marche: form.date_marche || null,
        statut: form.statut,
        observations: form.observations || null,
      }),
    onSuccess: () => {
      toast.success("Marché PPM mis à jour");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePpm,
    onSuccess: () => {
      toast.success("Marché PPM supprimé");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      numero: "",
      intitule: "",
      type_marche: "",
      mode_passation: "",
      montant_estime: "",
      montant_attribue: "",
      financement: "",
      date_marche: "",
      statut: "dao_elabore",
      observations: "",
    });
  };

  const startEdit = (item: Ppm) => {
    setEditing(item);
    setShowForm(true);
    setForm({
      numero: item.numero ?? "",
      intitule: item.intitule,
      type_marche: item.type_marche ?? "",
      mode_passation: item.mode_passation ?? "",
      montant_estime: item.montant_estime ?? "",
      montant_attribue: item.montant_attribue ?? "",
      financement: item.financement ?? "",
      date_marche: item.date_marche ?? "",
      statut: item.statut,
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
        title="Marchés PPM"
        description="Plan de passation des marchés"
        actions={
          canWrite && !showForm ? (
            <Button onClick={() => setShowForm(true)}>Nouveau marché</Button>
          ) : undefined
        }
      />

      {showForm && canWrite && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-card border border-cloud bg-paper p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold">
            {editing ? "Modifier" : "Nouveau marché PPM"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-slate">N°</label>
              <input
                value={form.numero}
                onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
                className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-slate">Intitulé</label>
              <input
                required
                value={form.intitule}
                onChange={(e) => setForm((f) => ({ ...f, intitule: e.target.value }))}
                className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Type</label>
              <input
                value={form.type_marche}
                onChange={(e) => setForm((f) => ({ ...f, type_marche: e.target.value }))}
                className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Mode passation</label>
              <input
                value={form.mode_passation}
                onChange={(e) => setForm((f) => ({ ...f, mode_passation: e.target.value }))}
                className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Statut</label>
              <select
                value={form.statut}
                onChange={(e) =>
                  setForm((f) => ({ ...f, statut: e.target.value as PpmStatut }))
                }
                className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
              >
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {PPM_STATUT_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Montant estimé</label>
              <input
                type="number"
                min="0"
                value={form.montant_estime}
                onChange={(e) => setForm((f) => ({ ...f, montant_estime: e.target.value }))}
                className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Montant attribué</label>
              <input
                type="number"
                min="0"
                value={form.montant_attribue}
                onChange={(e) => setForm((f) => ({ ...f, montant_attribue: e.target.value }))}
                className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Date marché</label>
              <input
                type="date"
                value={form.date_marche}
                onChange={(e) => setForm((f) => ({ ...f, date_marche: e.target.value }))}
                className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
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
          <thead className="bg-paper">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate">N°</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Intitulé</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Statut</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Montant estimé</th>
              <th className="px-4 py-3 text-right font-medium text-slate">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud/60">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-paper">
                <td className="px-4 py-3">{item.numero ?? "—"}</td>
                <td className="max-w-xs truncate px-4 py-3">{item.intitule}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-veil px-2 py-0.5 text-xs text-forest-ink">
                    {PPM_STATUT_LABELS[item.statut]}
                  </span>
                </td>
                <td className="px-4 py-3">{item.montant_estime ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  {canWrite && (
                    <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        className="h-8 px-3 text-xs"
                        onClick={() => startEdit(item)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-xs text-red-600"
                        onClick={() => {
                          if (window.confirm("Supprimer ?")) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
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
    </>
  );
}
