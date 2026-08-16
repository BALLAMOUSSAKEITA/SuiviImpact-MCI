"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

import { BRAND } from "@/lib/brand";

interface QrPresencePrintSheetProps {
  titre: string;
  dateLabel: string;
  checkInUrl: string;
}

export function QrPresencePrintSheet({
  titre,
  dateLabel,
  checkInUrl,
}: QrPresencePrintSheetProps) {
  return (
    <div className="qr-print-sheet mx-auto max-w-lg text-center">
      <div className="qr-print-header mb-6 border-b-2 border-[#009959] pb-5">
        <Image
          src="/branding/armoiries-guinee.jpg"
          alt="Armoiries de la République de Guinée"
          width={72}
          height={72}
          className="mx-auto mb-3 rounded-full"
        />
        <p className="text-xs italic tracking-wide text-[#5A6B63]">{BRAND.motto.replace(/·/g, " - ")}</p>
        <p className="mt-2 font-display text-sm font-bold uppercase tracking-wide text-[#1A3D2E]">
          {BRAND.ministry}
        </p>
        <p className="mt-1 text-xs font-medium text-[#5A6B63]">
          {BRAND.bureau} ({BRAND.bureauShort})
        </p>
      </div>

      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#009959]">
          Pointage de présence
        </p>
        <h2 className="mt-2 font-display text-lg font-bold text-graphite">{titre}</h2>
        <p className="mt-1 text-sm text-slate">{dateLabel}</p>
      </div>

      <div className="mx-auto inline-block rounded-xl border-2 border-[#009959] bg-white p-5 shadow-sm">
        <QRCodeSVG value={checkInUrl} size={240} level="M" includeMargin fgColor="#0d4f38" />
      </div>

      <div className="mt-6 space-y-2 text-sm text-slate">
        <p className="font-semibold text-graphite">Comment pointer votre présence ?</p>
        <ol className="mx-auto max-w-xs space-y-1 text-left text-[13px]">
          <li>1. Scannez le QR code avec votre téléphone</li>
          <li>2. Saisissez votre code personnel à 4 chiffres</li>
          <li>3. Confirmez — votre présence est enregistrée</li>
        </ol>
      </div>

      <p className="mt-6 text-[10px] text-ash">{BRAND.appName} — {BRAND.country}</p>
    </div>
  );
}
