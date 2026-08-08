"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  dispatchUsageGuideActive,
  dispatchUsageGuidePrepareStep,
} from "@/lib/onboarding";
import {
  getUsageGuideSteps,
  queryTourTarget,
  type UsageGuideContext,
  type UsageGuideStep,
} from "@/lib/usage-guide-steps";

const PAD = 8;
const TOOLTIP_GAP = 12;

interface UsageGuideModalProps {
  open: boolean;
  guideContext: UsageGuideContext;
  onClose: () => void;
  onFinished: () => void;
}

type Rect = { top: number; left: number; width: number; height: number };

function measureTarget(step: UsageGuideStep | undefined): Rect | null {
  if (!step) return null;
  const el = queryTourTarget(step.target);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

function tooltipStyle(
  rect: Rect | null,
  cardW: number,
  cardH: number,
): CSSProperties {
  if (!rect) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "min(24rem, calc(100vw - 2rem))",
    };
  }

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const spaceRight = vw - (rect.left + rect.width);
  const spaceBelow = vh - (rect.top + rect.height);

  let top: number;
  let left: number;

  if (spaceRight >= cardW + TOOLTIP_GAP + 16) {
    left = rect.left + rect.width + TOOLTIP_GAP;
    top = Math.min(Math.max(16, rect.top), vh - cardH - 16);
  } else if (spaceBelow >= cardH + TOOLTIP_GAP + 16) {
    left = Math.min(Math.max(16, rect.left), vw - cardW - 16);
    top = rect.top + rect.height + TOOLTIP_GAP;
  } else {
    left = Math.min(Math.max(16, rect.left), vw - cardW - 16);
    top = Math.max(16, rect.top - cardH - TOOLTIP_GAP);
  }

  return {
    top,
    left,
    width: cardW,
    maxWidth: "calc(100vw - 2rem)",
  };
}

export function UsageGuideModal({ open, guideContext, onClose, onFinished }: UsageGuideModalProps) {
  const steps = useMemo(() => getUsageGuideSteps(guideContext), [guideContext]);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  const current = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  const refreshRect = useCallback(() => {
    setRect(measureTarget(current));
  }, [current]);

  useLayoutEffect(() => {
    if (!open || !current) return;

    dispatchUsageGuideActive(true);
    dispatchUsageGuidePrepareStep({
      expandNav: current.expandNav,
      openMobileSidebar: current.target !== "workspace",
    });

    const run = () => {
      const el = queryTourTarget(current.target);
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      window.setTimeout(refreshRect, 280);
      refreshRect();
    };

    run();
    const t = window.setTimeout(refreshRect, 400);

    window.addEventListener("resize", refreshRect);
    window.addEventListener("scroll", refreshRect, true);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", refreshRect);
      window.removeEventListener("scroll", refreshRect, true);
    };
  }, [open, current, refreshRect]);

  useEffect(() => {
    if (!open) {
      dispatchUsageGuideActive(false);
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      dispatchUsageGuideActive(false);
    };
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

  if (!open || !mounted || steps.length === 0) return null;

  const cardW = 384;
  const cardH = 220;
  const popoverStyle = tooltipStyle(rect, cardW, cardH);

  const hole = rect;

  const content = (
    <div className="fixed inset-0 z-[110]" aria-hidden={false}>
      <div className="pointer-events-none fixed inset-0">
        {hole ? (
          <>
            <div
              className="absolute left-0 right-0 top-0 bg-obsidian/55 transition-[height] duration-200 pointer-events-auto"
              style={{ height: Math.max(0, hole.top) }}
              onClick={skip}
            />
            <div
              className="absolute left-0 bg-obsidian/55 transition-all duration-200 pointer-events-auto"
              style={{
                top: hole.top,
                width: Math.max(0, hole.left),
                height: hole.height,
              }}
              onClick={skip}
            />
            <div
              className="absolute bg-obsidian/55 transition-all duration-200 pointer-events-auto"
              style={{
                top: hole.top,
                left: hole.left + hole.width,
                right: 0,
                height: hole.height,
              }}
              onClick={skip}
            />
            <div
              className="absolute left-0 right-0 bottom-0 bg-obsidian/55 transition-all duration-200 pointer-events-auto"
              style={{ top: hole.top + hole.height }}
              onClick={skip}
            />
            <div
              className="absolute rounded-[var(--radius-sm)] ring-2 ring-forest-ink ring-offset-2 ring-offset-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0)] pointer-events-none transition-all duration-200"
              style={{
                top: hole.top,
                left: hole.left,
                width: hole.width,
                height: hole.height,
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-obsidian/55 pointer-events-auto" onClick={skip} />
        )}
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="usage-guide-title"
        className="overlay-panel pointer-events-auto fixed flex max-h-[min(85vh,420px)] flex-col overflow-hidden shadow-xl animate-fade-in"
        style={popoverStyle}
      >
        <div className="border-b border-cloud px-5 py-3">
          <p className="text-xs font-medium text-slate">
            Visite guidée · {stepIndex + 1} / {steps.length}
          </p>
          <h2 id="usage-guide-title" className="mt-1 font-display text-lg text-graphite">
            {current.title}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-sm leading-[1.43] text-slate">{current.body}</p>
          <div className="mt-5 flex gap-1">
            {steps.map((_, i) => (
              <span
                key={steps[i].id}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= stepIndex ? "bg-forest-ink" : "bg-cloud",
                )}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cloud px-5 py-3">
          <Button type="button" variant="ghost" size="sm" onClick={skip}>
            Ignorer
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((s) => s - 1)}
            >
              Précédent
            </Button>
            {isLast ? (
              <Button type="button" size="sm" onClick={finish}>
                Terminer
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={() => setStepIndex((s) => s + 1)}>
                Suivant
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
