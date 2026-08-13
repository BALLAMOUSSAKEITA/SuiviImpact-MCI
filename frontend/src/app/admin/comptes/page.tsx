"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/protected-route";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  listUsers,
} from "@/lib/api";
import { ROLE_LABELS } from "@/lib/roles";

export default function ComptesPage() {
  return (
    <ProtectedRoute adminOnly>
      <ComptesContent />
    </ProtectedRoute>
  );
}

function ComptesContent() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    prenom: string;
  } | null>(null);
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
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDelete = (id: number, prenom: string) => {
    setDeleteTarget({ id, prenom });
  };

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Gestion des comptes"
        description="Créer, activer, désactiver ou supprimer des utilisateurs."
        actions={
          <Link href="/admin/comptes/nouveau">
            <Button>Nouveau compte</Button>
          </Link>
        }
      />

        <div className="table-shell">
          <table className="table-grain">
            <thead>
              <tr>
                <th>N°</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Username</th>
                <th>Rôle</th>
                <th>Accès</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate">
                    Chargement…
                  </td>
                </tr>
              )}
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-veil">
                  <td>{user.id}</td>
                  <td>{user.nom || "—"}</td>
                  <td className="font-medium">{user.prenom}</td>
                  <td>{user.username}</td>
                  <td>{ROLE_LABELS[user.role]}</td>
                  <td className="capitalize">{user.type_acces}</td>
                  <td>
                    <span
                      className={
                        user.etat
                          ? "border border-hairline bg-[#e0f5ea] px-2 py-0.5 text-xs font-semibold text-[#0d4f38]"
                          : "border border-[#ce1126]/30 bg-[#fdecea] px-2 py-0.5 text-xs font-semibold text-[#ce1126]"
                      }
                    >
                      {user.etat ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
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

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer le compte"
        description={
          deleteTarget
            ? `Supprimer définitivement le compte de ${deleteTarget.prenom} ?`
            : ""
        }
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </>
  );
}
