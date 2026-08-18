"use client";

import { QRCodeSVG } from "qrcode.react";

import { BRAND } from "@/lib/brand";

interface QrPresencePrintSheetProps {
  titre: string;
  dateLabel: string;
  checkInUrl: string;
  printRootId?: string;
  /** Mention sur feuille imprimée (QR statique de secours) */
  backupMode?: boolean;
}

export function QrPresencePrintSheet({
  titre,
  dateLabel,
  checkInUrl,
  printRootId = "qr-print-area",
  backupMode = false,
}: QrPresencePrintSheetProps) {
  return (
    <div id={printRootId} className="qr-print-sheet mx-auto max-w-lg text-center">
      <div className="mb-6 border-b-2 border-[#009959] pb-5">
        {/* img natif pour une impression fiable (Next/Image pose souvent problème à l'impression) */}
        <img
          src="/branding/armoiries-guinee.jpg"
          alt="Armoiries de la République de Guinée"
          width={72}
          height={72}
          className="mx-auto mb-3 rounded-full"
        />
        <p className="text-xs italic tracking-wide text-[#5A6B63]">
          {BRAND.motto.replace(/·/g, " - ")}
        </p>
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
        {backupMode && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-900">
            QR de secours (lien fixe) — préférez l&apos;affichage dynamique à l&apos;entrée
          </p>
        )}
        <h2 className="mt-2 font-display text-lg font-bold text-[#1A3D2E]">{titre}</h2>
        <p className="mt-1 text-sm text-[#5A6B63]">{dateLabel}</p>
      </div>

      <div className="mx-auto inline-block rounded-xl border-2 border-[#009959] bg-white p-5">
        {checkInUrl ? (
          <QRCodeSVG value={checkInUrl} size={240} level="M" includeMargin fgColor="#0d4f38" />
        ) : (
          <div className="flex h-[240px] w-[240px] items-center justify-center text-sm text-[#5A6B63]">
            QR indisponible
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2 text-sm text-[#5A6B63]">
        <p className="font-semibold text-[#1A3D2E]">Comment pointer votre présence ?</p>
        <ol className="mx-auto max-w-xs space-y-1 text-left text-[13px]">
          <li>1. Scannez le QR code avec votre téléphone</li>
          <li>2. Saisissez votre code personnel à 4 chiffres</li>
          <li>3. Confirmez — votre présence est enregistrée</li>
        </ol>
      </div>

      <p className="mt-6 text-[10px] text-[#5A6B63]">
        {BRAND.appName} — {BRAND.country}
      </p>
    </div>
  );
}

const PRINT_PAGE_STYLES = `
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 24px;
    font-family: "Segoe UI", system-ui, sans-serif;
    color: #1A3D2E;
    background: #fff;
  }
  .qr-print-sheet {
    max-width: 520px;
    margin: 0 auto;
    text-align: center;
  }
  img { display: block; margin: 0 auto 12px; border-radius: 9999px; }
  h2 { margin: 8px 0 4px; font-size: 18px; }
  ol { padding-left: 1.25rem; margin: 0 auto; max-width: 280px; text-align: left; }
  svg { display: block; margin: 0 auto; }
`;

function buildPrintDocument(html: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>QR code — pointage de présence</title>
  <style>${PRINT_PAGE_STYLES}</style>
</head>
<body>
  <div class="qr-print-sheet">${html}</div>
</body>
</html>`;
}

/** Impression via iframe cachée — fonctionne sans autoriser les pop-ups. */
export function printQrPresenceSheet(rootId = "qr-print-area"): boolean {
  const sheet = document.getElementById(rootId);
  if (!sheet) return false;

  const origin = window.location.origin;
  const html = sheet.innerHTML.replace(
    'src="/branding/',
    `src="${origin}/branding/`,
  );

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("title", "Impression QR code");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    visibility: "hidden",
  });
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument ?? win?.document;
  if (!win || !doc) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(buildPrintDocument(html));
  doc.close();

  let printed = false;
  const cleanup = () => {
    iframe.remove();
  };

  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    win.focus();
    win.print();
    win.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(cleanup, 60_000);
  };

  const img = doc.querySelector("img");
  if (img && !img.complete) {
    img.addEventListener("load", triggerPrint, { once: true });
    img.addEventListener("error", triggerPrint, { once: true });
  }

  win.addEventListener("load", () => {
    window.setTimeout(triggerPrint, 150);
  });

  window.setTimeout(triggerPrint, 400);

  return true;
}

/** @deprecated Utiliser printQrPresenceSheet */
export function openQrPrintWindow(rootId = "qr-print-area"): boolean {
  return printQrPresenceSheet(rootId);
}
