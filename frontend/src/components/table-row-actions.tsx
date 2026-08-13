"use client";

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
    <div className={cn("table-row-actions inline-flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={onEdit}
        title={editLabel}
        className="text-[13px] font-semibold text-[#0d4f38] hover:underline"
      >
        {editLabel}
      </button>
      {onDelete && (
        <>
          <span className="text-hairline" aria-hidden>
            |
          </span>
          <button
            type="button"
            onClick={onDelete}
            title={deleteLabel}
            className="text-[13px] font-semibold text-[#ce1126] hover:underline"
          >
            {deleteLabel}
          </button>
        </>
      )}
    </div>
  );
}
