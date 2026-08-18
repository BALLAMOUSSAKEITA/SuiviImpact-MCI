"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { FlagStripe } from "@/components/flag-stripe";
import { LiveQrPresenceDisplay } from "@/components/live-qr-presence-display";
import { buttonVariants } from "@/components/ui/button";
import { getSeancePresenceDetail } from "@/lib/api";
import { cn } from "@/lib/utils";

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

export default function SeanceAffichagePage() {
  const params = useParams();
  const seanceId = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ["presence-seance", seanceId],
    queryFn: () => getSeancePresenceDetail(seanceId),
    enabled: Number.isFinite(seanceId),
  });

  if (isLoading || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f9f6] text-[#5A6B63]">
        {isLoading ? "Chargement…" : "Séance introuvable"}
      </div>
    );
  }

  if (data.statut !== "ouverte") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f9f6] px-4 text-center">
        <p className="font-semibold text-[#1A3D2E]">Séance clôturée</p>
        <p className="mt-2 text-sm text-[#5A6B63]">Le QR dynamique n&apos;est plus actif.</p>
        <Link
          href={`/admin/presence/seances/${seanceId}`}
          className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
        >
          Retour à la séance
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-auto bg-[#f6faf7]">
      <FlagStripe className="h-1.5 w-full shrink-0" />
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <LiveQrPresenceDisplay
          seanceId={seanceId}
          titre={data.titre}
          dateLabel={formatDate(data.date_seance)}
        />
      </div>
    </div>
  );
}
