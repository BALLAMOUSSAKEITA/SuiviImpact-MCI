"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";

import { QrPresencePrintSheet } from "@/components/qr-presence-print-sheet";
import { getSeanceQrLive } from "@/lib/api";

interface LiveQrPresenceDisplayProps {
  seanceId: number;
  titre: string;
  dateLabel: string;
}

/** QR rotatif — même habillage que la feuille imprimable, sans indication de validité à l'écran. */
export function LiveQrPresenceDisplay({
  seanceId,
  titre,
  dateLabel,
}: LiveQrPresenceDisplayProps) {
  const lastUrlRef = useRef("");

  const { data, isError, refetch } = useQuery({
    queryKey: ["presence-qr-live", seanceId],
    queryFn: () => getSeanceQrLive(seanceId),
    enabled: Number.isFinite(seanceId),
    refetchInterval: (query) => {
      const expiresIn = query.state.data?.expires_in ?? 20;
      return Math.max(2000, Math.min(expiresIn * 500, 10_000));
    },
  });

  const checkInUrl = useMemo(() => {
    if (!data || typeof window === "undefined") return lastUrlRef.current;
    const url = `${window.location.origin}${data.check_in_path}`;
    lastUrlRef.current = url;
    return url;
  }, [data]);

  useEffect(() => {
    if (isError) {
      const id = window.setInterval(() => refetch(), 5000);
      return () => window.clearInterval(id);
    }
  }, [isError, refetch]);

  if (isError && !checkInUrl) {
    return (
      <p className="py-6 text-center text-sm text-slate">
        QR indisponible — séance clôturée ou erreur réseau.
      </p>
    );
  }

  return (
    <QrPresencePrintSheet
      titre={titre}
      dateLabel={dateLabel}
      checkInUrl={checkInUrl}
    />
  );
}
