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
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { listPlanificationProjet, toggleSuiviProjetActivite } from "@/lib/api";
import type { PlanificationProjetPlan } from "@/types";
import { cn } from "@/lib/utils";

export default function SuiviProjetPage() {
  return <SuiviProjetContent />;
}

function SuiviProjetContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["planification-projet"];

  const [selected, setSelected] = useState<PlanificationProjetPlan | null>(null);

  const { data: projets = [], isLoading } = useQuery({
    queryKey,
    queryFn: listPlanificationProjet,
  });

  return (
    <>
      <PageHeader
        title="Suivi — Projet"
        description="Suivi des projets planifiés et progression des activités"
      />

      <div className="table-shell">
        <table className="table-grain min-w-[700px]">
          <thead className="bg-paper">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate">Projet</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Budget</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Période</th>
              <th className="px-4 py-3 text-left font-medium text-slate">Progression</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud/60">
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && projets.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ash">
                  Aucun projet planifié.
                </td>
              </tr>
            )}
            {projets.map((p) => {
              const totalActivites = p.composantes.reduce(
                (sum, c) => sum + c.activites.length,
                0
              );
              const terminees = p.composantes.reduce(
                (sum, c) => sum + c.activites.filter((a) => a.terminee).length,
                0
              );
              const pct =
                totalActivites > 0
                  ? Math.round((terminees / totalActivites) * 100)
                  : 0;

              return (
                <tr
                  key={p.id}
                  className={cn(
                    "cursor-pointer hover:bg-paper",
                    selected?.id === p.id && "bg-veil"
                  )}
                  onClick={() => setSelected(p)}
                >
                  <td className="px-4 py-3 font-medium">
                    {p.projet_description}
                  </td>
                  <td className="px-4 py-3 text-sm">{p.type_budget}</td>
                  <td className="px-4 py-3 text-sm text-slate">
                    {p.date_debut} → {p.date_fin}
                  </td>
                  <td className="px-4 py-3">
                    <ProgressBar pct={pct} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <SuiviProjetDrawer
          projet={selected}
          canWrite={canWrite}
          onClose={() => setSelected(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey });
          }}
        />
      )}
    </>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 rounded-full bg-cloud">
        <div
          className="h-full rounded-full bg-forest-ink transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate">{pct}%</span>
    </div>
  );
}

function SuiviProjetDrawer({
  projet,
  canWrite,
  onClose,
  onUpdate,
}: {
  projet: PlanificationProjetPlan;
  canWrite: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState<number | null>(null);
  const [rapportFile, setRapportFile] = useState<File | null>(null);
  const [showRapportFor, setShowRapportFor] = useState<number | null>(null);

  const toggleMutation = useMutation({
    mutationFn: (activiteId: number) =>
      toggleSuiviProjetActivite(activiteId, rapportFile),
    onSuccess: () => {
      toast.success("Activité mise à jour");
      setToggling(null);
      setRapportFile(null);
      setShowRapportFor(null);
      queryClient.invalidateQueries({ queryKey: ["planification-projet"] });
      onUpdate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalActivites = projet.composantes.reduce(
    (sum, c) => sum + c.activites.length,
    0
  );
  const terminees = projet.composantes.reduce(
    (sum, c) => sum + c.activites.filter((a) => a.terminee).length,
    0
  );
  const pct =
    totalActivites > 0 ? Math.round((terminees / totalActivites) * 100) : 0;

  return (
    <DetailDrawer
      open
      title={projet.projet_description}
      subtitle={`${projet.type_budget} • ${projet.lieu}`}
      onClose={onClose}
    >
      <DetailDrawerRows>
        <DetailRow label="Direction">{projet.direction_libelle}</DetailRow>
        <DetailRow label="Montant">
          {Number(projet.montant).toLocaleString("fr-FR")} FCFA
        </DetailRow>
        <DetailRow label="Période">
          {projet.date_debut} → {projet.date_fin}
        </DetailRow>
        <DetailRow label="Progression globale">
          <ProgressBar pct={pct} />
        </DetailRow>
      </DetailDrawerRows>

      <div className="mt-6 space-y-5">
        {projet.composantes.map((comp) => (
          <div key={comp.id}>
            <h4 className="text-xs font-bold uppercase tracking-wide text-fog">
              {comp.libelle || `Composante ${comp.ordre}`}
            </h4>
            <ul className="mt-2 divide-y divide-cloud/50">
              {comp.activites.map((act) => (
                <li key={act.id} className="flex items-center gap-3 py-3">
                  {act.terminee ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-ink text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!canWrite || toggleMutation.isPending}
                      onClick={() => {
                        setShowRapportFor(act.id);
                      }}
                      className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-cloud hover:border-forest-ink disabled:cursor-not-allowed disabled:opacity-50"
                      title="Marquer terminée"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm",
                        act.terminee && "line-through text-ash"
                      )}
                    >
                      {act.titre}
                    </p>
                    {act.rapport_nom_original && (
                      <p className="text-xs text-fog mt-0.5">
                        📎 {act.rapport_nom_original}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {showRapportFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-card bg-paper p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-graphite">
              Marquer l&apos;activité terminée
            </h2>
            <p className="mt-1 text-sm text-fog">
              Vous pouvez joindre un rapport (optionnel).
            </p>
            <div className="mt-4">
              <FileUploadField
                label="Rapport / Pièce jointe"
                file={rapportFile}
                onFileChange={setRapportFile}
                hint="Optionnel — rapport de clôture de l'activité."
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRapportFor(null);
                  setRapportFile(null);
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={() => toggleMutation.mutate(showRapportFor)}
                disabled={toggleMutation.isPending}
              >
                {toggleMutation.isPending ? (
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
