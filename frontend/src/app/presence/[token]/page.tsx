"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

import { FlagStripe } from "@/components/flag-stripe";
import { getPublicSeanceInfo, publicCheckIn } from "@/lib/api";
import { BRAND } from "@/lib/brand";
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

type ResultState = {
  type: "success" | "error" | "info";
  message: string;
  nom?: string;
  fonction?: string;
};

export default function PublicPresencePage() {
  const params = useParams();
  const token = String(params.token ?? "");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [result, setResult] = useState<ResultState | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { data: seance, isLoading, error } = useQuery({
    queryKey: ["public-seance", token],
    queryFn: () => getPublicSeanceInfo(token),
    enabled: Boolean(token),
  });

  const checkInMutation = useMutation({
    mutationFn: (code: string) => publicCheckIn(token, code),
    onSuccess: (res) => {
      setResult({
        type: res.success ? (res.deja_pointe ? "info" : "success") : "error",
        message: res.message,
        nom: res.nom_complet ?? undefined,
        fonction: res.fonction ?? undefined,
      });
      if (res.success && !res.deja_pointe) {
        setDigits(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    },
    onError: (e: Error) => {
      setResult({ type: "error", message: e.message });
    },
  });

  const handleDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setResult(null);

    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 3) {
      const code = next.join("");
      if (code.length === 4) {
        checkInMutation.mutate(code);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 0) return;
    e.preventDefault();
    const next = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i += 1) {
      next[i] = pasted[i];
    }
    setDigits(next);
    setResult(null);
    if (pasted.length === 4) {
      checkInMutation.mutate(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length === 4) {
      checkInMutation.mutate(code);
    }
  };

  const closed = seance?.statut === "fermee";
  const codeComplete = digits.join("").length === 4;
  const showForm = seance && !closed && result?.type !== "success";

  return (
    <div className="flex min-h-full flex-col bg-[#f4f9f6]">
      <FlagStripe className="h-1.5 w-full shrink-0" />

      <header className="border-b border-[#d8e8df] bg-white">
        <div className="mx-auto flex max-w-lg items-center gap-4 px-4 py-5">
          <Image
            src="/branding/armoiries-guinee.jpg"
            alt="Armoiries de la République de Guinée"
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
            priority
          />
          <div className="min-w-0">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0d4f38]">
              {BRAND.country}
            </p>
            <p className="font-display text-sm font-bold leading-snug text-[#1A3D2E]">
              {BRAND.ministry}
            </p>
            <p className="text-xs text-[#5A6B63]">
              {BRAND.bureau} ({BRAND.bureauShort})
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#009959]">
            Pointage de présence
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-[#1A3D2E]">
            Conseil de Cabinet
          </h1>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#d8e8df] bg-white shadow-[0_8px_30px_rgba(13,79,56,0.08)]">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-[#5A6B63]">
              <Loader2 className="h-5 w-5 animate-spin text-[#009959]" />
              <span>Chargement de la séance…</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="font-semibold text-[#1A3D2E]">Lien invalide</p>
              <p className="text-sm text-[#5A6B63]">
                Séance introuvable ou QR code expiré. Contactez le BSD.
              </p>
            </div>
          )}

          {seance && (
            <>
              <div className="border-b border-[#e8f2ec] bg-gradient-to-b from-[#f8fcf9] to-white px-6 py-5 text-center">
                <p className="font-display text-lg font-bold text-[#1A3D2E]">{seance.titre}</p>
                <p className="mt-1 text-sm capitalize text-[#5A6B63]">
                  {formatDate(seance.date_seance)}
                </p>
                <span
                  className={cn(
                    "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                    closed
                      ? "bg-amber-50 text-amber-800"
                      : "bg-[#e0f5ea] text-[#0d4f38]",
                  )}
                >
                  {closed ? "Séance clôturée" : "Pointage ouvert"}
                </span>
              </div>

              <div className="px-6 py-6">
                {closed && (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <Info className="h-10 w-10 text-amber-600" />
                    <p className="text-sm text-[#5A6B63]">
                      Cette réunion est terminée. Le pointage n&apos;est plus possible.
                    </p>
                  </div>
                )}

                {showForm && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-center text-sm font-medium text-[#1A3D2E]">
                        Entrez votre code personnel à 4 chiffres
                      </label>
                      <p className="mt-1 text-center text-xs text-[#5A6B63]">
                        Code remis par le BSD — confidentiel
                      </p>
                      <div
                        className="mt-5 flex justify-center gap-2.5 sm:gap-3"
                        onPaste={handlePaste}
                      >
                        {digits.map((d, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              inputRefs.current[i] = el;
                            }}
                            id={`digit-${i}`}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={1}
                            value={d}
                            onChange={(e) => handleDigit(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className={cn(
                              "h-16 w-14 rounded-xl border-2 bg-[#fafcfa] text-center font-mono text-3xl font-bold text-[#1A3D2E] transition-colors",
                              "focus:border-[#009959] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#009959]/15",
                              d ? "border-[#009959]/60" : "border-[#d8e8df]",
                            )}
                            autoFocus={i === 0}
                            aria-label={`Chiffre ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={checkInMutation.isPending || !codeComplete}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d4f38] py-3.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {checkInMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Vérification…
                        </>
                      ) : (
                        "Confirmer ma présence"
                      )}
                    </button>
                  </form>
                )}

                {result && (
                  <div
                    className={cn(
                      "rounded-xl px-5 py-6 text-center",
                      result.type === "success" && "bg-[#e8f7ef]",
                      result.type === "info" && "bg-blue-50",
                      result.type === "error" && "bg-red-50",
                      showForm && "mt-6",
                    )}
                  >
                    {result.type === "success" && (
                      <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-[#009959]" />
                    )}
                    {result.type === "info" && (
                      <Info className="mx-auto mb-3 h-10 w-10 text-blue-600" />
                    )}
                    {result.type === "error" && (
                      <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
                    )}

                    {result.nom && (
                      <p className="font-display text-lg font-bold text-[#1A3D2E]">{result.nom}</p>
                    )}
                    {result.fonction && (
                      <p className="mt-1 text-sm leading-snug text-[#5A6B63]">{result.fonction}</p>
                    )}

                    <p
                      className={cn(
                        "text-sm",
                        result.nom ? "mt-3" : "",
                        result.type === "success" && "text-[#0d4f38]",
                        result.type === "info" && "text-blue-800",
                        result.type === "error" && "text-red-700",
                      )}
                    >
                      {result.message}
                    </p>

                    {result.type === "success" && (
                      <p className="mt-4 text-xs text-[#5A6B63]">
                        Vous pouvez fermer cette page.
                      </p>
                    )}

                    {result.type === "error" && (
                      <button
                        type="button"
                        onClick={() => {
                          setResult(null);
                          setDigits(["", "", "", ""]);
                          inputRefs.current[0]?.focus();
                        }}
                        className="mt-4 text-sm font-semibold text-[#0d4f38] underline-offset-2 hover:underline"
                      >
                        Réessayer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-[#5A6B63]">
          {BRAND.appName} — {BRAND.motto.replace(/·/g, " · ")}
          <br />
          {BRAND.institutionFull}
        </p>
      </main>
    </div>
  );
}
