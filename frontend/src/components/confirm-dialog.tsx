"use client";

import { AlertTriangle, Info, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive" | "info";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DialogIcon({ variant }: { variant: ConfirmDialogProps["variant"] }) {
  const base =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full";
  if (variant === "destructive") {
    return (
      <div className={cn(base, "bg-red-50 text-red-600")}>
        <AlertTriangle className="h-5 w-5" strokeWidth={2} />
      </div>
    );
  }
  if (variant === "info") {
    return (
      <div className={cn(base, "bg-veil text-graphite")}>
        <Pencil className="h-5 w-5" strokeWidth={2} />
      </div>
    );
  }
  return (
    <div className={cn(base, "bg-veil text-forest-ink")}>
      <Info className="h-5 w-5" strokeWidth={2} />
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const destructive = variant === "destructive";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-obsidian/45 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md overflow-hidden overlay-panel"
      >
        <div className="p-6">
          <div className="flex gap-4">
            <DialogIcon variant={variant} />
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id="confirm-dialog-title" className="text-base font-semibold text-graphite">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">{description}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-cloud/60 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={destructive ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "En cours…" : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FormDialog({
  open,
  title,
  onClose,
  children,
  className,
}: FormDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-obsidian/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-lg overflow-hidden overlay-panel",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-cloud px-6 py-4">
          <h2 className="text-base font-semibold text-graphite">{title}</h2>
          <button
            type="button"
            aria-label="Fermer"
            className="rounded-[var(--radius-sm)] p-1.5 text-ash transition-colors hover:bg-veil hover:text-graphite"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
