"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
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
    <div className="table-shell animate-fade-in">
      <table className="table-grain">
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
              <td colSpan={canWrite ? 3 : 2} className="py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-veil text-ash">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 0H9.75m3 0v3.75m-3-3.75v3.75M6 20.25h12A2.25 2.25 0 0020.25 18V6.75A2.25 2.25 0 0018 4.5H6A2.25 2.25 0 003.75 6.75V18A2.25 2.25 0 006 20.25z" />
                    </svg>
                  </div>
                  <p className="text-sm text-ash">Aucun objectif enregistré</p>
                </div>
              </td>
            </tr>
          )}
          {objectifs.map((objectif) => (
            <tr key={objectif.id} className="group">
              <td>
                <span className="inline-flex rounded-full bg-forest-ink/8 px-2.5 py-0.5 text-xs font-bold text-forest-ink">
                  {objectif.code}
                </span>
              </td>
              <td>
                <Link
                  href={`/activite/${objectif.id}`}
                  className="text-graphite transition-colors hover:text-forest-ink"
                >
                  {objectif.description}
                </Link>
              </td>
              {canWrite && (
                <td className="text-right">
                  <div className="flex flex-wrap justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:gap-1.5">
                    <Link href={`/admin/objectifs/${objectif.id}/modifier`}>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-ash hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(objectif)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
