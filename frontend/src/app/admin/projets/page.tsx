"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ExecutionBadge } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { createProjet, deleteProjet, listProjets, updateProjet } from "@/lib/api";
import type { Projet } from "@/types";

export default function ProjetsPage() {
  return (
    <ProtectedRoute>
      <ProjetsContent />
    </ProtectedRoute>
  );
}

function ProjetsContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Projet | null>(null);
  const [form, setForm] = useState({
    description: "",
    abreviation: "",
    cout: "",
    bailleur: "",
    part_etat: "",
    part_bailleur: "",
    execution_financiere: "0",
    execution_physique: "0",
    date_debut: "",
    date_fin: "",
    observations: "",
  });

  const queryKey = ["projets"];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listProjets(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const buildPayload = () => ({
    description: form.description,
    abreviation: form.abreviation || null,
    cout: form.cout ? parseFloat(form.cout) : null,
    bailleur: form.bailleur || null,
    part_etat: form.part_etat ? parseFloat(form.part_etat) : null,
    part_bailleur: form.part_bailleur ? parseFloat(form.part_bailleur) : null,
    execution_financiere: parseFloat(form.execution_financiere),
    execution_physique: parseFloat(form.execution_physique),
    date_debut: form.date_debut || null,
    date_fin: form.date_fin || null,
    observations: form.observations || null,
  });

  const createMutation = useMutation({
    mutationFn: () => createProjet(buildPayload()),
    onSuccess: () => {
      toast.success("Projet créé");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateProjet(editing!.id, buildPayload()),
    onSuccess: () => {
      toast.success("Projet mis à jour");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProjet,
    onSuccess: () => {
      toast.success("Projet supprimé");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      description: "",
      abreviation: "",
      cout: "",
      bailleur: "",
      part_etat: "",
      part_bailleur: "",
      execution_financiere: "0",
      execution_physique: "0",
      date_debut: "",
      date_fin: "",
      observations: "",
    });
  };

  const startEdit = (item: Projet) => {
    setEditing(item);
    setShowForm(true);
    setForm({
      description: item.description,
      abreviation: item.abreviation ?? "",
      cout: item.cout ?? "",
      bailleur: item.bailleur ?? "",
      part_etat: item.part_etat ?? "",
      part_bailleur: item.part_bailleur ?? "",
      execution_financiere: item.execution_financiere,
      execution_physique: item.execution_physique,
      date_debut: item.date_debut ?? "",
      date_fin: item.date_fin ?? "",
      observations: item.observations ?? "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  };

  return (
    <AdminShell>
        <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Projets</h1>
            <p className="mt-1 text-sm text-fog">
              Suivi des projets et exécution financière / physique
            </p>
          </div>
          {canWrite && !showForm && (
            <Button onClick={() => setShowForm(true)}>Nouveau projet</Button>
          )}
        </div>

        {showForm && canWrite && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[var(--radius-card)] border border-ash bg-canvas-white p-6 "
          >
            <h2 className="text-lg font-semibold">
              {editing ? "Modifier" : "Nouveau projet"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-steel">Description</label>
                <input
                  required
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-steel">Abréviation</label>
                <input
                  value={form.abreviation}
                  onChange={(e) => setForm((f) => ({ ...f, abreviation: e.target.value }))}
                  className="w-full rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-steel">Coût</label>
                <input
                  type="number"
                  min="0"
                  value={form.cout}
                  onChange={(e) => setForm((f) => ({ ...f, cout: e.target.value }))}
                  className="w-full rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-steel">Bailleur</label>
                <input
                  value={form.bailleur}
                  onChange={(e) => setForm((f) => ({ ...f, bailleur: e.target.value }))}
                  className="w-full rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-steel">Exé. financière (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.execution_financiere}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, execution_financiere: e.target.value }))
                  }
                  className="w-full rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-steel">Exé. physique (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.execution_physique}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, execution_physique: e.target.value }))
                  }
                  className="w-full rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
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

        <div className="overflow-hidden rounded-[var(--radius-card)] border border-ash bg-canvas-white ">
          <table className="min-w-full divide-y divide-cloud text-sm">
            <thead className="bg-paper-mist">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-steel">Projet</th>
                <th className="px-4 py-3 text-left font-medium text-steel">Bailleur</th>
                <th className="px-4 py-3 text-left font-medium text-steel">Financière</th>
                <th className="px-4 py-3 text-left font-medium text-steel">Physique</th>
                <th className="px-4 py-3 text-right font-medium text-steel">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ash/60">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-fog">
                    Chargement…
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-paper-mist">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.abreviation ?? item.description.slice(0, 30)}</p>
                    <p className="text-xs text-fog">{item.description}</p>
                  </td>
                  <td className="px-4 py-3">{item.bailleur ?? "—"}</td>
                  <td className="px-4 py-3">
                    <ExecutionBadge value={item.execution_financiere} />
                  </td>
                  <td className="px-4 py-3">
                    <ExecutionBadge value={item.execution_physique} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canWrite && (
                      <div className="flex justify-end gap-2">
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
      </div>
    </AdminShell>
  );
}
