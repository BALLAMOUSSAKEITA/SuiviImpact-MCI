"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ProgressBar } from "@/components/execution-badge";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { listIndicateurs, updateIndicateur } from "@/lib/api";
import type { Indicateur } from "@/types";

export default function SuiviIndicateursPage() {
  return <SuiviIndicateursContent />;
}

function SuiviIndicateursContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Indicateur | null>(null);
  const [realise, setRealise] = useState("0");

  const queryKey = ["indicateurs"];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: listIndicateurs,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateIndicateur(editing!.id, {
        realise: parseFloat(realise),
      }),
    onSuccess: () => {
      toast.success("Réalisé mis à jour");
      setEditing(null);
      setRealise("0");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startEdit = (item: Indicateur) => {
    setEditing(item);
    setRealise(item.realise);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate();
  };

  const pctRealise = (item: Indicateur) => {
    const cible = item.cible ? parseFloat(item.cible) : 0;
    const value = parseFloat(item.realise);
    if (cible <= 0) return 0;
    return Math.min(100, (value / cible) * 100);
  };

  return (
    <>
      <PageHeader
        title="Indicateurs"
        description="Suivi des indicateurs : saisie du réalisé par rapport à la cible"
      />

      {editing && canWrite && (
        <form onSubmit={handleSubmit} className="space-y-4 panel-grain">
          <h2 className="text-lg font-semibold">
            Saisir le réalisé — {editing.code}
          </h2>
          <p className="text-sm text-slate">{editing.libelle}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-slate">Cible</label>
              <input
                disabled
                value={editing.cible ?? "—"}
                className="input-grain w-full opacity-70"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate">Réalisé</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={realise}
                onChange={(e) => setRealise(e.target.value)}
                className="input-grain w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={updateMutation.isPending}>
              Enregistrer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(null);
                setRealise("0");
              }}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}

      <div className="table-shell">
        <table className="table-grain min-w-[720px]">
          <thead>
            <tr>
              <th rowSpan={2} className="px-4 py-3 text-left font-medium text-slate">
                Code
              </th>
              <th rowSpan={2} className="px-4 py-3 text-left font-medium text-slate">
                Libellé
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
              <th rowSpan={2} className="px-4 py-3 text-left font-medium text-slate">
                Progression
              </th>
              <th rowSpan={2} className="px-4 py-3 text-right font-medium text-slate">
                Actions
              </th>
            </tr>
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate">Cible</th>
              <th className="px-4 py-2 text-left font-medium text-slate">Réalisé</th>
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
                  Aucun indicateur — planifiez-les d&apos;abord dans Planification
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-veil">
                <td className="px-4 py-3 font-medium">{item.code}</td>
                <td className="max-w-xs truncate px-4 py-3">{item.libelle}</td>
                <td className="px-4 py-3">{item.direction_code ?? "—"}</td>
                <td className="px-4 py-3">{item.cible ?? "—"}</td>
                <td className="px-4 py-3">{item.realise}</td>
                <td className="min-w-[140px] px-4 py-3">
                  <ProgressBar value={pctRealise(item)} />
                </td>
                <td className="px-4 py-3 text-right">
                  {canWrite && (
                    <Button
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => startEdit(item)}
                    >
                      Saisir réalisé
                    </Button>
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
