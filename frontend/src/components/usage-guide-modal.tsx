"use client";

import {
  Archive,
  BarChart3,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: `Bienvenue sur ${BRAND.appName}`,
    icon: LayoutDashboard,
    body: `${BRAND.appName} permet au ${BRAND.bureauShort} de planifier, suivre et analyser l'exécution du programme ${BRAND.program} au sein du ${BRAND.ministryShort}. Ce guide présente les grandes étapes en quelques minutes.`,
  },
  {
    title: "Navigation",
    icon: LayoutDashboard,
    body: "Le menu latéral regroupe les modules : vue d'ensemble, paramétrage, planification, suivi, statistiques, workflow, export et archive. Votre rôle détermine les entrées visibles.",
  },
  {
    title: "Paramétrage",
    icon: ClipboardList,
    body: "Configurez d'abord les objectifs, tâches, projets et directions. Ces référentiels alimentent les plans d'action et les tableaux de suivi.",
  },
  {
    title: "Planification",
    icon: CalendarDays,
    body: "Construisez les plans PAO et projet par trimestre : activités, tâches associées et calendrier d'exécution avant le suivi en cours d'année.",
  },
  {
    title: "Suivi opérationnel",
    icon: ClipboardList,
    body: "Mettez à jour l'avancement PAO, les recommandations RCC, les missions, le PPM, les projets et les indicateurs. Filtrez par statut et enregistrez les preuves (fichiers) lorsque c'est requis.",
  },
  {
    title: "Statistiques & export",
    icon: BarChart3,
    body: "Consultez les tableaux de bord par domaine et exportez les données en Excel (PAO, RCC, missions, PPM, projets) avec filtres de période.",
  },
  {
    title: "Workflow & archive",
    icon: Archive,
    body: "Le workflow gère les circuits de validation documentaire. L'archive centralise les dossiers et pièces jointes institutionnelles.",
  },
  {
    title: "Votre profil",
    icon: UserCircle,
    body: "Depuis Mon profil, mettez à jour votre identité, votre photo, votre mot de passe, et relancez ce guide à tout moment.",
  },
] as const;

interface UsageGuideModalProps {
  open: boolean;
  onClose: () => void;
  onFinished: () => void;
}

export function UsageGuideModal({ open, onClose, onFinished }: UsageGuideModalProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const finish = useCallback(() => {
    onFinished();
    onClose();
  }, [onClose, onFinished]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, skip]);

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in">
      <button
        type="button"
        aria-label="Fermer le guide"
        className="absolute inset-0 bg-obsidian/45 backdrop-blur-[2px]"
        onClick={skip}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="usage-guide-title"
        className="overlay-panel relative flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col overflow-hidden"
      >
        <div className="border-b border-cloud px-6 py-4">
          <p className="text-xs font-medium text-slate">
            Guide d&apos;utilisation · {step + 1} / {STEPS.length}
          </p>
          <div className="mt-3 flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-veil text-forest-ink">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <h2 id="usage-guide-title" className="font-display text-lg text-graphite">
              {current.title}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="text-sm leading-[1.43] text-slate">{current.body}</p>
          <div className="mt-6 flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-forest-ink" : "bg-cloud",
                )}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cloud px-6 py-4">
          <Button type="button" variant="ghost" onClick={skip}>
            Ignorer
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              Précédent
            </Button>
            {isLast ? (
              <Button type="button" onClick={finish}>
                Terminer
              </Button>
            ) : (
              <Button type="button" onClick={() => setStep((s) => s + 1)}>
                Suivant
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
