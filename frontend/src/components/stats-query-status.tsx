"use client";

import type { ReactNode } from "react";

export function StatsQueryStatus({
  isLoading,
  isError,
  error,
  empty,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  /** Afficher un message si les stats sont absentes sans erreur réseau */
  empty?: boolean;
  children: ReactNode;
}) {
  if (isLoading) {
    return <p className="text-sm text-ash">Chargement…</p>;
  }
  if (isError) {
    return (
      <p className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Impossible de charger les statistiques
        {error?.message ? ` : ${error.message}` : "."}
      </p>
    );
  }
  if (empty) {
    return (
      <p className="text-sm text-slate">
        Aucune donnée pour cette période. Vérifiez les dates ou élargissez la plage.
      </p>
    );
  }
  return <>{children}</>;
}
