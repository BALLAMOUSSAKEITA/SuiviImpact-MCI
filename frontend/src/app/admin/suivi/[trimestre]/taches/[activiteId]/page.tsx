"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { TacheStatutBadge } from "@/components/execution-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { finaliserTache, listTachesSuivi } from "@/lib/api";
import { DEFAULT_ANNEE, type Tache } from "@/types";

export default function SuiviTachesPage() {
  return (
    <ProtectedRoute>
      <SuiviTachesContent />
    </ProtectedRoute>
  );
}

function SuiviTachesContent() {
  const params = useParams();
  const trimestre = Number(params.trimestre);
  const activiteId = Number(params.activiteId);
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["suivi-taches", DEFAULT_ANNEE, trimestre, activiteId];

  const [finalizing, setFinalizing] = useState<Tache | null>(null);
  const [observation, setObservation] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);

  const { data: taches = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listTachesSuivi(DEFAULT_ANNEE, trimestre, activiteId),
  });

  const finaliserMutation = useMutation({
    mutationFn: () =>
      finaliserTache(finalizing!.id, {
        observation: observation || undefined,
        fichier: fichier ?? undefined,
      }),
    onSuccess: () => {
      toast.success("Tâche finalisée");
      setFinalizing(null);
      setObservation("");
      setFichier(null);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({
        queryKey: ["suivi", DEFAULT_ANNEE, trimestre],
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 space-y-6 p-8">
        <div>
          <Link
            href={`/admin/suivi/${trimestre}`}
            className="text-sm text-emerald-700 hover:underline"
          >
            ← Retour suivi T{trimestre}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            Tâches — Activité #{activiteId} — T{trimestre}
          </h1>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Responsable
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Pondération
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">
                  Statut
                </th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600">
                  Actions
                </th>
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
              {taches.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">{t.description}</td>
                  <td className="px-4 py-3">{t.responsable}</td>
                  <td className="px-4 py-3">{t.ponderation} %</td>
                  <td className="px-4 py-3">
                    <TacheStatutBadge statut={t.statut} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canWrite && t.statut !== "terminee" && (
                      <Button
                        variant="outline"
                        className="h-8 px-3 text-xs"
                        onClick={() => {
                          setFinalizing(t);
                          setObservation(t.observation ?? "");
                        }}
                      >
                        Finaliser
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {finalizing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-zinc-900">
                Finaliser la tâche
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{finalizing.description}</p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-zinc-600">
                    Observation
                  </label>
                  <textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-600">
                    Pièce jointe
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
                    className="w-full text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFinalizing(null);
                    setObservation("");
                    setFichier(null);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => finaliserMutation.mutate()}
                  disabled={finaliserMutation.isPending}
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
