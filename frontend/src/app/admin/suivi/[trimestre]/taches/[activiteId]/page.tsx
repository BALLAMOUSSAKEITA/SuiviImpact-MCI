"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageBackLink, PageHeader } from "@/components/page-header";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { FileUploadField } from "@/components/file-upload-field";
import { TacheStatutBadge } from "@/components/execution-badge";
import { Button } from "@/components/ui/button";
import { finaliserTache, listTachesSuivi } from "@/lib/api";
import { DEFAULT_ANNEE, type Tache } from "@/types";

export default function SuiviTachesPage() {
  return <SuiviTachesContent />;
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
    <>
      <PageBackLink href={`/admin/suivi/${trimestre}`}>
        ← Retour suivi T{trimestre}
      </PageBackLink>
      <PageHeader
        className="mt-2"
        title={`Tâches — Activité #${activiteId} — T${trimestre}`}
      />

        <div className="table-shell">
          <table className="table-grain min-w-[560px]">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate">
                  Responsable
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate">
                  Pondération
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate">
                  Statut
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate">
                  Actions
                </th>
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
              {taches.map((t) => (
                <tr key={t.id} className="hover:bg-veil">
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
            <div className="overlay-panel w-full max-w-md p-6">
              <h2 className="text-lg font-semibold text-graphite">
                Finaliser la tâche
              </h2>
              <p className="mt-1 text-sm text-fog">{finalizing.description}</p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-slate">
                    Observation
                  </label>
                  <textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    rows={3}
                    className="input-grain w-full"
                  />
                </div>
                <FileUploadField
                  label="Pièce jointe"
                  file={fichier}
                  onFileChange={setFichier}
                  hint="Optionnel — document associé à la finalisation."
                />
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
    </>
  );
}
