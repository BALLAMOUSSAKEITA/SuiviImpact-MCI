"use client";

import { useState } from "react";
import { Check, Loader2, Minus, Plus, Play } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  role: string;
  status: "done" | "active" | "waiting";
  date?: string;
}

interface Workflow {
  id: number;
  title: string;
  ref: string;
  type: string;
  steps: WorkflowStep[];
}

const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: 1,
    title: "Demande d'approbation — Budget T3",
    ref: "WF-001",
    type: "Budget",
    steps: [
      { id: "1", role: "Directeur", status: "done", date: "02 juil." },
      { id: "2", role: "BSD", status: "done", date: "04 juil." },
      { id: "3", role: "SG", status: "done", date: "05 juil." },
      { id: "4", role: "Ministre", status: "active" },
      { id: "5", role: "DAF", status: "waiting" },
    ],
  },
  {
    id: 2,
    title: "Note de service — Mission Conakry",
    ref: "WF-002",
    type: "Mission",
    steps: [
      { id: "1", role: "Directeur", status: "done", date: "10 juil." },
      { id: "2", role: "BSD", status: "done", date: "12 juil." },
      { id: "3", role: "SG", status: "active" },
      { id: "4", role: "Ministre", status: "waiting" },
      { id: "5", role: "DAF", status: "waiting" },
    ],
  },
  {
    id: 3,
    title: "Acquisition matériel informatique",
    ref: "WF-003",
    type: "Marché",
    steps: [
      { id: "1", role: "Directeur", status: "done", date: "15 juin" },
      { id: "2", role: "BSD", status: "done", date: "17 juin" },
      { id: "3", role: "SG", status: "done", date: "20 juin" },
      { id: "4", role: "Ministre", status: "done", date: "25 juin" },
      { id: "5", role: "DAF", status: "done", date: "01 juil." },
    ],
  },
];

function StepNode({ step }: { step: WorkflowStep }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Node circle */}
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all",
          step.status === "done" && "border-forest-ink bg-forest-ink text-white",
          step.status === "active" && "border-forest-ink bg-white text-forest-ink shadow-[0_0_0_4px_rgba(0,153,89,0.1)]",
          step.status === "waiting" && "border-mist bg-white text-mist",
        )}
      >
        {step.status === "done" && <Check className="h-5 w-5" strokeWidth={2.5} />}
        {step.status === "active" && <Loader2 className="h-5 w-5 animate-[spin_3s_linear_infinite]" />}
        {step.status === "waiting" && <Minus className="h-4 w-4" />}
      </div>

      {/* Label */}
      <div className="w-24 text-center">
        <p className={cn(
          "text-[12px] font-medium leading-tight",
          step.status === "done" && "text-forest-ink",
          step.status === "active" && "text-graphite",
          step.status === "waiting" && "text-ash",
        )}>
          {step.role}
        </p>
        {step.date && (
          <p className="mt-0.5 text-[10px] text-ash">{step.date}</p>
        )}
      </div>
    </div>
  );
}

function Connector({ done }: { done: boolean }) {
  return (
    <div className="flex items-center self-start mt-[22px]">
      <div className={cn("h-[2px] w-12 sm:w-16", done ? "bg-forest-ink" : "bg-mist")} />
    </div>
  );
}

function WorkflowCard({
  workflow,
  onAdvance,
}: {
  workflow: Workflow;
  onAdvance: () => void;
}) {
  const allDone = workflow.steps.every((s) => s.status === "done");
  const activeStep = workflow.steps.find((s) => s.status === "active");
  const doneCount = workflow.steps.filter((s) => s.status === "done").length;

  return (
    <div className="rounded-[var(--radius-card)] border border-cloud bg-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 border-b border-cloud/60 px-5 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded bg-forest-ink/10 px-1.5 py-0.5 text-[10px] font-semibold text-forest-ink">
              {workflow.ref}
            </span>
            <span className="shrink-0 rounded bg-veil px-1.5 py-0.5 text-[10px] font-medium text-fog">
              {workflow.type}
            </span>
          </div>
          <p className="mt-1 truncate text-[13px] font-medium text-graphite">{workflow.title}</p>
        </div>
        <div className="flex items-center gap-3">
          {allDone ? (
            <span className="text-[12px] font-medium text-forest-ink">Terminé ✓</span>
          ) : (
            <>
              <span className="hidden text-[11px] text-fog sm:block">
                {doneCount}/{workflow.steps.length}
              </span>
              <Button variant="outline" size="sm" onClick={onAdvance}>
                Valider
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="overflow-x-auto px-6 py-6 sm:px-8 sm:py-8"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-mist) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
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

      {/* Footer */}
      {activeStep && (
        <div className="border-t border-cloud/60 px-5 py-2.5 bg-paper">
          <p className="text-[11px] text-fog">
            En attente de validation par <span className="font-medium text-graphite">{activeStep.role}</span>
          </p>
        </div>
      )}
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
        const idx = wf.steps.findIndex((s) => s.status === "active");
        if (idx === -1) return wf;
        const newSteps = wf.steps.map((s, i) => {
          if (i === idx) return { ...s, status: "done" as const, date: "auj." };
          if (i === idx + 1) return { ...s, status: "active" as const };
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
        description="Circuit de validation des dossiers."
        actions={
          <Button onClick={() => setShowNew(!showNew)}>
            <Plus className="h-4 w-4" />
            Nouveau
          </Button>
        }
      />

      {showNew && (
        <div className="rounded-[var(--radius-card)] border border-cloud bg-white p-5 animate-fade-in">
          <p className="mb-3 text-[13px] font-medium text-graphite">Déclencher un circuit</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <input className="input-grain" placeholder="Titre du dossier" />
            <select className="input-grain">
              <option>Budget</option>
              <option>Mission</option>
              <option>Marché</option>
            </select>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-ash">
              Directeur → BSD → SG → Ministre → DAF
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>Annuler</Button>
              <Button size="sm"><Play className="h-3.5 w-3.5" /> Démarrer</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {workflows.map((wf) => (
          <WorkflowCard key={wf.id} workflow={wf} onAdvance={() => advanceStep(wf.id)} />
        ))}
      </div>
    </>
  );
}
