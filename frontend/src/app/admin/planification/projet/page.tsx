"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import {
  DetailDrawer,
  DetailDrawerRows,
  DetailRow,
} from "@/components/detail-drawer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  createPlanificationProjet,
  listDirections,
  listPlanificationProjet,
  listProjets,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  PlanificationProjetComposanteInput,
  PlanificationProjetCreate,
  PlanificationProjetPlan,
  TypeBudgetProjet,
} from "@/types";

const MAX_COMPOSANTES = 2;
const MAX_ACTIVITES = 5;

type ActiviteRow = { key: number; titre: string };

type ComposanteBlock = {
  key: number;
  libelle: string;
  activites: ActiviteRow[];
};

function emptyActivite(key: number): ActiviteRow {
  return { key, titre: "" };
}

function emptyComposante(key: number): ComposanteBlock {
  return { key, libelle: "", activites: [] };
}

export default function PlanificationProjetPage() {
  return <PlanificationProjetContent />;
}

function PlanificationProjetContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["planification-projet"];

  const { data: planifications = [], isLoading } = useQuery({
    queryKey,
    queryFn: listPlanificationProjet,
  });

  const { data: projets = [] } = useQuery({
    queryKey: ["projets"],
    queryFn: () => listProjets(),
  });

  const { data: directions = [] } = useQuery({
    queryKey: ["directions"],
    queryFn: listDirections,
  });

  const [showForm, setShowForm] = useState(false);
  const [projetId, setProjetId] = useState("");
  const [typeBudget, setTypeBudget] = useState<TypeBudgetProjet>("BND");
  const [montant, setMontant] = useState("");
  const [lieu, setLieu] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [directionId, setDirectionId] = useState("");
  const [emailResponsable, setEmailResponsable] = useState("");
  const [emailMinistre, setEmailMinistre] = useState("");
  const [composantes, setComposantes] = useState<ComposanteBlock[]>([]);
  const [keySeq, setKeySeq] = useState(0);
  const [selected, setSelected] = useState<PlanificationProjetPlan | null>(null);

  const resetForm = () => {
    setProjetId("");
    setTypeBudget("BND");
    setMontant("");
    setLieu("");
    setDateDebut("");
    setDateFin("");
    setDirectionId("");
    setEmailResponsable("");
    setEmailMinistre("");
    setComposantes([]);
  };

  const createMutation = useMutation({
    mutationFn: (payload: PlanificationProjetCreate) =>
      createPlanificationProjet(payload),
    onSuccess: (p) => {
      toast.success(`Projet planifié — ${p.projet_code}`);
      queryClient.invalidateQueries({ queryKey });
      resetForm();
      setShowForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addComposante = () => {
    if (composantes.length >= MAX_COMPOSANTES) return;
    setKeySeq((k) => {
      const next = k + 1;
      setComposantes((prev) => [...prev, emptyComposante(next)]);
      return next;
    });
  };

  const removeComposante = (key: number) => {
    setComposantes((prev) => prev.filter((c) => c.key !== key));
  };

  const updateComposante = (key: number, patch: Partial<ComposanteBlock>) => {
    setComposantes((prev) =>
      prev.map((c) => (c.key === key ? { ...c, ...patch } : c)),
    );
  };

  const addActivite = (compKey: number) => {
    setKeySeq((k) => {
      const next = k + 1;
      setComposantes((prev) =>
        prev.map((c) => {
          if (c.key !== compKey || c.activites.length >= MAX_ACTIVITES) return c;
          return {
            ...c,
            activites: [...c.activites, emptyActivite(next)],
          };
        }),
      );
      return next;
    });
  };

  const removeActivite = (compKey: number, actKey: number) => {
    setComposantes((prev) =>
      prev.map((c) =>
        c.key === compKey
          ? { ...c, activites: c.activites.filter((a) => a.key !== actKey) }
          : c,
      ),
    );
  };

  const updateActivite = (compKey: number, actKey: number, titre: string) => {
    setComposantes((prev) =>
      prev.map((c) =>
        c.key === compKey
          ? {
              ...c,
              activites: c.activites.map((a) =>
                a.key === actKey ? { ...a, titre } : a,
              ),
            }
          : c,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projetId || !directionId) return;

    const composantesPayload: PlanificationProjetComposanteInput[] = composantes.map(
      (c) => ({
        libelle: c.libelle.trim() || null,
        activites: c.activites
          .map((a) => a.titre.trim())
          .filter(Boolean)
          .map((titre) => ({ titre })),
      }),
    );

    const payload: PlanificationProjetCreate = {
      projet_id: Number(projetId),
      type_budget: typeBudget,
      composantes: composantesPayload,
      montant: montant ? Number(montant) : 0,
      lieu: lieu.trim(),
      date_debut: dateDebut,
      date_fin: dateFin,
      direction_id: Number(directionId),
      email_responsable: emailResponsable.trim(),
      email_ministre: emailMinistre.trim(),
    };

    createMutation.mutate(payload);
  };

  const budgetLabel = (b: TypeBudgetProjet) => (b === "FINEX" ? "FINEX" : "BND");

  function composanteSummary(p: PlanificationProjetPlan) {
    const nbComp = p.composantes.length;
    const nbAct = p.composantes.reduce((n, c) => n + c.activites.length, 0);
    if (nbComp === 0) return null;
    return `${nbComp} composante${nbComp > 1 ? "s" : ""} · ${nbAct} activité${nbAct > 1 ? "s" : ""}`;
  }

  return (
    <>
      <PageHeader
        eyebrow="Planification"
        title="Projet"
        description="Planifier un projet du plan d'action : budget BND ou FINEX, composantes et activités, calendrier et responsables."
        actions={
          canWrite && !showForm ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Planifier un projet
            </Button>
          ) : undefined
        }
      />

      {showForm && canWrite && (
        <div className="panel-grain">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label-grain">Projet (plan d&apos;action)</label>
                <select
                  required
                  value={projetId}
                  onChange={(e) => setProjetId(e.target.value)}
                  className="input-grain"
                >
                  <option value="">Choisir un projet…</option>
                  {projets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-grain">Type de budget</label>
                <select
                  required
                  value={typeBudget}
                  onChange={(e) => setTypeBudget(e.target.value as TypeBudgetProjet)}
                  className="input-grain"
                >
                  <option value="BND">BND</option>
                  <option value="FINEX">FINEX</option>
                </select>
              </div>

              <div>
                <label className="label-grain">Montant du projet (GNF)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="input-grain"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label-grain">Lieu du projet</label>
                <input
                  required
                  value={lieu}
                  onChange={(e) => setLieu(e.target.value)}
                  className="input-grain"
                  placeholder="Ville, région ou site d'exécution"
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
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-graphite">
                  Composantes (max. {MAX_COMPOSANTES})
                </p>
                {composantes.length < MAX_COMPOSANTES && (
                  <Button type="button" variant="outline" size="sm" onClick={addComposante}>
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter une composante
                  </Button>
                )}
              </div>

              {composantes.length === 0 && (
                <p className="text-sm text-ash">
                  Aucune composante. Vous pouvez en ajouter jusqu&apos;à {MAX_COMPOSANTES},
                  avec jusqu&apos;à {MAX_ACTIVITES} activités chacune.
                </p>
              )}

              <div className="space-y-4">
                {composantes.map((comp, compIndex) => (
                  <div
                    key={comp.key}
                    className="rounded-[var(--radius-card)] border border-cloud/80 bg-white/60 p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-forest-ink">
                        Composante {compIndex + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-ash hover:text-red-600"
                        onClick={() => removeComposante(comp.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Retirer
                      </Button>
                    </div>

                    <div className="mb-4">
                      <label className="label-grain">Intitulé de la composante (optionnel)</label>
                      <input
                        value={comp.libelle}
                        onChange={(e) =>
                          updateComposante(comp.key, { libelle: e.target.value })
                        }
                        className="input-grain"
                        placeholder="Ex. Volet formation"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-fog">
                          Activités (max. {MAX_ACTIVITES})
                        </p>
                        {comp.activites.length < MAX_ACTIVITES && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addActivite(comp.key)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Activité
                          </Button>
                        )}
                      </div>

                      {comp.activites.length === 0 && (
                        <p className="text-xs text-ash">Aucune activité dans cette composante.</p>
                      )}

                      {comp.activites.map((act, actIndex) => (
                        <div key={act.key} className="flex gap-2">
                          <div className="flex-1">
                            <label className="sr-only">
                              Activité {actIndex + 1} composante {compIndex + 1}
                            </label>
                            <input
                              required
                              value={act.titre}
                              onChange={(e) =>
                                updateActivite(comp.key, act.key, e.target.value)
                              }
                              className="input-grain"
                              placeholder={`Titre de l'activité ${actIndex + 1}`}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-ash hover:text-red-600"
                            onClick={() => removeActivite(comp.key, act.key)}
                            aria-label="Retirer l'activité"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-cloud/60 pt-4">
              <Button type="submit" disabled={createMutation.isPending}>
                Enregistrer la planification
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
        <p className="mb-3 text-xs text-ash">
          Cliquez sur une ligne pour afficher le détail de la planification.
        </p>
        <table className="table-grain">
          <thead>
            <tr>
              <th>Projet</th>
              <th className="w-[90px]">Budget</th>
              <th>Période</th>
              <th className="text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && planifications.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-ash">
                  Aucune planification projet enregistrée.
                </td>
              </tr>
            )}
            {planifications.map((p) => {
              const summary = composanteSummary(p);
              return (
              <tr
                key={p.id}
                tabIndex={0}
                role="button"
                onClick={() => setSelected(p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(p);
                  }
                }}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-forest-ink/[0.04]",
                  selected?.id === p.id && "bg-forest-ink/[0.06]",
                )}
              >
                <td>
                  <span className="font-medium text-graphite">{p.projet_description}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-ash">
                    <span className="inline-flex rounded-full bg-forest-ink/8 px-2 py-0.5 font-bold text-forest-ink">
                      {p.projet_code}
                    </span>
                    {summary && <span>{summary}</span>}
                  </span>
                </td>
                <td>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      p.type_budget === "FINEX"
                        ? "bg-sky-100 text-sky-900"
                        : "bg-amber-100 text-amber-950",
                    )}
                  >
                    {budgetLabel(p.type_budget)}
                  </span>
                </td>
                <td className="whitespace-nowrap text-sm text-slate">
                  {p.date_debut} → {p.date_fin}
                </td>
                <td className="text-right text-sm tabular-nums text-graphite">{p.montant}</td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      <DetailDrawer
        open={selected !== null}
        title={selected?.projet_description ?? ""}
        subtitle={selected ? `Réf. ${selected.projet_code}` : undefined}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <DetailDrawerRows>
            <DetailRow label="Type de budget">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  selected.type_budget === "FINEX"
                    ? "bg-sky-100 text-sky-900"
                    : "bg-amber-100 text-amber-950",
                )}
              >
                {budgetLabel(selected.type_budget)}
              </span>
            </DetailRow>
            <DetailRow label="Montant">{selected.montant} GNF</DetailRow>
            <DetailRow label="Lieu">{selected.lieu}</DetailRow>
            <DetailRow label="Période">
              {selected.date_debut} → {selected.date_fin}
            </DetailRow>
            <DetailRow label="Direction">
              {selected.direction_code} — {selected.direction_libelle}
            </DetailRow>
            <DetailRow label="Responsable principal">{selected.email_responsable}</DetailRow>
            <DetailRow label="Ministre">{selected.email_ministre}</DetailRow>
            <DetailRow label="Composantes et activités">
              {selected.composantes.length === 0 ? (
                <span className="text-ash">Aucune composante enregistrée</span>
              ) : (
                <div className="space-y-3">
                  {selected.composantes.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-[var(--radius-card)] border border-cloud/70 bg-veil/50 p-3"
                    >
                      <p className="text-sm font-semibold text-forest-ink">
                        {c.libelle?.trim() || `Composante ${c.ordre}`}
                      </p>
                      {c.activites.length === 0 ? (
                        <p className="mt-2 text-xs text-ash">Aucune activité</p>
                      ) : (
                        <ol className="mt-2 list-decimal space-y-1.5 pl-4">
                          {c.activites.map((a) => (
                            <li key={a.id} className="text-sm text-graphite">
                              {a.titre}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </DetailRow>
          </DetailDrawerRows>
        )}
      </DetailDrawer>
    </>
  );
}
