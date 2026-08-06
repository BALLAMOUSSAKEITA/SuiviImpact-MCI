"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Play,
  User,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  label: string;
  role: string;
  status: "completed" | "current" | "pending";
  date?: string;
}

const DEMO_WORKFLOWS: { id: number; title: string; ref: string; steps: WorkflowStep[] }[] = [
  {
    id: 1,
    title: "Demande d'approbation — Budget T3",
    ref: "WF-2026-001",
    steps: [
      { id: "1", label: "Initiation", role: "Directeur BSD", status: "completed", date: "02/07/2026" },
      { id: "2", label: "Validation direction", role: "Directeur Général", status: "completed", date: "05/07/2026" },
      { id: "3", label: "Approbation ministérielle", role: "Ministre", status: "current" },
      { id: "4", label: "Traitement financier", role: "DAF", status: "pending" },
    ],
  },
  {
    id: 2,
    title: "Note de service — Mission Conakry",
    ref: "WF-2026-002",
    steps: [
      { id: "1", label: "Initiation", role: "Directeur BSD", status: "completed", date: "10/07/2026" },
      { id: "2", label: "Validation direction", role: "Directeur Général", status: "current" },
      { id: "3", label: "Approbation ministérielle", role: "Ministre", status: "pending" },
      { id: "4", label: "Traitement financier", role: "DAF", status: "pending" },
    ],
  },
];

function StepIcon({ status }: { status: WorkflowStep["status"] }) {
  if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-forest-ink" />;
  if (status === "current") return <Clock className="h-5 w-5 text-amber-500" />;
  return <Circle className="h-5 w-5 text-ash" />;
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
        description="Suivi du circuit de validation des dossiers."
        actions={
          <Button onClick={() => setShowNew(!showNew)}>
            <Play className="h-4 w-4" />
            Nouveau workflow
          </Button>
        }
      />

      {showNew && (
        <div className="animate-fade-in rounded-[var(--radius-card)] border border-cloud bg-paper p-5 shadow-[var(--shadow-card)]">
          <p className="mb-3 text-sm font-semibold text-graphite">Déclencher un workflow</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label-grain">Titre du dossier</label>
              <input className="input-grain" placeholder="Ex. Demande de financement…" />
            </div>
            <div>
              <label className="label-grain">Type</label>
              <select className="input-grain">
                <option>Approbation budgétaire</option>
                <option>Note de service</option>
                <option>Ordre de mission</option>
                <option>Marché public</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button>Démarrer</Button>
            <Button variant="ghost" onClick={() => setShowNew(false)}>Annuler</Button>
          </div>
        </div>
      )}

      {/* Liste des workflows */}
      <div className="space-y-4">
        {workflows.map((wf) => {
          const currentStep = wf.steps.find((s) => s.status === "current");
          const allDone = wf.steps.every((s) => s.status === "completed");

          return (
            <div
              key={wf.id}
              className="rounded-[var(--radius-card)] border border-cloud bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)]"
            >
              {/* En-tête */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] bg-forest-ink/10">
                    <FileText className="h-5 w-5 text-forest-ink" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-graphite">{wf.title}</p>
                    <p className="text-xs text-ash">{wf.ref}</p>
                  </div>
                </div>
                {!allDone && (
                  <Button variant="outline" size="sm" onClick={() => advanceStep(wf.id)}>
                    Valider étape
                  </Button>
                )}
                {allDone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Terminé
                  </span>
                )}
              </div>

              {/* Étapes */}
              <div className="mt-5 flex items-start gap-0 overflow-x-auto">
                {wf.steps.map((step, idx) => (
                  <div key={step.id} className="flex items-start">
                    <div className="flex flex-col items-center">
                      <StepIcon status={step.status} />
                      <div
                        className={cn(
                          "mt-2 w-28 text-center",
                        )}
                      >
                        <p className={cn(
                          "text-xs font-medium",
                          step.status === "completed" ? "text-forest-ink" :
                          step.status === "current" ? "text-amber-600" : "text-ash",
                        )}>
                          {step.label}
                        </p>
                        <div className="mt-1 flex items-center justify-center gap-1">
                          <User className="h-3 w-3 text-ash" />
                          <span className="text-[11px] text-fog">{step.role}</span>
                        </div>
                        {step.date && (
                          <p className="mt-0.5 text-[10px] text-ash">{step.date}</p>
                        )}
                      </div>
                    </div>
                    {idx < wf.steps.length - 1 && (
                      <div className="mt-2.5 px-2">
                        <ArrowRight className={cn(
                          "h-4 w-4",
                          step.status === "completed" ? "text-forest-ink" : "text-cloud",
                        )} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Indicateur */}
              {currentStep && (
                <p className="mt-4 border-t border-cloud/60 pt-3 text-xs text-fog">
                  En attente : <span className="font-medium text-graphite">{currentStep.role}</span> — {currentStep.label}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
