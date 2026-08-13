"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-[#0d4f38]/55"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md overflow-hidden border border-[#0d4f38] bg-white shadow-[var(--shadow-elevated)]"
      >
        <header className="bg-[#0d4f38] px-6 py-3.5">
          <h2
            id="confirm-dialog-title"
            className="font-display text-lg font-semibold text-white"
          >
            {title}
          </h2>
        </header>
        <div className="p-6">
          <p className="text-sm leading-relaxed text-[#4a6b5c]">{description}</p>
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#d4e5dc] pt-4">
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
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "large";
  headerActions?: React.ReactNode;
}

export function FormDialog({
  open,
  title,
  subtitle,
  onClose,
  children,
  className,
  size = "default",
  headerActions,
}: FormDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const isLarge = size === "large";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-[#0d4f38]/55"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-dialog-title"
        className={cn(
          "relative w-full overflow-hidden border border-[#0d4f38] bg-white shadow-[var(--shadow-elevated)]",
          isLarge
            ? "flex max-h-[min(92vh,920px)] max-w-4xl flex-col"
            : "max-w-lg",
          className,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 bg-[#0d4f38] px-6 py-3.5">
          <div className="min-w-0 pr-2">
            <h2
              id="form-dialog-title"
              className="font-display text-lg font-semibold text-white"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 truncate text-sm text-white/70">{subtitle}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
            <button
              type="button"
              aria-label="Fermer"
              className="p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div
          className={cn(
            "p-6",
            isLarge && "min-h-0 flex-1 overflow-y-auto",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
