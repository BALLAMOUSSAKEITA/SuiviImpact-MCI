"use client";

import { Download, ExternalLink, FileText, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  downloadStoredDocument,
  openStoredDocument,
  type StoredDocumentFetch,
} from "@/lib/stored-documents";
import { cn } from "@/lib/utils";

interface StoredDocumentMenuProps {
  label: string;
  fetchForOpen: StoredDocumentFetch;
  fetchForDownload: StoredDocumentFetch;
  className?: string;
  onAction?: () => void;
}

export function StoredDocumentMenu({
  label,
  fetchForOpen,
  fetchForDownload,
  className,
  onAction,
}: StoredDocumentMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"open" | "download" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const run = useCallback(
    async (mode: "open" | "download") => {
      setBusy(mode);
      try {
        if (mode === "open") {
          await openStoredDocument(fetchForOpen);
        } else {
          await downloadStoredDocument(fetchForDownload);
          toast.success("Téléchargement lancé");
        }
        onAction?.();
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Impossible d'accéder au document");
      } finally {
        setBusy(null);
      }
    },
    [fetchForOpen, fetchForDownload, onAction],
  );

  return (
    <div ref={rootRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex max-w-full items-center gap-2 rounded-[var(--radius-pill)] bg-veil px-3 py-1.5 text-left text-sm font-medium text-graphite transition-colors hover:bg-cloud"
        title={label}
      >
        <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="truncate">{label}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="dropdown-panel absolute left-0 top-full z-50 mt-1.5 min-w-[180px] overflow-hidden py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            disabled={busy !== null}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-graphite hover:bg-veil disabled:opacity-50"
            onClick={() => run("open")}
          >
            {busy === "open" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 text-forest-ink" />
            )}
            Ouvrir
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={busy !== null}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-graphite hover:bg-veil disabled:opacity-50"
            onClick={() => run("download")}
          >
            {busy === "download" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 text-forest-ink" />
            )}
            Télécharger
          </button>
        </div>
      )}
    </div>
  );
}

interface DetailDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Panneau plus large pour contenus riches (ex. plan projet). */
  size?: "default" | "wide";
}

export function DetailDrawer({
  open,
  title,
  subtitle,
  eyebrow,
  onClose,
  children,
  size = "default",
}: DetailDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4 md:p-6 animate-fade-in">
      <button
        type="button"
        aria-label="Fermer le détail"
        className="absolute inset-0 bg-obsidian/40 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-drawer-title"
        className={cn(
          "overlay-panel relative flex max-h-[92vh] w-full flex-col overflow-hidden sm:max-h-[min(88vh,780px)] animate-scale-in",
          size === "wide" ? "sm:max-w-2xl" : "sm:max-w-xl",
        )}
      >
        <header className="relative shrink-0 border-b border-cloud px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <button
            type="button"
            aria-label="Fermer"
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center border border-hairline bg-white text-graphite transition-colors hover:bg-pebble sm:right-4 sm:top-4"
            onClick={onClose}
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <div className="pr-10">
            {eyebrow && (
              <p className="text-xs font-medium text-slate">{eyebrow}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {subtitle && (
                <span className="inline-flex rounded-[var(--radius-pill)] bg-veil px-2.5 py-0.5 text-xs font-semibold text-graphite">
                  {subtitle}
                </span>
              )}
            </div>
            <h2
              id="detail-drawer-title"
              className="mt-3 font-display text-xl font-semibold leading-snug text-graphite sm:text-[1.35rem]"
            >
              {title}
            </h2>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function DetailRow({ label, children, className }: DetailRowProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-sm)] bg-veil px-4 py-3.5",
        className,
      )}
    >
      <p className="text-xs font-medium text-slate">{label}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-graphite [&_ul]:mt-0">{children}</div>
    </div>
  );
}

export function DetailDrawerRows({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2.5">{children}</div>;
}

/** Zone d’actions en bas du détail (ex. bouton Modifier). */
export function DetailDrawerActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-4 border-t border-cloud/50 pt-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { DetailRow };
