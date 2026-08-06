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

  if (taches.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border bg-white py-12 text-center">
        <p className="text-sm text-gray-400">Aucune tâche enregistrée.</p>
      </div>
    );
  }

  return (
    <div className="table-shell">
      <table className="table-grain">
        <thead>
          <tr>
            <th>Code</th>
            <th>Tâche</th>
            {canWrite && <th className="w-[1%] text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {taches.map((tache) => (
            <tr key={tache.id}>
              <td className="w-[80px]">
                <span className="inline-block rounded bg-primary-subtle px-1.5 py-0.5 text-xs font-medium text-primary">
                  {tache.code}
                </span>
              </td>
              <td>
                {editingId === tache.id ? (
                  <div className="flex gap-2">
                    <input
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      className="input-grain w-20"
                      required
                    />
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="input-grain flex-1"
                      required
                    />
                  </div>
                ) : (
                  <span className="text-gray-700">{tache.description}</span>
                )}
              </td>
              {canWrite && (
                <td className="text-right">
                  <div className="flex justify-end gap-1">
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
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => startEdit(tache)}>
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
