"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  listUsers,
} from "@/lib/api";

export default function ComptesPage() {
  return (
    <ProtectedRoute adminOnly>
      <ComptesContent />
    </ProtectedRoute>
  );
}

function ComptesContent() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const activateMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      toast.success("Compte activé");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      toast.success("Compte désactivé");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("Compte supprimé");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDelete = (id: number, prenom: string) => {
    if (window.confirm(`Supprimer le compte de ${prenom} ?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Gestion des comptes</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Créer, activer, désactiver ou supprimer des utilisateurs.
            </p>
          </div>
          <Link href="/admin/comptes/nouveau">
            <Button>Nouveau compte</Button>
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">N°</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Prénom</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Username</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Rôle</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Accès</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600">Statut</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    Chargement…
                  </td>
                </tr>
              )}
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">{user.id}</td>
                  <td className="px-4 py-3 font-medium">{user.prenom}</td>
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3 capitalize">{user.type_acces}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.etat
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800"
                          : "rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800"
                      }
                    >
                      {user.etat ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {user.etat ? (
                        <Button
                          variant="outline"
                          size="default"
                          className="h-8 px-3 text-xs"
                          onClick={() => deactivateMutation.mutate(user.id)}
                        >
                          Désactiver
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="default"
                          className="h-8 px-3 text-xs"
                          onClick={() => activateMutation.mutate(user.id)}
                        >
                          Activer
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="default"
                        className="h-8 px-3 text-xs text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(user.id, user.prenom)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
