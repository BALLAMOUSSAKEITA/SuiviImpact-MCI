"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ProgressBar } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  createIndicateur,
  deleteIndicateur,
  listIndicateurs,
  updateIndicateur,
} from "@/lib/api";
import type { Indicateur } from "@/types";

export default function IndicateursPage() {
  return (
    <ProtectedRoute>
      <IndicateursContent />
    </ProtectedRoute>
  );
}

function IndicateursContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Indicateur | null>(null);
  const [form, setForm] = useState({
    code: "",
    libelle: "",
    reference: "",
    cible: "",
    realise: "0",
  });

  const queryKey = ["indicateurs"];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: listIndicateurs,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: () =>
      createIndicateur({
        code: form.code,
        libelle: form.libelle,
        reference: form.reference || null,
        cible: form.cible ? parseFloat(form.cible) : null,
        realise: parseFloat(form.realise),
      }),
    onSuccess: () => {
      toast.success("Indicateur créé");
      resetForm();
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateIndicateur(editing!.id, {
        code: form.code,
        libelle: form.libelle,
        reference: form.reference || null,
        cible: form.cible ? parseFloat(form.cible) : null,
        realise: parseFloat(form.realise),
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
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ code: "", libelle: "", reference: "", cible: "", realise: "0" });
  };

  const startEdit = (item: Indicateur) => {
    setEditing(item);
    setShowForm(true);
    setForm({
      code: item.code,
      libelle: item.libelle,
      reference: item.reference ?? "",
      cible: item.cible ?? "",
      realise: item.realise,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  };

  const pctRealise = (item: Indicateur) => {
    const cible = item.cible ? parseFloat(item.cible) : 0;
    const realise = parseFloat(item.realise);
    if (cible <= 0) return 0;
    return Math.min(100, (realise / cible) * 100);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Indicateurs</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Indicateurs de performance et cibles
            </p>
          </div>
          {canWrite && !showForm && (
            <Button onClick={() => setShowForm(true)}>Nouvel indicateur</Button>
          )}
        </div>

        {showForm && canWrite && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">
              {editing ? "Modifier" : "Nouvel indicateur"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm text-zinc-600">Code</label>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-zinc-600">Libellé</label>
                <input
                  required
                  value={form.libelle}
                  onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-600">Référence</label>
                <input
                  value={form.reference}
                  onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-600">Cible</label>
                <input
                  type="number"
                  value={form.cible}
                  onChange={(e) => setForm((f) => ({ ...f, cible: e.target.value }))}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-600">Réalisé</label>
                <input
                  type="number"
                  min="0"
                  value={form.realise}
                  onChange={(e) => setForm((f) => ({ ...f, realise: e.target.value }))}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
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

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Code</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Libellé</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Cible / Réalisé</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Progression</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                    Chargement…
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{item.code}</td>
                  <td className="max-w-xs truncate px-4 py-3">{item.libelle}</td>
                  <td className="px-4 py-3">
                    {item.cible ?? "—"} / {item.realise}
                  </td>
                  <td className="min-w-[140px] px-4 py-3">
                    <ProgressBar value={pctRealise(item)} />
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
      </main>
    </div>
  );
}
