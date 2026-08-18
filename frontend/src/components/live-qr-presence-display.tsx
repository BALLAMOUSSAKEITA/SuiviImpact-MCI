"use client";

import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";

import { getSeanceQrLive } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LiveQrPresenceDisplayProps {
  seanceId: number;
  titre: string;
  dateLabel: string;
  /** Plein écran pour tablette à l'entrée */
  fullscreen?: boolean;
  className?: string;
}

export function LiveQrPresenceDisplay({
  seanceId,
  titre,
  dateLabel,
  fullscreen = false,
  className,
}: LiveQrPresenceDisplayProps) {
  const [now, setNow] = useState(() => Date.now());
  const [anchor, setAnchor] = useState<{ at: number; expiresIn: number } | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["presence-qr-live", seanceId],
    queryFn: () => getSeanceQrLive(seanceId),
    enabled: Number.isFinite(seanceId),
    refetchInterval: (query) => {
      const expiresIn = query.state.data?.expires_in ?? 20;
      return Math.max(2000, Math.min(expiresIn * 500, 10_000));
    },
  });

  useEffect(() => {
    if (data) {
      setAnchor({ at: Date.now(), expiresIn: data.expires_in });
    }
  }, [data?.qr_pass, data?.expires_in]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const checkInUrl = useMemo(() => {
    if (!data || typeof window === "undefined") return "";
    return `${window.location.origin}${data.check_in_path}`;
  }, [data]);

  const countdown = useMemo(() => {
    if (!anchor) return 0;
    return Math.max(0, anchor.expiresIn - Math.floor((now - anchor.at) / 1000));
  }, [anchor, now]);

  const shell = cn(
    "text-center",
    fullscreen
      ? "flex min-h-screen flex-col items-center justify-center bg-[#f4f9f6] px-6 py-10"
      : className,
  );

  if (isLoading) {
    return (
      <div className={shell}>
        <p className="text-sm text-[#5A6B63]">Génération du QR code…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={shell}>
        <p className="text-sm text-red-600">QR indisponible (séance clôturée ?)</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-sm font-semibold text-[#0d4f38] underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={shell}>
      {fullscreen && (
        <div className="mb-8 max-w-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#009959]">
            Pointage de présence — scannez ici
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-[#1A3D2E]">{titre}</h1>
          <p className="mt-1 text-sm capitalize text-[#5A6B63]">{dateLabel}</p>
        </div>
      )}

      <div
        className={cn(
          "mx-auto inline-block rounded-2xl border-2 border-[#009959] bg-white p-6 shadow-sm",
          fullscreen && "p-8",
        )}
      >
        {checkInUrl ? (
          <QRCodeSVG
            value={checkInUrl}
            size={fullscreen ? 320 : 220}
            level="M"
            includeMargin
            fgColor="#0d4f38"
          />
        ) : null}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-sm font-medium text-[#1A3D2E]">
          Nouveau QR dans{" "}
          <span className="font-mono tabular-nums text-[#009959]">{countdown}s</span>
        </p>
        <p className="text-xs text-[#5A6B63]">
          Validité {data.ttl_seconds}s — ne partagez pas le lien
        </p>
      </div>

      {!fullscreen && (
        <p className="mt-3 text-xs text-[#5A6B63]">
          Affichez en plein écran sur une tablette à l&apos;entrée
        </p>
      )}
    </div>
  );
}
