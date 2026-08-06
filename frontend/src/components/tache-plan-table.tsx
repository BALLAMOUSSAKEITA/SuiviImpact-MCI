"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const deleteMutation = useMutation({
    mutationFn: deleteTachePlan,
    onSuccess: () => {
      toast.success("Tâche supprimée");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, code, description }: { id: number; code: string; description: string }) =>
      updateTachePlan(id, { code, description }),
    onSuccess: () => {
      toast.success("Tâche mise à jour");
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startEdit = (tache: TachePlan) => {
    setEditingId(tache.id);
    setEditCode(tache.code);
    setEditDescription(tache.description);
  };

  const handleDelete = (tache: TachePlan) => {
    if (window.confirm(`Supprimer la tâche ${tache.code} ?`)) {
      deleteMutation.mutate(tache.id);
    }
  };

  return (
    <div className="table-shell">
      <table className="table-grain">
        <thead>
          <tr>
            <th>Code</th>
            <th>Tâches</th>
            {canWrite && <th className="text-right">Actions</th>}
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
              <td className="font-medium text-forest-ink">{tache.code}</td>
              <td>
                {editingId === tache.id ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      className="input-grain"
                      required
                    />
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="input-grain"
                      required
                    />
                  </div>
                ) : (
                  <span className="text-slate">{tache.description}</span>
                )}
              </td>
              {canWrite && (
                <td className="text-right">
                  <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                    {editingId === tache.id ? (
                      <>
                        <Button
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() =>
                            updateMutation.mutate({
                              id: tache.id,
                              code: editCode,
                              description: editDescription,
                            })
                          }
                        >
                          Enregistrer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => startEdit(tache)}>
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(tache)}
                        >
                          Supprimer
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
