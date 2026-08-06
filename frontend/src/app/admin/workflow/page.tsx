"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  Play,
  Plus,
  User2,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  label: string;
  role: string;
  description: string;
  status: "completed" | "current" | "pending";
  date?: string;
}

interface Workflow {
  id: number;
  title: string;
  ref: string;
  type: string;
  createdAt: string;
  steps: WorkflowStep[];
}

const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: 1,
    title: "Demande d'approbation — Budget T3",
    ref: "WF-2026-001",
    type: "Approbation budgétaire",
    createdAt: "02/07/2026",
    steps: [
      { id: "1", label: "Initiation", role: "Directeur BSD", description: "Préparation et soumission du dossier", status: "completed", date: "02/07/2026" },
      { id: "2", label: "Validation", role: "Directeur Général", description: "Revue et validation hiérarchique", status: "completed", date: "05/07/2026" },
      { id: "3", label: "Approbation", role: "Ministre", description: "Signature ministérielle", status: "current" },
      { id: "4", label: "Traitement", role: "DAF", description: "Engagement financier et paiement", status: "pending" },
    ],
  },
  {
    id: 2,
    title: "Note de service — Mission Conakry",
    ref: "WF-2026-002",
    type: "Ordre de mission",
    createdAt: "10/07/2026",
    steps: [
      { id: "1", label: "Initiation", role: "Directeur BSD", description: "Préparation et soumission du dossier", status: "completed", date: "10/07/2026" },
      { id: "2", label: "Validation", role: "Directeur Général", description: "Revue et validation hiérarchique", status: "current" },
      { id: "3", label: "Approbation", role: "Ministre", description: "Signature ministérielle", status: "pending" },
      { id: "4", label: "Traitement", role: "DAF", description: "Engagement financier et paiement", status: "pending" },
    ],
  },
  {
    id: 3,
    title: "Acquisition matériel informatique",
    ref: "WF-2026-003",
    type: "Marché public",
    createdAt: "15/06/2026",
    steps: [
      { id: "1", label: "Initiation", role: "Directeur BSD", description: "Préparation et soumission du dossier", status: "completed", date: "15/06/2026" },
      { id: "2", label: "Validation", role: "Directeur Général", description: "Revue et validation hiérarchique", status: "completed", date: "18/06/2026" },
      { id: "3", label: "Approbation", role: "Ministre", description: "Signature ministérielle", status: "completed", date: "25/06/2026" },
      { id: "4", label: "Traitement", role: "DAF", description: "Engagement financier et paiement", status: "completed", date: "01/07/2026" },
    ],
  },
];

function NodeCard({ step, isLast }: { step: WorkflowStep; isLast: boolean }) {
  const statusConfig = {
    completed: {
      border: "border-emerald-200",
      bg: "bg-emerald-50/50",
      dot: "bg-emerald-500",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      text: "text-emerald-700",
      label: "Terminé",
    },
    current: {
      border: "border-amber-200",
      bg: "bg-amber-50/50",
      dot: "bg-amber-500 animate-pulse",
      icon: <Clock className="h-4 w-4 text-amber-600" />,
      text: "text-amber-700",
      label: "En cours",
    },
    pending: {
      border: "border-cloud",
      bg: "bg-paper",
      dot: "bg-ash",
      icon: <div className="h-4 w-4 rounded-full border-2 border-mist" />,
      text: "text-ash",
      label: "En attente",
    },
  };

  const config = statusConfig[step.status];

  return (
    <div className="flex items-center">
      {/* Node */}
      <div
        className={cn(
          "relative w-[180px] shrink-0 rounded-[var(--radius-card)] border-2 p-4 transition-all",
          config.border,
          config.bg,
          step.status === "current" && "shadow-md shadow-amber-100",
          step.status === "completed" && "shadow-sm",
        )}
      >
        {/* Status dot en haut à droite */}
        <div className={cn("absolute right-3 top-3 h-2.5 w-2.5 rounded-full", config.dot)} />

        {/* Icône rôle */}
        <div className={cn(
          "mb-3 flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)]",
          step.status === "completed" ? "bg-emerald-100" :
          step.status === "current" ? "bg-amber-100" : "bg-veil",
        )}>
          <User2 className={cn(
            "h-4 w-4",
            step.status === "completed" ? "text-emerald-600" :
            step.status === "current" ? "text-amber-600" : "text-ash",
          )} />
        </div>

        {/* Contenu */}
        <p className="text-[12px] font-semibold text-graphite">{step.label}</p>
        <p className="mt-0.5 text-[11px] font-medium text-forest-ink">{step.role}</p>
        <p className="mt-1.5 text-[10px] leading-relaxed text-fog">{step.description}</p>

        {/* Date ou statut */}
        <div className="mt-3 flex items-center gap-1.5">
          {config.icon}
          <span className={cn("text-[10px] font-medium", config.text)}>
            {step.date ?? config.label}
          </span>
        </div>
      </div>

      {/* Connecteur */}
      {!isLast && (
        <div className="flex w-10 items-center justify-center shrink-0">
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
            <path
              d="M0 10 H30 M26 5 L32 10 L26 15"
              stroke={step.status === "completed" ? "#10b981" : "#e5e7eb"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

function WorkflowCanvas({ workflow }: { workflow: Workflow }) {
  const completedCount = workflow.steps.filter((s) => s.status === "completed").length;
  const progress = Math.round((completedCount / workflow.steps.length) * 100);
  const allDone = completedCount === workflow.steps.length;
  const currentStep = workflow.steps.find((s) => s.status === "current");

  return (
    <div className="rounded-[var(--radius-card)] border border-cloud bg-white shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cloud/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)]",
            allDone ? "bg-emerald-100" : "bg-forest-ink/10",
          )}>
            <FileText className={cn("h-5 w-5", allDone ? "text-emerald-600" : "text-forest-ink")} />
          </div>
          <div>
            <p className="text-sm font-semibold text-graphite">{workflow.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-ash">{workflow.ref}</span>
              <span className="text-[11px] text-cloud">·</span>
              <span className="text-[11px] text-ash">{workflow.type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Barre de progression mini */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-veil">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  allDone ? "bg-emerald-500" : "bg-forest-ink",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-fog tabular-nums">{progress}%</span>
          </div>

          {allDone ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Terminé
            </span>
          ) : currentStep ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700">
              <Clock className="h-3.5 w-3.5" />
              {currentStep.role}
            </span>
          ) : null}
        </div>
      </div>

      {/* Canvas — les nodes */}
      <div className="relative overflow-x-auto bg-[repeating-linear-gradient(0deg,transparent,transparent_19px,var(--color-veil)_19px,var(--color-veil)_20px),repeating-linear-gradient(90deg,transparent,transparent_19px,var(--color-veil)_19px,var(--color-veil)_20px)]">
        <div className="flex items-center gap-0 px-6 py-8">
          {workflow.steps.map((step, idx) => (
            <NodeCard key={step.id} step={step} isLast={idx === workflow.steps.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  const [workflows, setWorkflows] = useState(DEMO_WORKFLOWS);
  const [showNew, setShowNew] = useState(false);

  const advanceStep = (wfId: number) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== wfId) return wf;
        const currentIdx = wf.steps.findIndex((s) => s.status === "current");
        if (currentIdx === -1) return wf;
        const newSteps = wf.steps.map((s, i) => {
          if (i === currentIdx) return { ...s, status: "completed" as const, date: new Date().toLocaleDateString("fr-FR") };
          if (i === currentIdx + 1) return { ...s, status: "current" as const };
          return s;
        });
        return { ...wf, steps: newSteps };
      }),
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Processus"
        title="Workflow"
        description="Circuit de validation des dossiers — visualisation en temps réel."
        actions={
          <Button onClick={() => setShowNew(!showNew)}>
            <Plus className="h-4 w-4" />
            Nouveau workflow
          </Button>
        }
      />

      {/* Formulaire nouveau workflow */}
      {showNew && (
        <div className="animate-fade-in rounded-[var(--radius-card)] border border-cloud bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="mb-4 text-sm font-semibold text-graphite">Déclencher un nouveau circuit</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="label-grain">Titre du dossier</label>
              <input className="input-grain" placeholder="Ex. Demande de financement T4…" />
            </div>
            <div>
              <label className="label-grain">Type de circuit</label>
              <select className="input-grain">
                <option>Approbation budgétaire</option>
                <option>Note de service</option>
                <option>Ordre de mission</option>
                <option>Marché public</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-ash">
              Circuit : Directeur BSD → Directeur Général → Ministre → DAF
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowNew(false)}>Annuler</Button>
              <Button>
                <Play className="h-4 w-4" />
                Démarrer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Workflows actifs */}
      <div className="space-y-5">
        {workflows.map((wf) => {
          const allDone = wf.steps.every((s) => s.status === "completed");
          return (
            <div key={wf.id}>
              <WorkflowCanvas workflow={wf} />
              {!allDone && (
                <div className="mt-2 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => advanceStep(wf.id)}>
                    Valider l&apos;étape en cours
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
