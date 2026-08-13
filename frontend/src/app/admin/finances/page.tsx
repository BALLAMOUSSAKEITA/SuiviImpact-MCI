"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getFinances, importFinances } from "@/lib/api";
import { BRAND } from "@/lib/brand";
import { formatMontantGnf, formatTauxPct } from "@/lib/finances";
import { cn } from "@/lib/utils";

function formatImportedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function FinancesPage() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["finances"],
    queryFn: getFinances,
  });

  const lignes = data?.lignes ?? [];
  const snapshot = data?.snapshot ?? null;

  const importMutation = useMutation({
    mutationFn: importFinances,
    onSuccess: (state) => {
      toast.success(
        state.snapshot
          ? `${state.snapshot.row_count} ligne(s) importée(s)`
          : "Import terminé",
      );
      queryClient.setQueryData(["finances"], state);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pickFile = () => fileInputRef.current?.click();

  const onFileChosen = (file: File | undefined) => {
    if (!file) return;
    if (lignes.length > 0) {
      setPendingFile(file);
      return;
    }
    importMutation.mutate(file);
  };

  return (
    <>
      <PageHeader
        eyebrow={`${BRAND.bureauShort} · ${BRAND.program}`}
        title="Finances"
        description="Suivi budgétaire : prévisions LFI, engagements, paiements et taux de décaissement. L’import Excel remplace entièrement le tableau."
        actions={
          canWrite ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => {
                  onFileChosen(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                onClick={pickFile}
                disabled={importMutation.isPending}
              >
                <Upload className="h-4 w-4" />
                {importMutation.isPending ? "Import…" : "Importer"}
              </Button>
            </>
          ) : undefined
        }
      />

      {snapshot && (
        <p className="text-sm text-slate">
          Dernier import :{" "}
          <span className="font-medium text-graphite">{snapshot.filename}</span>
          {" · "}
          {formatImportedAt(snapshot.imported_at)}
          {" · "}
          {snapshot.row_count} ligne{snapshot.row_count > 1 ? "s" : ""}
        </p>
      )}

      <div className="table-shell overflow-x-auto">
        <table className="table-grain min-w-[800px]">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="border-b border-r border-hairline px-4 py-3 text-left align-middle font-medium text-slate"
              >
                Titres du budget
              </th>
              <th
                colSpan={3}
                className="border-b border-r border-hairline px-4 py-2 text-center font-medium text-slate"
              >
                Montants en GNF
              </th>
              <th
                colSpan={2}
                className="border-b border-hairline px-4 py-2 text-center font-medium text-slate"
              >
                Taux de décaissement
              </th>
            </tr>
            <tr>
              <th className="border-b border-r border-hairline px-4 py-2 text-right font-medium text-slate">
                Prévus / LFI (1)
              </th>
              <th className="border-b border-r border-hairline px-4 py-2 text-right font-medium text-slate">
                Engagés (2)
              </th>
              <th className="border-b border-r border-hairline px-4 py-2 text-right font-medium text-slate">
                Payés (3)
              </th>
              <th className="border-b border-r border-hairline px-4 py-2 text-right font-medium text-slate">
                Base « engagement » (2)/(1)
              </th>
              <th className="border-b border-hairline px-4 py-2 text-right font-medium text-slate">
                Base « caisse » (3)/(1)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud/60">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ash">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && lignes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ash">
                  Aucune donnée. Importez le fichier Excel de suivi budgétaire
                  {canWrite ? " via le bouton Importer." : "."}
                </td>
              </tr>
            )}
            {lignes.map((ligne) => (
              <tr
                key={ligne.id}
                className={cn(
                  "hover:bg-veil",
                  ligne.is_total && "bg-[#e0f5ea]/70 font-semibold",
                )}
              >
                <td className="px-4 py-3 text-graphite">{ligne.titre_budget}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatMontantGnf(ligne.montant_prevu)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatMontantGnf(ligne.montant_engage)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatMontantGnf(ligne.montant_paye)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatTauxPct(ligne.taux_engagement)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatTauxPct(ligne.taux_caisse)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={pendingFile !== null}
        title="Remplacer le tableau finances ?"
        description="L’import écrasera entièrement le contenu actuel par les lignes du fichier Excel."
        confirmLabel="Importer et remplacer"
        loading={importMutation.isPending}
        onCancel={() => setPendingFile(null)}
        onConfirm={() => {
          if (pendingFile) importMutation.mutate(pendingFile);
        }}
      />
    </>
  );
}
