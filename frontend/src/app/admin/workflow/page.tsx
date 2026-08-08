"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  FileText,
  Loader2,
  MessageSquare,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { FileUploadField } from "@/components/file-upload-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  createWorkflow,
  downloadWorkflowFile,
  listWorkflows,
  performWorkflowAction,
} from "@/lib/api";
import { canActOnWorkflowStep, canCreateWorkflow } from "@/lib/roles";
import { cn } from "@/lib/utils";
import {
  WORKFLOW_ROLE_LABELS,
  type ActionType,
  type StepStatus,
  type WorkflowItem,
  type WorkflowStep,
  type WorkflowStepRole,
} from "@/types";

const STEP_ROLES: WorkflowStepRole[] = ["directeur", "bsd", "sg", "ministre", "daf"];

export default function WorkflowPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Budget");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<WorkflowItem | null>(null);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: listWorkflows,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!newFile) throw new Error("Fichier requis");
      return createWorkflow({ title: newTitle, type: newType }, newFile);
    },
    onSuccess: () => {
      toast.success("Workflow déclenché — fichier transmis au circuit");
      setShowNew(false);
      setNewTitle("");
      setNewFile(null);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mayCreate = canCreateWorkflow(user?.role);

  return (
    <>
      <PageHeader
        eyebrow="Processus"
        title="Workflow"
        description="Circuit de validation des dossiers — Directeur → BSD → SG → Ministre → DAF"
        actions={
          mayCreate ? (
            <Button onClick={() => setShowNew(!showNew)}>
              <Plus className="h-4 w-4" />
              Déclencher un workflow
            </Button>
          ) : undefined
        }
      />

      {showNew && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="rounded-[var(--radius-card)] border border-cloud bg-white p-5 animate-fade-in"
        >
          <p className="mb-3 text-[13px] font-medium text-graphite">
            Déclencher un circuit de validation
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <input
              className="input-grain"
              placeholder="Titre du dossier"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <select
              className="input-grain"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            >
              <option>Budget</option>
              <option>Mission</option>
              <option>Marché</option>
              <option>Rapport</option>
              <option>Note de service</option>
            </select>
          </div>
          <div className="mt-3 grid gap-3">
            <FileUploadField
              label="Document initial (obligatoire)"
              hint="Ce fichier sera visible par tous les valideurs (BSD, SG, ministre, DAF)."
              file={newFile}
              onFileChange={setNewFile}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-ash">
              Directeur → BSD → SG → Ministre → DAF
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowNew(false)}
              >
                Annuler
              </Button>
              <Button type="submit" size="sm" disabled={createMutation.isPending || !newFile}>
                <Play className="h-3.5 w-3.5" /> Démarrer
              </Button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-ash">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-cloud bg-white p-8 text-center text-ash">
          Aucun workflow en cours.
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((wf) => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              isSelected={selected?.id === wf.id}
              onSelect={() => setSelected(selected?.id === wf.id ? null : wf)}
            />
          ))}
        </div>
      )}

      {selected && (
        <WorkflowDetailPanel
          workflow={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            setSelected(updated);
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
          }}
        />
      )}
    </>
  );
}

/* ─── Workflow Card ─── */

function StepNode({ step }: { step: WorkflowStep }) {
  const statusStyles: Record<StepStatus, string> = {
    done: "border-forest-ink bg-forest-ink text-white",
    active: "border-forest-ink bg-white text-forest-ink shadow-[0_0_0_4px_rgba(0,153,89,0.08)]",
    waiting: "border-mist bg-white text-mist",
    rejected: "border-amber-500 bg-amber-50 text-amber-600 shadow-[0_0_0_4px_rgba(245,158,11,0.08)]",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
          statusStyles[step.status],
        )}
      >
        {step.status === "done" && <Check className="h-4 w-4" strokeWidth={2.5} />}
        {step.status === "active" && (
          <Loader2 className="h-4 w-4 animate-[spin_3s_linear_infinite]" />
        )}
        {step.status === "waiting" && <Minus className="h-3.5 w-3.5" />}
        {step.status === "rejected" && <RotateCcw className="h-3.5 w-3.5" />}
      </div>
      <div className="w-20 text-center">
        <p
          className={cn(
            "text-[11px] font-semibold leading-tight",
            step.status === "done" && "text-forest-ink",
            step.status === "active" && "text-graphite",
            step.status === "waiting" && "text-ash",
            step.status === "rejected" && "text-amber-600",
          )}
        >
          {WORKFLOW_ROLE_LABELS[step.role]}
        </p>
      </div>
    </div>
  );
}

function Connector({ done }: { done: boolean }) {
  return (
    <div className="flex items-center self-start mt-[20px]">
      <div
        className={cn("h-[2px] w-10 sm:w-14", done ? "bg-forest-ink" : "bg-mist")}
      />
    </div>
  );
}

function WorkflowCard({
  workflow,
  isSelected,
  onSelect,
}: {
  workflow: WorkflowItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const allDone = workflow.steps.every((s) => s.status === "done");
  const activeStep = workflow.steps.find((s) => s.status === "active");
  const rejectedStep = workflow.steps.find((s) => s.status === "rejected");
  const doneCount = workflow.steps.filter((s) => s.status === "done").length;

  return (
    <div
      className={cn(
        "cursor-pointer rounded-[var(--radius-card)] border bg-white overflow-hidden transition-all",
        isSelected ? "border-forest-ink/30 shadow-[var(--shadow-elevated)]" : "border-cloud hover:border-mist hover:shadow-[var(--shadow-card)]",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-4 border-b border-cloud/60 px-5 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded-[var(--radius-pill)] bg-forest-ink/10 px-2 py-0.5 text-[10px] font-semibold text-forest-ink">
              {workflow.ref}
            </span>
            <span className="shrink-0 rounded-[var(--radius-pill)] bg-veil px-2 py-0.5 text-[10px] font-medium text-fog">
              {workflow.type}
            </span>
            {workflow.status === "rejete" && (
              <span className="shrink-0 rounded-[var(--radius-pill)] bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                Retourné
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-[13px] font-medium text-graphite">
            {workflow.title}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {allDone ? (
            <span className="text-[12px] font-medium text-forest-ink">
              Terminé ✓
            </span>
          ) : (
            <span className="text-[11px] text-fog">
              {doneCount}/{workflow.steps.length}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-ash transition-transform",
              isSelected && "rotate-180",
            )}
          />
        </div>
      </div>

      <div className="overflow-x-auto px-5 py-5 sm:px-8">
        <div className="flex items-start justify-center">
          {workflow.steps.map((step, i) => (
            <div key={step.id} className="flex items-start">
              <StepNode step={step} />
              {i < workflow.steps.length - 1 && (
                <Connector done={step.status === "done"} />
              )}
            </div>
          ))}
        </div>
      </div>

      {(activeStep || rejectedStep) && (
        <div className="border-t border-cloud/60 px-5 py-2.5 bg-paper">
          {rejectedStep ? (
            <p className="text-[11px] text-amber-600">
              <AlertTriangle className="mr-1 inline h-3 w-3" />
              Document retourné à{" "}
              <span className="font-medium">
                {WORKFLOW_ROLE_LABELS[rejectedStep.role]}
              </span>
            </p>
          ) : activeStep ? (
            <p className="text-[11px] text-fog">
              En attente de validation par{" "}
              <span className="font-medium text-graphite">
                {WORKFLOW_ROLE_LABELS[activeStep.role]}
              </span>
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ─── Detail Panel ─── */

function WorkflowFileButton({ actionId, fileName }: { actionId: number; fileName: string }) {
  const [loading, setLoading] = useState(false);

  const openFile = async () => {
    setLoading(true);
    try {
      const blob = await downloadWorkflowFile(actionId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'ouvrir le fichier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void openFile()}
      disabled={loading}
      className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-forest-ink hover:underline"
    >
      <FileText className="h-3 w-3" />
      {loading ? "Ouverture…" : fileName}
    </button>
  );
}

function WorkflowDetailPanel({
  workflow,
  onClose,
  onUpdate,
}: {
  workflow: WorkflowItem;
  onClose: () => void;
  onUpdate: (wf: WorkflowItem) => void;
}) {
  const { user } = useAuth();
  const activeStep = workflow.steps.find((s) => s.status === "active");
  const canAct =
    activeStep != null && canActOnWorkflowStep(user?.role, activeStep.role);
  const stepHasFile = activeStep?.actions.some((a) => Boolean(a.file_name)) ?? false;

  const [actionMode, setActionMode] = useState<"validate" | "reject" | "comment" | null>(null);
  const [comment, setComment] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState<WorkflowStepRole>("directeur");

  const mutation = useMutation({
    mutationFn: () => {
      if (!activeStep || !actionMode) throw new Error("Action invalide");
      return performWorkflowAction(
        workflow.id,
        activeStep.id,
        {
          action_type: actionMode,
          comment: comment || undefined,
          target_role: actionMode === "reject" ? targetRole : undefined,
        },
        fichier,
      );
    },
    onSuccess: (updated) => {
      const messages: Record<string, string> = {
        validate: "Document validé — étape suivante activée",
        reject: "Document retourné avec commentaire",
        comment: "Commentaire ajouté",
      };
      toast.success(messages[actionMode!] || "Action effectuée");
      setActionMode(null);
      setComment("");
      setFichier(null);
      onUpdate(updated);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-6 rounded-[var(--radius-card)] border border-cloud bg-white p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-lg text-graphite">{workflow.title}</h3>
          <p className="text-sm text-fog">
            {workflow.ref} · {workflow.type} · par {workflow.creator_prenom}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </div>

      {/* Timeline des étapes */}
      <div className="space-y-4">
        {workflow.steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "rounded-[var(--radius-sm)] border p-4",
              step.status === "active" && "border-forest-ink/20 bg-mint",
              step.status === "done" && "border-cloud bg-paper",
              step.status === "waiting" && "border-cloud/60 bg-white opacity-60",
              step.status === "rejected" && "border-amber-200 bg-amber-50/50",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                    step.status === "done" && "bg-forest-ink text-white",
                    step.status === "active" && "bg-forest-ink/10 text-forest-ink",
                    step.status === "waiting" && "bg-mist/50 text-ash",
                    step.status === "rejected" && "bg-amber-100 text-amber-600",
                  )}
                >
                  {step.ordre}
                </span>
                <span className="text-sm font-semibold text-graphite">
                  {WORKFLOW_ROLE_LABELS[step.role]}
                </span>
              </div>
              {step.validated_at && (
                <span className="text-[10px] text-ash">
                  {new Date(step.validated_at).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>

            {/* Actions historique */}
            {step.actions.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-cloud/60 pt-3">
                {step.actions.map((action) => (
                  <div key={action.id} className="flex items-start gap-2">
                    {action.action_type === "validate" && (
                      <Check className="mt-0.5 h-3.5 w-3.5 text-forest-ink" />
                    )}
                    {action.action_type === "reject" && (
                      <RotateCcw className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
                    )}
                    {action.action_type === "comment" && (
                      <MessageSquare className="mt-0.5 h-3.5 w-3.5 text-slate" />
                    )}
                    {action.action_type === "upload" && (
                      <Upload className="mt-0.5 h-3.5 w-3.5 text-ice-blue" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-graphite">
                        <span className="font-medium">{action.user_prenom}</span>
                        {action.action_type === "validate" && " a validé"}
                        {action.action_type === "reject" && (
                          <>
                            {" "}a retourné à{" "}
                            <span className="font-medium text-amber-600">
                              {action.target_role
                                ? WORKFLOW_ROLE_LABELS[action.target_role]
                                : "—"}
                            </span>
                          </>
                        )}
                        {action.action_type === "comment" && " a commenté"}
                        {action.action_type === "upload" && " a joint un fichier"}
                      </p>
                      {action.comment && (
                        <p className="mt-0.5 text-[12px] text-fog italic">
                          « {action.comment} »
                        </p>
                      )}
                      {action.file_name && action.id && (
                        <WorkflowFileButton actionId={action.id} fileName={action.file_name} />
                      )}
                      <p className="text-[10px] text-ash">
                        {new Date(action.created_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions pour l'étape active */}
      {activeStep && !canAct && (
        <p className="mt-6 border-t border-cloud pt-5 text-sm text-slate">
          En attente de{" "}
          <span className="font-medium text-graphite">
            {WORKFLOW_ROLE_LABELS[activeStep.role]}
          </span>
          . Vous pouvez consulter l&apos;historique et les fichiers, sans valider cette étape.
        </p>
      )}

      {activeStep && canAct && (
        <div className="mt-6 border-t border-cloud pt-5">
          <p className="text-sm font-medium text-graphite mb-3">
            Actions — {WORKFLOW_ROLE_LABELS[activeStep.role]}
          </p>

          {!actionMode && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => setActionMode("validate")}
              >
                <Check className="h-3.5 w-3.5" /> Valider
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActionMode("comment")}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Commenter
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-600 hover:bg-amber-50"
                onClick={() => setActionMode("reject")}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retourner
              </Button>
            </div>
          )}

          {actionMode && (
            <div className="mt-3 space-y-3 rounded-[var(--radius-sm)] border border-cloud bg-paper p-4">
              {actionMode === "reject" && (
                <div>
                  <label className="mb-1 block text-sm text-slate">
                    Retourner à
                  </label>
                  <select
                    className="input-grain"
                    value={targetRole}
                    onChange={(e) =>
                      setTargetRole(e.target.value as WorkflowStepRole)
                    }
                  >
                    {STEP_ROLES.filter(
                      (r) =>
                        STEP_ROLES.indexOf(r) <
                        STEP_ROLES.indexOf(activeStep.role),
                    ).map((r) => (
                      <option key={r} value={r}>
                        {WORKFLOW_ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm text-slate">
                  {actionMode === "validate"
                    ? "Commentaire (optionnel)"
                    : "Commentaire"}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="input-grain"
                  placeholder={
                    actionMode === "reject"
                      ? "Expliquez la raison du retour..."
                      : "Votre remarque..."
                  }
                />
              </div>

              <FileUploadField
                label={
                  actionMode === "validate"
                    ? stepHasFile
                      ? "Joindre une nouvelle version (optionnel)"
                      : "Document à transmettre (obligatoire)"
                    : "Joindre un fichier (optionnel)"
                }
                file={fichier}
                onFileChange={setFichier}
              />

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => mutation.mutate()}
                  disabled={
                    mutation.isPending ||
                    (actionMode === "reject" && !comment) ||
                    (actionMode === "comment" && !comment) ||
                    (actionMode === "validate" && !stepHasFile && !fichier)
                  }
                >
                  {mutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Confirmer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setActionMode(null);
                    setComment("");
                    setFichier(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
