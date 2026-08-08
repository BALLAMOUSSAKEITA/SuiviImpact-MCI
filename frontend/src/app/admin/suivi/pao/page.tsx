"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FileUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { FileUploadField } from "@/components/file-upload-field";
import {
  DetailDrawer,
  DetailDrawerRows,
  DetailRow,
} from "@/components/detail-drawer";
import { ExecutionBadge } from "@/components/execution-badge";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  finaliserTache,
  listPlanificationPao,
  listTachesSuivi,
} from "@/lib/api";
import type { PlanificationPaoActivite, Tache } from "@/types";
import { DEFAULT_ANNEE } from "@/types";
import { cn } from "@/lib/utils";

export default function SuiviPaoPage() {
  return <SuiviPaoContent />;
}

function SuiviPaoContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<PlanificationPaoActivite | null>(null);

  const { data: activites = [], isLoading } = useQuery({
    queryKey: ["planification-pao"],
    queryFn: listPlanificationPao,
  });

  return (
    <>
      <PageHeader
        title="Suivi — PAO"
        description="Suivi des activités planifiées et progression des tâches"
      />

      <div className="table-shell">
        <table className="table-grain min-w-[700px]">
          <thead className="bg-paper">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate">Code</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Activité</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Objectif</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Progression</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Tâches</th>
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
            {!isLoading && activites.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ash">
                  Aucune activité planifiée.
                </td>
              </tr>
            )}
            {activites.map((a) => {
              const totalTaches = a.taches.length;
              const nbTerminees = a.taches.filter(
                (t) => t.ponderation !== undefined
              ).length;
              return (
                <tr
                  key={a.id}
                  className={cn(
                    "cursor-pointer hover:bg-paper",
                    selected?.id === a.id && "bg-veil"
                  )}
                  onClick={() => setSelected(a)}
                >
                  <td className="px-4 py-3 font-medium">{a.code}</td>
                  <td className="max-w-xs truncate px-4 py-3">{a.description}</td>
                  <td className="px-4 py-3 text-sm text-slate">{a.objectif_code}</td>
                  <td className="px-4 py-3">
                    <ExecutionBadge value={Number(a.budget) > 0 ? 0 : 0} />
                  </td>
                  <td className="px-4 py-3 text-sm">{totalTaches} tâche(s)</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <SuiviPaoDrawer
          activite={selected}
          canWrite={canWrite}
          onClose={() => setSelected(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ["planification-pao"] });
          }}
        />
      )}
    </>
  );
}

function SuiviPaoDrawer({
  activite,
  canWrite,
  onClose,
  onUpdate,
}: {
  activite: PlanificationPaoActivite;
  canWrite: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const trimestre = getTrimestre(activite.date_debut);
  const queryClient = useQueryClient();
  const tachesKey = ["suivi-taches", DEFAULT_ANNEE, trimestre, activite.id];

  const { data: taches = [], isLoading: loadingTaches } = useQuery({
    queryKey: tachesKey,
    queryFn: () => listTachesSuivi(DEFAULT_ANNEE, trimestre, activite.id),
  });

  const [finalizing, setFinalizing] = useState<Tache | null>(null);
  const [observation, setObservation] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      finaliserTache(finalizing!.id, {
        observation: observation || undefined,
        fichier: fichier ?? undefined,
      }),
    onSuccess: () => {
      toast.success("Tâche finalisée — progression mise à jour");
      setFinalizing(null);
      setObservation("");
      setFichier(null);
      queryClient.invalidateQueries({ queryKey: tachesKey });
      onUpdate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DetailDrawer
      open
      title={activite.description}
      subtitle={`Code: ${activite.code}`}
      onClose={onClose}
    >
      <DetailDrawerRows>
        <DetailRow label="Objectif">{activite.objectif_description}</DetailRow>
        <DetailRow label="Direction">{activite.direction_libelle}</DetailRow>
        <DetailRow label="Période">
          {activite.date_debut} → {activite.date_fin}
        </DetailRow>
        <DetailRow label="Email responsable">{activite.email_responsable}</DetailRow>
      </DetailDrawerRows>

      <h3 className="mt-6 text-sm font-bold text-graphite">
        Tâches ({taches.length})
      </h3>

      {loadingTaches ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-ash">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </div>
      ) : taches.length === 0 ? (
        <p className="mt-4 text-sm text-ash">Aucune tâche pour cette activité.</p>
      ) : (
        <ul className="mt-3 divide-y divide-cloud/50">
          {taches.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 py-3"
            >
              {t.statut === "terminee" ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-ink text-white">
                  <Check className="h-3 w-3" />
                </span>
              ) : (
                <button
                  type="button"
                  disabled={!canWrite}
                  onClick={() => {
                    setFinalizing(t);
                    setObservation("");
                    setFichier(null);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-cloud hover:border-forest-ink disabled:cursor-not-allowed disabled:opacity-50"
                  title="Marquer terminée"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", t.statut === "terminee" && "line-through text-ash")}>
                  {t.description}
                </p>
                <p className="text-xs text-fog">{t.ponderation}%</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {finalizing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-card bg-paper p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-graphite">
              Finaliser la tâche
            </h2>
            <p className="mt-1 text-sm text-fog">{finalizing.description}</p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate">Observation</label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  rows={3}
                  className="w-full rounded-card border border-cloud px-3 py-2 text-sm"
                />
              </div>
              <FileUploadField
                label="Rapport / Pièce jointe"
                file={fichier}
                onFileChange={setFichier}
                hint="Optionnel — document justificatif de la finalisation."
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
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </DetailDrawer>
  );
}

function getTrimestre(dateStr: string): number {
  const month = new Date(dateStr).getMonth() + 1;
  return Math.ceil(month / 3);
}
