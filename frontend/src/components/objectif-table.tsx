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
    <div className="table-shell">
      <table className="table-dub">
        <thead>
          <tr>
            <th>Code</th>
            <th>Objectifs</th>
            {canWrite && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {objectifs.length === 0 && (
            <tr>
              <td colSpan={canWrite ? 3 : 2} className="py-8 text-center text-fog">
                Aucun objectif enregistré
              </td>
            </tr>
          )}
          {objectifs.map((objectif) => (
            <tr key={objectif.id}>
              <td className="font-medium text-electric-blue">{objectif.code}</td>
              <td>
                <Link
                  href={`/activite/${objectif.id}`}
                  className="text-steel hover:text-electric-blue hover:underline"
                >
                  {objectif.description}
                </Link>
              </td>
              {canWrite && (
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/objectifs/${objectif.id}/modifier`}>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
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
