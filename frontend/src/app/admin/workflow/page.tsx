"use client";

import { useState } from "react";
import { Plus, Play } from "lucide-react";

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

const STEPS_TEMPLATE = ["Directeur BSD", "Directeur Général", "Ministre", "DAF"];

const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: 1,
    title: "Demande d'approbation — Budget T3",
    ref: "WF-001",
    type: "Budget",
    steps: [
      { id: "1", role: "Directeur BSD", status: "done", date: "02 juil." },
      { id: "2", role: "Directeur Général", status: "done", date: "05 juil." },
      { id: "3", role: "Ministre", status: "active" },
      { id: "4", role: "DAF", status: "waiting" },
    ],
  },
  {
    id: 2,
    title: "Note de service — Mission Conakry",
    ref: "WF-002",
    type: "Mission",
    steps: [
      { id: "1", role: "Directeur BSD", status: "done", date: "10 juil." },
      { id: "2", role: "Directeur Général", status: "active" },
      { id: "3", role: "Ministre", status: "waiting" },
      { id: "4", role: "DAF", status: "waiting" },
    ],
  },
  {
    id: 3,
    title: "Acquisition matériel informatique",
    ref: "WF-003",
    type: "Marché",
    steps: [
      { id: "1", role: "Directeur BSD", status: "done", date: "15 juin" },
      { id: "2", role: "Directeur Général", status: "done", date: "18 juin" },
      { id: "3", role: "Ministre", status: "done", date: "25 juin" },
      { id: "4", role: "DAF", status: "done", date: "01 juil." },
    ],
  },
];

function Pipeline({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center">
          {/* Dot */}
          <div className="group relative flex flex-col items-center">
            <div
              className={cn(
                "h-3 w-3 rounded-full border-2",
                step.status === "done" && "border-forest-ink bg-forest-ink",
                step.status === "active" && "border-forest-ink bg-white",
                step.status === "waiting" && "border-mist bg-white",
              )}
            />
            {/* Tooltip */}
            <div className="absolute top-5 hidden whitespace-nowrap rounded bg-graphite px-2 py-1 text-[10px] text-white group-hover:block">
              {step.role}
              {step.date && <span className="ml-1 text-ash">· {step.date}</span>}
            </div>
          </div>
          {/* Line */}
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-[2px] w-6",
                step.status === "done" ? "bg-forest-ink" : "bg-mist",
              )}
            />
          )}
        </div>
      ))}
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

  const currentRole = (wf: Workflow) => wf.steps.find((s) => s.status === "active")?.role;
  const isDone = (wf: Workflow) => wf.steps.every((s) => s.status === "done");

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
        <div className="rounded-[var(--radius-card)] border border-cloud bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <input className="input-grain" placeholder="Titre du dossier" />
              <select className="input-grain">
                <option>Approbation budgétaire</option>
                <option>Ordre de mission</option>
                <option>Marché public</option>
              </select>
            </div>
            <div className="flex flex-col justify-between">
              <div className="text-[11px] text-fog">
                {STEPS_TEMPLATE.map((s, i) => (
                  <span key={s}>
                    {s}{i < STEPS_TEMPLATE.length - 1 && " → "}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>Annuler</Button>
                <Button size="sm"><Play className="h-3.5 w-3.5" /> Démarrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des workflows */}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-cloud bg-white">
        {/* Header */}
        <div className="grid grid-cols-[1fr_140px_120px_80px] gap-4 border-b border-cloud bg-veil/50 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-fog">
          <span>Dossier</span>
          <span>Progression</span>
          <span>Statut</span>
          <span></span>
        </div>

        {/* Rows */}
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="grid grid-cols-[1fr_140px_120px_80px] items-center gap-4 border-b border-cloud/50 px-5 py-3.5 last:border-b-0 hover:bg-paper/80 transition-colors"
          >
            {/* Info */}
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-graphite">{wf.title}</p>
              <p className="text-[11px] text-ash">{wf.ref} · {wf.type}</p>
            </div>

            {/* Pipeline */}
            <Pipeline steps={wf.steps} />

            {/* Status */}
            <div>
              {isDone(wf) ? (
                <span className="text-[12px] font-medium text-forest-ink">Terminé</span>
              ) : (
                <span className="text-[12px] text-fog">{currentRole(wf)}</span>
              )}
            </div>

            {/* Action */}
            <div>
              {!isDone(wf) && (
                <button
                  type="button"
                  onClick={() => advanceStep(wf.id)}
                  className="text-[12px] font-medium text-forest-ink hover:underline"
                >
                  Valider
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-5 text-[11px] text-fog">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-forest-ink bg-forest-ink" />
          Validé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-forest-ink bg-white" />
          En cours
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-mist bg-white" />
          En attente
        </span>
      </div>
    </>
  );
}
