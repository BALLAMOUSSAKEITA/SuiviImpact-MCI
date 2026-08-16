"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import {
  printQrPresenceSheet,
  QrPresencePrintSheet,
} from "@/components/qr-presence-print-sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  closeSeancePresence,
  exportSeancePresence,
  getSeancePresenceDetail,
} from "@/lib/api";

function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SeanceDetailPage() {
  return <SeanceDetailContent />;
}

function SeanceDetailContent() {
  const params = useParams();
  const seanceId = Number(params.id);
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [confirmClose, setConfirmClose] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingXlsx, setExportingXlsx] = useState(false);

  const queryKey = ["presence-seance", seanceId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getSeancePresenceDetail(seanceId),
    enabled: Number.isFinite(seanceId),
    refetchInterval: 5000,
  });

  const checkInUrl = useMemo(() => {
    if (!data?.token || typeof window === "undefined") return "";
    return `${window.location.origin}/presence/${data.token}`;
  }, [data?.token]);

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey }),
    [queryClient, queryKey],
  );

  const closeMutation = useMutation({
    mutationFn: () => closeSeancePresence(seanceId),
    onSuccess: () => {
      toast.success("Séance clôturée");
      setConfirmClose(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handlePrint = () => {
    if (!checkInUrl) {
      toast.error("Le lien QR n'est pas encore disponible");
      return;
    }
    const ok = printQrPresenceSheet();
    if (!ok) {
      toast.error("Impossible de préparer l'impression du QR code.");
    }
  };

  const handleExport = async (format: "pdf" | "xlsx") => {
    if (format === "pdf") setExportingPdf(true);
    else setExportingXlsx(true);
    try {
      await exportSeancePresence(seanceId, format);
      toast.success(format === "pdf" ? "PDF téléchargé" : "Excel téléchargé");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur d'export");
    } finally {
      setExportingPdf(false);
      setExportingXlsx(false);
    }
  };

  if (isLoading || !data) {
    return (
      <p className="py-12 text-center text-ash">
        {isLoading ? "Chargement…" : "Séance introuvable"}
      </p>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Présence"
        title={data.titre}
        description={formatDate(data.date_seance)}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/presence/seances"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Retour
            </Link>
            <Button variant="outline" onClick={() => handleExport("pdf")} disabled={exportingPdf}>
              {exportingPdf ? "Export…" : "Exporter PDF"}
            </Button>
            <Button variant="outline" onClick={() => handleExport("xlsx")} disabled={exportingXlsx}>
              {exportingXlsx ? "Export…" : "Exporter Excel"}
            </Button>
            {canWrite && data.statut === "ouverte" && (
              <Button variant="outline" onClick={() => setConfirmClose(true)}>
                Clôturer
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="panel-grain">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-graphite">QR code de pointage</p>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              Imprimer
            </Button>
          </div>
          <QrPresencePrintSheet
            titre={data.titre}
            dateLabel={formatDate(data.date_seance)}
            checkInUrl={checkInUrl}
          />
        </div>

        <div className="panel-grain">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-2xl font-semibold text-graphite">
                {data.nb_presents}
                <span className="text-lg font-normal text-slate"> / {data.nb_personnel_actif}</span>
              </p>
              <p className="text-sm text-slate">Présents enregistrés</p>
            </div>
            <span
              className={
                data.statut === "ouverte"
                  ? "rounded-full bg-[#e0f5ea] px-3 py-1 text-sm font-semibold text-forest-ink"
                  : "rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate"
              }
            >
              {data.statut === "ouverte" ? "Séance ouverte" : "Séance clôturée"}
            </span>
          </div>

          <div className="table-shell max-h-[480px] overflow-y-auto">
            <table className="table-grain">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Nom</th>
                  <th>Fonction</th>
                  <th>Heure</th>
                </tr>
              </thead>
              <tbody>
                {data.presences.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-ash">
                      Aucun pointage pour l&apos;instant
                    </td>
                  </tr>
                )}
                {data.presences.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="text-slate">{idx + 1}</td>
                    <td className="font-medium text-graphite">{p.nom_complet}</td>
                    <td className="max-w-xs text-sm text-slate">{p.fonction}</td>
                    <td className="text-sm text-slate">{formatTime(p.pointe_a)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClose}
        title="Clôturer la séance"
        description="Les participants ne pourront plus pointer leur présence. Vous pourrez toujours exporter la liste."
        confirmLabel="Clôturer"
        loading={closeMutation.isPending}
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => closeMutation.mutate()}
      />
    </>
  );
}
