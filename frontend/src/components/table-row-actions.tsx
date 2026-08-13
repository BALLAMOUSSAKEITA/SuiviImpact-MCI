"use client";

import { Button } from "@/components/ui/button";
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
    <div className={cn("table-row-actions inline-flex items-center justify-end gap-2", className)}>
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>
        {editLabel}
      </Button>
      {onDelete && (
        <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
          {deleteLabel}
        </Button>
      )}
    </div>
  );
}
