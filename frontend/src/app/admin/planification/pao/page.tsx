"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import {
  DetailDrawer,
  DetailDrawerRows,
  DetailRow,
  StoredDocumentMenu,
} from "@/components/detail-drawer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  createPlanificationPao,
  listDirections,
  listObjectifs,
  listPlanificationPao,
  listTachesPlan,
  updatePlanificationPao,
} from "@/lib/api";
import { fetchPlanificationPaoTdr } from "@/lib/stored-documents";
import type { PlanificationPaoActivite, PlanificationPaoCreate, PlanificationPaoTacheItem } from "@/types";
import { cn } from "@/lib/utils";

const PONDERATIONS = [5, 15, 25, 45, 50, 60] as const;
const MAX_TACHES = 5;

type TacheSlot = {
  key: number;
  tachePlanId: string;
  ponderation: string;
};

function emptySlot(key: number): TacheSlot {
  return { key, tachePlanId: "", ponderation: "" };
}

export default function PlanificationPaoPage() {
  return <PlanificationPaoContent />;
}

function PlanificationPaoContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["planification-pao"];

  const { data: activites = [], isLoading: loadingList } = useQuery({
    queryKey,
    queryFn: listPlanificationPao,
  });

  const { data: objectifs = [] } = useQuery({
    queryKey: ["objectifs"],
    queryFn: listObjectifs,
  });

  const { data: tachesPlan = [] } = useQuery({
    queryKey: ["taches-plan"],
    queryFn: listTachesPlan,
  });

  const { data: directions = [] } = useQuery({
    queryKey: ["directions"],
    queryFn: listDirections,
  });

  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [objectifId, setObjectifId] = useState("");
  const [budget, setBudget] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [directionId, setDirectionId] = useState("");
  const [emailResponsable, setEmailResponsable] = useState("");
  const [emailMinistre, setEmailMinistre] = useState("");
  const [tdrFile, setTdrFile] = useState<File | null>(null);
  const [slots, setSlots] = useState<TacheSlot[]>([]);
  const [slotKey, setSlotKey] = useState(0);
  const [selected, setSelected] = useState<PlanificationPaoActivite | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [existingTdrName, setExistingTdrName] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setExistingTdrName(null);
    setDescription("");
    setObjectifId("");
    setBudget("");
    setDateDebut("");
    setDateFin("");
    setDirectionId("");
    setEmailResponsable("");
    setEmailMinistre("");
    setTdrFile(null);
    setSlots([]);
  };

  const usedTacheIds = useMemo(
    () => new Set(slots.map((s) => s.tachePlanId).filter(Boolean)),
    [slots],
  );

  const createMutation = useMutation({
    mutationFn: (payload: PlanificationPaoCreate) =>
      createPlanificationPao(payload, tdrFile),
    onSuccess: (a) => {
      toast.success(`Activité planifiée — ${a.code}`);
      queryClient.invalidateQueries({ queryKey });
      resetForm();
      setShowForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: PlanificationPaoCreate;
    }) => updatePlanificationPao(id, payload, tdrFile),
    onSuccess: (a) => {
      toast.success(`Activité mise à jour — ${a.code}`);
      queryClient.invalidateQueries({ queryKey });
      resetForm();
      setShowForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const populateFormFromActivite = (a: PlanificationPaoActivite) => {
    setEditingId(a.id);
    setDescription(a.description);
    setObjectifId(String(a.objectif_id));
    setBudget(String(a.budget));
    setDateDebut(a.date_debut);
    setDateFin(a.date_fin);
    setDirectionId(String(a.direction_id));
    setEmailResponsable(a.email_responsable);
    setEmailMinistre(a.email_ministre);
    setTdrFile(null);
    setExistingTdrName(a.tdr_nom_original);
    setSlots(
      a.taches.map((t, index) => ({
        key: t.tache_plan_id * 1000 + index,
        tachePlanId: String(t.tache_plan_id),
        ponderation: String(Number(t.ponderation)),
      })),
    );
    setShowForm(true);
    setSelected(null);
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const addSlot = () => {
    if (slots.length >= MAX_TACHES) return;
    setSlotKey((k) => {
      const next = k + 1;
      setSlots((prev) => [...prev, emptySlot(next)]);
      return next;
    });
  };

  const removeSlot = (key: number) => {
    setSlots((prev) => prev.filter((s) => s.key !== key));
  };

  const updateSlot = (key: number, patch: Partial<TacheSlot>) => {
    setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectifId || !directionId) return;

    const taches: PlanificationPaoTacheItem[] = slots
      .filter((s) => s.tachePlanId && s.ponderation)
      .map((s) => ({
        tache_plan_id: Number(s.tachePlanId),
        ponderation: Number(s.ponderation),
      }));

    const payload: PlanificationPaoCreate = {
      description: description.trim(),
      objectif_id: Number(objectifId),
      budget: budget ? Number(budget) : 0,
      date_debut: dateDebut,
      date_fin: dateFin,
      direction_id: Number(directionId),
      email_responsable: emailResponsable.trim(),
      email_ministre: emailMinistre.trim(),
      taches,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Planification"
        title="PAO"
        description="Planifier une activité du plan d'action annuel : objectif, tâches pondérées, calendrier, direction et TDR."
        actions={
          canWrite && !showForm ? (
            <Button onClick={startCreate}>
              <Plus className="h-4 w-4" />
              Planifier une activité
            </Button>
          ) : undefined
        }
      />

      {showForm && canWrite && (
        <div className="panel-grain">
          <h3 className="mb-4 text-base font-semibold text-graphite">
            {editingId ? "Modifier l'activité planifiée" : "Nouvelle activité PAO"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label-grain">Libellé de l&apos;activité</label>
                <input
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-grain"
                  placeholder="Description de l'activité"
                />
              </div>

              <div>
                <label className="label-grain">Objectif lié</label>
                <select
                  required
                  value={objectifId}
                  onChange={(e) => setObjectifId(e.target.value)}
                  className="input-grain"
                >
                  <option value="">Choisir un objectif…</option>
                  {objectifs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.code} — {o.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-grain">Montant (GNF)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="input-grain"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="label-grain">Date de début</label>
                <input
                  required
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="input-grain"
                />
              </div>

              <div>
                <label className="label-grain">Date de fin</label>
                <input
                  required
                  type="date"
                  value={dateFin}
                  min={dateDebut || undefined}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="input-grain"
                />
              </div>

              <div>
                <label className="label-grain">Direction responsable</label>
                <select
                  required
                  value={directionId}
                  onChange={(e) => setDirectionId(e.target.value)}
                  className="input-grain"
                >
                  <option value="">Choisir une direction…</option>
                  {directions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.libelle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-grain">E-mail du responsable principal</label>
                <input
                  required
                  type="email"
                  value={emailResponsable}
                  onChange={(e) => setEmailResponsable(e.target.value)}
                  className="input-grain"
                  placeholder="responsable@direction.gn"
                />
              </div>

              <div>
                <label className="label-grain">E-mail du ministre</label>
                <input
                  required
                  type="email"
                  value={emailMinistre}
                  onChange={(e) => setEmailMinistre(e.target.value)}
                  className="input-grain"
                  placeholder="ministre@mci.gov.gn"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label-grain">TDR (pièce jointe)</label>
                {existingTdrName && !tdrFile && (
                  <p className="mb-2 text-xs text-ash">
                    Fichier actuel : {existingTdrName}. Choisissez un fichier pour le remplacer.
                  </p>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setTdrFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate file:mr-3 file:rounded-[var(--radius-card)] file:border-0 file:bg-forest-ink/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-forest-ink"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-graphite">
                  Tâches du plan d&apos;action (optionnel, max. {MAX_TACHES})
                </p>
                {slots.length < MAX_TACHES && (
                  <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter une tâche
                  </Button>
                )}
              </div>
              {slots.length === 0 && (
                <p className="text-sm text-ash">
                  Aucune tâche sélectionnée. Vous pouvez en ajouter jusqu&apos;à {MAX_TACHES}.
                </p>
              )}
              <div className="space-y-3">
                {slots.map((slot) => (
                  <div
                    key={slot.key}
                    className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-cloud/80 bg-white/60 p-3 sm:flex-row sm:items-end"
                  >
                    <div className="flex-1">
                      <label className="label-grain">Tâche</label>
                      <select
                        value={slot.tachePlanId}
                        onChange={(e) =>
                          updateSlot(slot.key, { tachePlanId: e.target.value })
                        }
                        className="input-grain"
                      >
                        <option value="">Choisir…</option>
                        {tachesPlan.map((t) => (
                          <option
                            key={t.id}
                            value={t.id}
                            disabled={
                              usedTacheIds.has(String(t.id)) &&
                              slot.tachePlanId !== String(t.id)
                            }
                          >
                            {t.code} — {t.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full sm:w-40">
                      <label className="label-grain">Pondération</label>
                      <select
                        value={slot.ponderation}
                        onChange={(e) =>
                          updateSlot(slot.key, { ponderation: e.target.value })
                        }
                        className="input-grain"
                      >
                        <option value="">—</option>
                        {PONDERATIONS.map((p) => (
                          <option key={p} value={p}>
                            {p} %
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-ash hover:text-red-600"
                      onClick={() => removeSlot(slot.key)}
                      aria-label="Retirer la tâche"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-cloud/60 pt-4">
              <Button type="submit" disabled={isSaving}>
                {editingId ? "Enregistrer les modifications" : "Enregistrer la planification"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="table-shell">
        <table className="table-grain">
          <thead>
            <tr>
              <th className="w-[100px]">Code</th>
              <th>Activité</th>
              <th>Objectif</th>
              <th>Direction</th>
              <th>Période</th>
              <th>Montant</th>
              <th>TDR</th>
            </tr>
          </thead>
          <tbody>
            {loadingList && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {!loadingList && activites.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ash">
                  Aucune activité planifiée pour le moment.
                </td>
              </tr>
            )}
            {activites.map((a) => (
              <tr
                key={a.id}
                tabIndex={0}
                role="button"
                onClick={() => setSelected(a)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(a);
                  }
                }}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-forest-ink/[0.04]",
                  selected?.id === a.id && "bg-forest-ink/[0.06]",
                )}
              >
                <td>
                  <span className="inline-flex rounded-full bg-forest-ink/8 px-2.5 py-0.5 text-xs font-bold text-forest-ink">
                    {a.code}
                  </span>
                </td>
                <td className="font-medium text-graphite">{a.description}</td>
                <td className="text-sm text-slate">
                  {a.objectif_code}
                  {a.taches.length > 0 && (
                    <span className="mt-0.5 block text-[11px] text-ash">
                      {a.taches.length} tâche(s) ·{" "}
                      {a.taches.map((t) => `${t.tache_plan_code} (${t.ponderation}%)`).join(", ")}
                    </span>
                  )}
                </td>
                <td className="text-sm">{a.direction_code}</td>
                <td className="whitespace-nowrap text-sm text-slate">
                  {a.date_debut} → {a.date_fin}
                </td>
                <td className="text-sm tabular-nums">{a.budget}</td>
                <td className="text-sm text-ash" onClick={(e) => e.stopPropagation()}>
                  {a.tdr_nom_original ? (
                    <StoredDocumentMenu
                      label={a.tdr_nom_original}
                      fetchForOpen={() => fetchPlanificationPaoTdr(a.id, true)}
                      fetchForDownload={() => fetchPlanificationPaoTdr(a.id, false)}
                    />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetailDrawer
        open={selected !== null}
        title={selected?.description ?? ""}
        subtitle={selected ? `Code ${selected.code}` : undefined}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <DetailDrawerRows>
            <DetailRow label="Objectif">
              {selected.objectif_code} — {selected.objectif_description}
            </DetailRow>
            <DetailRow label="Direction">
              {selected.direction_code} — {selected.direction_libelle}
            </DetailRow>
            <DetailRow label="Période">
              {selected.date_debut} → {selected.date_fin}
            </DetailRow>
            <DetailRow label="Montant">{selected.budget} GNF</DetailRow>
            <DetailRow label="Responsable principal">{selected.email_responsable}</DetailRow>
            <DetailRow label="Ministre">{selected.email_ministre}</DetailRow>
            <DetailRow label="Tâches du plan d&apos;action">
              {selected.taches.length === 0 ? (
                <span className="text-ash">Aucune tâche associée</span>
              ) : (
                <ul className="space-y-2">
                  {selected.taches.map((t) => (
                    <li
                      key={t.tache_plan_id}
                      className="rounded-[var(--radius-card)] bg-veil/80 px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{t.tache_plan_code}</span>
                      <span className="text-slate"> — {t.tache_plan_description}</span>
                      <span className="mt-0.5 block text-xs text-forest-ink">
                        Pondération {t.ponderation} %
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </DetailRow>
            <DetailRow label="TDR">
              {selected.tdr_nom_original ? (
                <StoredDocumentMenu
                  label={selected.tdr_nom_original}
                  fetchForOpen={() => fetchPlanificationPaoTdr(selected.id, true)}
                  fetchForDownload={() => fetchPlanificationPaoTdr(selected.id, false)}
                />
              ) : (
                <span className="text-ash">Non joint</span>
              )}
            </DetailRow>
            {canWrite && (
              <div className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => selected && populateFormFromActivite(selected)}
                >
                  <Pencil className="h-4 w-4" />
                  Modifier cette activité
                </Button>
              </div>
            )}
          </DetailDrawerRows>
        )}
      </DetailDrawer>
    </>
  );
}
