"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createSeancePresence, deleteSeancePresence, listSeancesPresence } from "@/lib/api";

function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR");
}

export default function SeancesPresencePage() {
  return <SeancesPresenceContent />;
}

function SeancesPresenceContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({
    titre: "Réunion Statutaire de Cabinet",
    date_seance: new Date().toISOString().slice(0, 10),
  });

  const queryKey = ["presence-seances"];

  const { data = [], isLoading } = useQuery({
    queryKey,
    queryFn: listSeancesPresence,
    refetchInterval: 15000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: () =>
      createSeancePresence({
        titre: form.titre.trim(),
        date_seance: form.date_seance,
      }),
    onSuccess: (seance) => {
      toast.success("Séance ouverte — QR code prêt");
      setShowForm(false);
      invalidate();
      window.location.href = `/admin/presence/seances/${seance.id}`;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSeancePresence,
    onSuccess: () => {
      toast.success("Séance supprimée");
      setDeleteId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        eyebrow="Présence"
        title="Séances"
        description="Ouvrez une séance, affichez le QR code et exportez la liste de présence en fin de réunion."
        actions={
          canWrite && !showForm ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Nouvelle séance
            </Button>
          ) : undefined
        }
      />

      {showForm && canWrite && (
        <div className="panel-grain mb-6">
          <h3 className="mb-4 text-base font-semibold text-graphite">Ouvrir une séance</h3>
          <form
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
          >
            <div className="sm:col-span-2">
              <label className="label-grain">Titre</label>
              <input
                required
                value={form.titre}
                onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                className="input-grain"
              />
            </div>
            <div>
              <label className="label-grain">Date</label>
              <input
                required
                type="date"
                value={form.date_seance}
                onChange={(e) => setForm((f) => ({ ...f, date_seance: e.target.value }))}
                className="input-grain"
              />
            </div>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Création…" : "Ouvrir et afficher le QR"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="table-shell">
        <table className="table-grain">
          <thead>
            <tr>
              <th>Date</th>
              <th>Titre</th>
              <th>Statut</th>
              <th>Présents</th>
              <th className="w-[1%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ash">Chargement…</td>
              </tr>
            )}
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ash">
                  Aucune séance — ouvrez-en une pour commencer
                </td>
              </tr>
            )}
            {data.map((s) => (
              <tr key={s.id}>
                <td className="text-slate">{formatDate(s.date_seance)}</td>
                <td className="font-medium text-graphite">{s.titre}</td>
                <td>
                  <span
                    className={
                      s.statut === "ouverte"
                        ? "rounded-full bg-[#e0f5ea] px-2.5 py-0.5 text-xs font-semibold text-forest-ink"
                        : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate"
                    }
                  >
                    {s.statut === "ouverte" ? "Ouverte" : "Clôturée"}
                  </span>
                </td>
                <td className="text-slate">
                  {s.nb_presents} / {s.nb_personnel_actif}
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/presence/seances/${s.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Voir
                    </Link>
                    {canWrite && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(s.id)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Supprimer la séance"
        description="Supprimer cette séance et tous les pointages associés ?"
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
