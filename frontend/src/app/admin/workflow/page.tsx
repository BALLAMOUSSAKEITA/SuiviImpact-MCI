"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronRight,
  FileText,
  Loader2,
  MessageSquare,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog, FormDialog } from "@/components/confirm-dialog";
import { MetricStrip } from "@/components/dashboard/kpi-metric";
import { FileUploadField } from "@/components/file-upload-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  createWorkflow,
  deleteWorkflow,
  downloadWorkflowFile,
  listWorkflows,
  performWorkflowAction,
} from "@/lib/api";
import {
  canActOnWorkflowStep,
  canCreateWorkflow,
  canDeleteWorkflow,
} from "@/lib/roles";
import { cn } from "@/lib/utils";
import {
  WORKFLOW_ROLE_LABELS,
  type ActionType,
  type StepStatus,
  type WorkflowItem,
  type WorkflowStep,
  type WorkflowStepRole,
} from "@/types";

const STEP_ROLES: WorkflowStepRole[] = [
  "directeur",
  "bsd",
  "sg",
  "ministre",
  "daf",
];

const WORKFLOW_STATUS_LABELS: Record<
  WorkflowItem["status"],
  { label: string; className: string }
> = {
  en_cours: { label: "En cours", className: "text-graphite bg-veil" },
  termine: { label: "Terminé", className: "text-forest-ink bg-mint/60" },
  rejete: { label: "Retourné", className: "text-amber-700 bg-amber-50" },
};

export default function WorkflowPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Budget");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkflowItem | null>(null);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: listWorkflows,
  });

  const summary = useMemo(() => {
    const enCours = workflows.filter((w) => w.status === "en_cours").length;
    const termines = workflows.filter((w) => w.status === "termine").length;
    const retournes = workflows.filter((w) => w.status === "rejete").length;
    return { total: workflows.length, enCours, termines, retournes };
  }, [workflows]);

  const createMutation = useMutation({
    mutationFn: () => {
      if (!newFile) throw new Error("Fichier requis");
      return createWorkflow({ title: newTitle, type: newType }, newFile);
    },
    onSuccess: (created) => {
      toast.success("Workflow déclenché");
      setShowNew(false);
      setNewTitle("");
      setNewFile(null);
      setSelectedId(created.id);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteWorkflow(id),
    onSuccess: () => {
      toast.success("Workflow supprimé");
      setDeleteTarget(null);
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mayCreate = canCreateWorkflow(user?.role);
  const mayDelete = canDeleteWorkflow(user?.role);

  return (
    <div className="mx-auto max-w-[1200px] space-y-4">
      <PageHeader
        eyebrow="Processus"
        title="Workflow"
        description="Circuit Directeur → BSD → SG → Ministre → DAF"
        actions={
          mayCreate ? (
            <Button onClick={() => setShowNew(true)}>
              <Plus className="size-4" />
              Nouveau circuit
            </Button>
          ) : undefined
        }
      />

      {!isLoading && (
        <MetricStrip
          metrics={[
            { label: "Circuits", value: summary.total },
            { label: "En cours", value: summary.enCours },
            { label: "Terminés", value: summary.termines },
            { label: "Retournés", value: summary.retournes },
          ]}
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-cloud bg-white px-6 py-14 text-center">
          <p className="text-sm text-slate">Aucun workflow enregistré.</p>
          {mayCreate && (
            <Button
              className="mt-4"
              size="sm"
              variant="outline"
              onClick={() => setShowNew(true)}
            >
              Déclencher un circuit
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-cloud bg-white">
          <ul className="divide-y divide-cloud">
            {workflows.map((wf) => (
              <li key={wf.id}>
                <WorkflowRow
                  workflow={wf}
                  expanded={selectedId === wf.id}
                  onToggle={() =>
                    setSelectedId(selectedId === wf.id ? null : wf.id)
                  }
                />
                {selectedId === wf.id && (
                  <WorkflowDetail
                    workflow={wf}
                    mayDelete={mayDelete}
                    onDelete={() => setDeleteTarget(wf)}
                    onUpdate={(updated) => {
                      queryClient.setQueryData<WorkflowItem[]>(
                        ["workflows"],
                        (prev) =>
                          prev?.map((w) => (w.id === updated.id ? updated : w)),
                      );
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormDialog
        open={showNew}
        title="Déclencher un circuit de validation"
        onClose={() => setShowNew(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="label-grain">Titre du dossier</label>
            <input
              className="input-grain mt-1"
              placeholder="Ex. Validation budget trimestriel"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label-grain">Type</label>
            <select
              className="input-grain mt-1"
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
          <FileUploadField
            label="Document initial"
            hint="Transmis au BSD pour lancement du circuit."
            file={newFile}
            onFileChange={setNewFile}
          />
          <div className="flex justify-end gap-2 border-t border-cloud pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowNew(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !newFile || !newTitle.trim()}
            >
              {createMutation.isPending ? "Envoi…" : "Démarrer"}
            </Button>
          </div>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer ce workflow ?"
        description={
          deleteTarget
            ? `Le circuit « ${deleteTarget.ref} — ${deleteTarget.title} » sera définitivement supprimé. Tous les fichiers joints à ce workflow seront perdus et ne pourront pas être récupérés.`
            : ""
        }
        confirmLabel="Supprimer définitivement"
        variant="destructive"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}

/* ─── Liste ─── */

function WorkflowRow({
  workflow,
  expanded,
  onToggle,
}: {
  workflow: WorkflowItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const status = WORKFLOW_STATUS_LABELS[workflow.status];
  const activeStep = workflow.steps.find((s) => s.status === "active");
  const doneCount = workflow.steps.filter((s) => s.status === "done").length;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "grid w-full gap-4 px-5 py-4 text-left transition-colors hover:bg-veil/50 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto_auto]",
        expanded && "bg-veil/40",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium tabular-nums text-slate">
            {workflow.ref}
          </span>
          <span
            className={cn(
              "rounded-[var(--radius-pill)] px-2 py-0.5 text-[11px] font-medium",
              status.className,
            )}
          >
            {status.label}
          </span>
          <span className="text-[11px] text-slate">{workflow.type}</span>
        </div>
        <p className="mt-1 truncate text-sm font-medium text-graphite">
          {workflow.title}
        </p>
        {activeStep && (
          <p className="mt-1 text-xs text-slate">
            En attente de {WORKFLOW_ROLE_LABELS[activeStep.role]}
          </p>
        )}
      </div>

      <div className="hidden md:flex md:items-center">
        <PipelineCompact steps={workflow.steps} />
      </div>

      <div className="hidden text-right text-xs tabular-nums text-slate md:block">
        {doneCount}/{workflow.steps.length}
      </div>

      <ChevronRight
        className={cn(
          "size-4 shrink-0 self-center text-slate transition-transform",
          expanded && "rotate-90",
        )}
      />
    </button>
  );
}

function PipelineCompact({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="flex w-full max-w-md items-center">
      {steps.map((step, i) => (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1">
            <StepDot status={step.status} />
            <span className="hidden text-[10px] text-slate xl:block">
              {WORKFLOW_ROLE_LABELS[step.role]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-0.5 h-px flex-1",
                step.status === "done" ? "bg-forest-ink" : "bg-cloud",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function StepDot({ status }: { status: StepStatus }) {
  return (
    <span
      className={cn(
        "block size-2.5 rounded-full",
        status === "done" && "bg-forest-ink",
        status === "active" && "bg-white ring-2 ring-forest-ink",
        status === "waiting" && "bg-cloud",
        status === "rejected" && "bg-amber-500",
      )}
    />
  );
}

/* ─── Détail ─── */

function WorkflowFileLink({
  actionId,
  fileName,
}: {
  actionId: number;
  fileName: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        setLoading(true);
        try {
          const blob = await downloadWorkflowFile(actionId);
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank", "noopener,noreferrer");
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (e) {
          toast.error(
            e instanceof Error ? e.message : "Impossible d'ouvrir le fichier",
          );
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-graphite hover:underline"
    >
      <FileText className="size-3" />
      {loading ? "Ouverture…" : fileName}
    </button>
  );
}

function WorkflowDetail({
  workflow,
  mayDelete,
  onDelete,
  onUpdate,
}: {
  workflow: WorkflowItem;
  mayDelete: boolean;
  onDelete: () => void;
  onUpdate: (wf: WorkflowItem) => void;
}) {
  const { user } = useAuth();
  const activeStep = workflow.steps.find((s) => s.status === "active");
  const canAct =
    activeStep != null && canActOnWorkflowStep(user?.role, activeStep.role);

  return (
    <div className="border-t border-cloud bg-veil/30 px-5 py-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate">
            {workflow.ref} · {workflow.type} · initié par {workflow.creator_prenom}
          </p>
          <p className="mt-1 text-sm text-graphite">
            Circuit de validation en {workflow.steps.length} étapes
          </p>
        </div>
        {mayDelete && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="size-3.5" />
            Supprimer
          </Button>
        )}
      </div>

      <div className="mb-5 md:hidden">
        <PipelineCompact steps={workflow.steps} />
      </div>

      <ol className="space-y-3">
        {workflow.steps.map((step) => (
          <StepTimelineCard key={step.id} step={step} />
        ))}
      </ol>

      {activeStep && (
        <WorkflowActions
          workflow={workflow}
          activeStep={activeStep}
          canAct={canAct}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

function StepTimelineCard({ step }: { step: WorkflowStep }) {
  return (
    <li
      className={cn(
        "rounded-[var(--radius-sm)] border bg-white px-4 py-3",
        step.status === "active" && "border-graphite/20",
        step.status === "rejected" && "border-amber-200",
        step.status === "waiting" && "border-cloud opacity-70",
        step.status === "done" && "border-cloud",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <StepDot status={step.status} />
          <span className="text-sm font-medium text-graphite">
            {WORKFLOW_ROLE_LABELS[step.role]}
          </span>
        </div>
        {step.validated_at && (
          <time className="text-[11px] tabular-nums text-slate">
            {new Date(step.validated_at).toLocaleDateString("fr-FR")}
          </time>
        )}
      </div>

      {step.actions.length > 0 && (
        <ul className="mt-3 space-y-2 border-t border-cloud/80 pt-3">
          {step.actions.map((action) => (
            <li key={action.id} className="flex gap-2 text-sm">
              <ActionIcon type={action.action_type} />
              <div className="min-w-0 flex-1">
                <p className="text-graphite">
                  <span className="font-medium">{action.user_prenom}</span>
                  {actionLabel(action.action_type, action.target_role)}
                </p>
                {action.comment && (
                  <p className="mt-0.5 text-xs text-slate italic">
                    « {action.comment} »
                  </p>
                )}
                {action.file_name && action.id != null && (
                  <WorkflowFileLink
                    actionId={action.id}
                    fileName={action.file_name}
                  />
                )}
                <p className="mt-0.5 text-[10px] text-slate">
                  {new Date(action.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function ActionIcon({ type }: { type: ActionType }) {
  const cls = "mt-0.5 size-3.5 shrink-0 text-slate";
  if (type === "validate") return <Check className={cn(cls, "text-forest-ink")} />;
  if (type === "reject") return <RotateCcw className={cn(cls, "text-amber-600")} />;
  if (type === "upload") return <Upload className={cls} />;
  return <MessageSquare className={cls} />;
}

function actionLabel(type: ActionType, targetRole?: WorkflowStepRole | null) {
  if (type === "validate") return " a validé";
  if (type === "comment") return " a commenté";
  if (type === "upload") return " a joint un fichier";
  if (type === "reject") {
    return ` a retourné à ${targetRole ? WORKFLOW_ROLE_LABELS[targetRole] : "—"}`;
  }
  return "";
}

function WorkflowActions({
  workflow,
  activeStep,
  canAct,
  onUpdate,
}: {
  workflow: WorkflowItem;
  activeStep: WorkflowStep;
  canAct: boolean;
  onUpdate: (wf: WorkflowItem) => void;
}) {
  const [actionMode, setActionMode] = useState<
    "validate" | "reject" | "comment" | null
  >(null);
  const [comment, setComment] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState<WorkflowStepRole>("directeur");

  const stepHasFile =
    activeStep.actions.some((a) => Boolean(a.file_name)) ?? false;

  const mutation = useMutation({
    mutationFn: () => {
      if (!actionMode) throw new Error("Action invalide");
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
      toast.success("Action enregistrée");
      setActionMode(null);
      setComment("");
      setFichier(null);
      onUpdate(updated);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!canAct) {
    return (
      <p className="mt-5 border-t border-cloud pt-4 text-sm text-slate">
        En attente de{" "}
        <span className="font-medium text-graphite">
          {WORKFLOW_ROLE_LABELS[activeStep.role]}
        </span>
        .
      </p>
    );
  }

  return (
    <div className="mt-5 border-t border-cloud pt-4">
      <p className="text-sm font-medium text-graphite">
        Votre action — {WORKFLOW_ROLE_LABELS[activeStep.role]}
      </p>

      {!actionMode ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setActionMode("validate")}>
            Valider
          </Button>
          <Button size="sm" variant="outline" onClick={() => setActionMode("comment")}>
            Commenter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActionMode("reject")}
          >
            Retourner
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-3 rounded-[var(--radius-sm)] border border-cloud bg-white p-4">
          {actionMode === "reject" && (
            <div>
              <label className="label-grain">Retourner à</label>
              <select
                className="input-grain mt-1"
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
            <label className="label-grain">
              {actionMode === "reject" ? "Motif du retour" : "Commentaire"}
              {actionMode !== "validate" && " *"}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="input-grain mt-1"
              required={actionMode !== "validate"}
            />
          </div>

          <FileUploadField
            label={
              actionMode === "validate" && !stepHasFile
                ? "Document à transmettre *"
                : "Joindre un fichier (optionnel)"
            }
            file={fichier}
            onFileChange={setFichier}
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => mutation.mutate()}
              disabled={
                mutation.isPending ||
                (actionMode === "reject" && !comment.trim()) ||
                (actionMode === "comment" && !comment.trim()) ||
                (actionMode === "validate" && !stepHasFile && !fichier)
              }
            >
              {mutation.isPending ? "Envoi…" : "Confirmer"}
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
  );
}
