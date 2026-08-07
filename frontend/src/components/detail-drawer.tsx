"use client";

import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
        className="inline-flex max-w-[200px] items-center gap-1.5 truncate rounded-[var(--radius-card)] px-2 py-1 text-left text-sm font-medium text-forest-ink underline-offset-2 hover:bg-forest-ink/5 hover:underline"
        title={label}
      >
        <FileText className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-[var(--radius-card)] border border-cloud bg-white py-1 shadow-[var(--shadow-elevated)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            disabled={busy !== null}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-graphite hover:bg-veil disabled:opacity-50"
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
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-graphite hover:bg-veil disabled:opacity-50"
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
  onClose: () => void;
  children: React.ReactNode;
}

export function DetailDrawer({ open, title, subtitle, onClose, children }: DetailDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Fermer le détail"
        className="fixed inset-0 z-[90] bg-obsidian/30"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-drawer-title"
        className="fixed inset-y-0 right-0 z-[91] flex w-full max-w-md flex-col border-l border-cloud/80 bg-white shadow-[var(--shadow-elevated)] animate-slide-in-right"
      >
        <header className="flex items-start justify-between gap-3 border-b border-cloud/60 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-fog">Détail</p>
            <h2 id="detail-drawer-title" className="mt-1 text-lg font-bold text-graphite">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate">{subtitle}</p>}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-cloud/50 py-3 last:border-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-fog">{label}</dt>
      <dd className="mt-1 text-sm text-graphite">{children}</dd>
    </div>
  );
}

export function DetailDrawerRows({ children }: { children: React.ReactNode }) {
  return <dl className="divide-y divide-cloud/50">{children}</dl>;
}

export { DetailRow };
