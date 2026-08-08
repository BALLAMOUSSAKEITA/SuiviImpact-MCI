"use client";

import { Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface TableRowActionsProps {
  onEdit: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  className?: string;
}

export function TableRowActions({
  onEdit,
  onDelete,
  editLabel = "Modifier",
  deleteLabel = "Supprimer",
  className,
}: TableRowActionsProps) {
  return (
    <div
      className={cn(
        "table-row-actions inline-flex items-stretch overflow-hidden rounded-[var(--radius-sm)] bg-white ring-1 ring-cloud",
        className,
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        title={editLabel}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate transition-colors hover:bg-veil hover:text-graphite"
      >
        <Pencil className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
        <span>{editLabel}</span>
      </button>
      {onDelete && (
        <>
          <span className="w-px self-stretch bg-cloud/80" aria-hidden />
          <button
            type="button"
            onClick={onDelete}
            title={deleteLabel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{deleteLabel}</span>
          </button>
        </>
      )}
    </div>
  );
}
