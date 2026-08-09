"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEmailConfig, listNotificationEmails, triggerActiviteReminders } from "@/lib/api";
import { cn } from "@/lib/utils";
import { NOTIFICATION_STATUT_LABELS, type NotificationEmailItem } from "@/types";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function statutClass(statut: string): string {
  if (statut === "envoye") return "bg-emerald-50 text-emerald-800";
  if (statut === "echec") return "bg-red-50 text-red-800";
  return "bg-amber-50 text-amber-900";
}

export default function NotificationsPage() {
  const { canAccessNotifications } = useAuth();
  const queryClient = useQueryClient();
  const [confirmForce, setConfirmForce] = useState(false);

  const { data: emailConfig } = useQuery({
    queryKey: ["notifications-email-config"],
    queryFn: getEmailConfig,
    enabled: canAccessNotifications,
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications-email"],
    queryFn: () => listNotificationEmails(150),
    enabled: canAccessNotifications,
  });

  const triggerMutation = useMutation({
    mutationFn: (force: boolean) => triggerActiviteReminders(force),
    onSuccess: (stats) => {
      if (stats.emails_echec > 0) {
        toast.error(stats.message || `${stats.emails_echec} e-mail(s) en échec`);
      } else if (stats.activites_notifiees === 0) {
        toast.info(stats.message || "Aucune activité notifiée");
      } else {
        toast.success(
          `${stats.activites_notifiees} activité(s) — ${stats.emails_envoyes} e-mail(s) envoyé(s) via ${stats.provider ?? "simulation"}`,
        );
      }
      void queryClient.invalidateQueries({ queryKey: ["notifications-email"] });
      setConfirmForce(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!canAccessNotifications) {
    return (
      <PageHeader
        eyebrow="Administration"
        title="Notifications e-mail"
        description="Accès réservé aux comptes développeur."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Notifications e-mail"
        description="Historique des rappels d'activités PAO en retard et déclenchement manuel pour test ou relance."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={triggerMutation.isPending}
              onClick={() => triggerMutation.mutate(false)}
            >
              {triggerMutation.isPending ? "Envoi…" : "Envoyer maintenant"}
            </Button>
            <Button
              disabled={triggerMutation.isPending}
              onClick={() => setConfirmForce(true)}
            >
              Forcer l'envoi
            </Button>
          </div>
        }
      />

      <Card
        className={cn(
          "mb-6 border-veil",
          emailConfig && !emailConfig.configured
            ? "border-amber-200 bg-amber-50/80"
            : "bg-veil/40",
        )}
      >
        <CardContent className="p-4 text-sm leading-relaxed text-slate">
          {emailConfig ? (
            <>
              <p className="font-medium text-graphite">
                Canal e-mail :{" "}
                {emailConfig.configured
                  ? emailConfig.provider === "resend"
                    ? "Resend (HTTPS)"
                    : "SMTP"
                  : "Non configuré"}
                {emailConfig.railway ? " · Railway" : ""}
              </p>
              <p className="mt-2">{emailConfig.message}</p>
            </>
          ) : (
            <p>Chargement de la configuration e-mail…</p>
          )}
          <p className="mt-3 text-xs text-ash">
            Rappels automatiques à 8h (Conakry). Destinataires : directeur + ministre, BSD en
            copie (<code className="text-xs">SMTP_BSD_CC</code>).
          </p>
        </CardContent>
      </Card>

      <div className="table-shell">
        <table className="table-grain">
          <thead>
            <tr>
              <th>Date</th>
              <th>Activité</th>
              <th>Destinataire</th>
              <th>Rôle</th>
              <th>Sujet</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && notifications.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-ash">
                  Aucune notification enregistrée pour le moment.
                </td>
              </tr>
            )}
            {!isLoading &&
              notifications.map((item: NotificationEmailItem) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap text-sm">
                    {formatDateTime(item.envoye_at)}
                  </td>
                  <td>
                    <div className="font-medium text-graphite">
                      {item.activite_code ?? "—"}
                    </div>
                    {item.activite_description && (
                      <div className="max-w-xs truncate text-xs text-ash">
                        {item.activite_description}
                      </div>
                    )}
                  </td>
                  <td className="text-sm">{item.destinataire}</td>
                  <td>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        item.en_copie
                          ? "bg-sky-50 text-sky-800"
                          : "bg-graphite/5 text-graphite",
                      )}
                    >
                      {item.en_copie ? "Copie BSD" : "Destinataire"}
                    </span>
                  </td>
                  <td className="max-w-sm truncate text-sm text-slate">
                    {item.sujet ?? "—"}
                  </td>
                  <td>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        statutClass(item.statut),
                      )}
                    >
                      {NOTIFICATION_STATUT_LABELS[item.statut] ?? item.statut}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmForce}
        title="Forcer l'envoi des rappels ?"
        description="Relance immédiatement les e-mails pour toutes les activités en retard, même si un rappel a déjà été envoyé aujourd'hui."
        confirmLabel="Forcer l'envoi"
        onConfirm={() => triggerMutation.mutate(true)}
        onCancel={() => setConfirmForce(false)}
        loading={triggerMutation.isPending}
      />
    </>
  );
}
