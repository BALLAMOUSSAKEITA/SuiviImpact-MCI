"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { deleteObjectif } from "@/lib/api";
import type { Objectif } from "@/types";

interface ObjectifTableProps {
  objectifs: Objectif[];
  queryKey: string[];
}

export function ObjectifTable({ objectifs, queryKey }: ObjectifTableProps) {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteObjectif,
    onSuccess: () => {
      toast.success("Objectif supprimé");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDelete = (objectif: Objectif) => {
    if (
      window.confirm(
        `Supprimer l'objectif ${objectif.code} ? Les activités associées seront aussi supprimées.`,
      )
    ) {
      deleteMutation.mutate(objectif.id);
    }
  };

  if (objectifs.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border bg-white py-12 text-center">
        <p className="text-sm text-gray-400">Aucun objectif enregistré.</p>
      </div>
    );
  }

  return (
    <div className="table-shell">
      <table className="table-grain">
        <thead>
          <tr>
            <th>Code</th>
            <th>Objectif</th>
            {canWrite && <th className="w-[1%] text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {objectifs.map((objectif) => (
            <tr key={objectif.id}>
              <td className="w-[80px]">
                <span className="inline-block rounded bg-primary-subtle px-1.5 py-0.5 text-xs font-medium text-primary">
                  {objectif.code}
                </span>
              </td>
              <td>
                <Link
                  href={`/activite/${objectif.id}`}
                  className="text-gray-900 hover:text-primary"
                >
                  {objectif.description}
                </Link>
              </td>
              {canWrite && (
                <td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/objectifs/${objectif.id}/modifier`}>
                      <Button variant="ghost" size="sm">Modifier</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(objectif)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
