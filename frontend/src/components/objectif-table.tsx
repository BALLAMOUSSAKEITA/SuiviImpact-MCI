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

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-zinc-600">Code</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-600">Objectifs</th>
            {canWrite && (
              <th className="px-4 py-3 text-right font-medium text-zinc-600">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {objectifs.length === 0 && (
            <tr>
              <td colSpan={canWrite ? 3 : 2} className="px-4 py-8 text-center text-zinc-400">
                Aucun objectif enregistré
              </td>
            </tr>
          )}
          {objectifs.map((objectif) => (
            <tr key={objectif.id} className="transition-colors hover:bg-emerald-50/40">
              <td className="px-4 py-3 font-medium text-emerald-800">{objectif.code}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/activite/${objectif.id}`}
                  className="text-zinc-700 hover:text-emerald-700 hover:underline"
                >
                  {objectif.description}
                </Link>
              </td>
              {canWrite && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/objectifs/${objectif.id}/modifier`}>
                      <Button variant="outline" className="h-8 px-3 text-xs">
                        Modifier
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="h-8 px-3 text-xs text-red-600"
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
