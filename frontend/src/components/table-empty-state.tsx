"use client";

import { InboxIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableEmptyStateProps {
  message?: string;
  colSpan?: number;
  className?: string;
}

export function TableEmptyState({
  message = "Aucune donnée à afficher.",
  colSpan = 4,
  className,
}: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn("py-12", className)}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-veil">
            <InboxIcon className="h-6 w-6 text-ash" strokeWidth={1.5} />
          </div>
          <p className="max-w-xs text-sm text-ash">{message}</p>
        </div>
      </td>
    </tr>
  );
}

interface TableLoadingStateProps {
  colSpan?: number;
  rows?: number;
}

export function TableLoadingState({ colSpan = 4, rows = 3 }: TableLoadingStateProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          <td colSpan={colSpan} className="py-3 px-4">
            <div className="skeleton h-5 w-full rounded" />
          </td>
        </tr>
      ))}
    </>
  );
}
