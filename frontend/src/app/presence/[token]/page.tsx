"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";

import { getPublicSeanceInfo, publicCheckIn } from "@/lib/api";
import { BRAND } from "@/lib/brand";

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

export default function PublicPresencePage() {
  const params = useParams();
  const token = String(params.token ?? "");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [result, setResult] = useState<{
    type: "success" | "error" | "info";
    message: string;
    nom?: string;
  } | null>(null);

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
      });
      if (res.success && !res.deja_pointe) {
        setDigits(["", "", "", ""]);
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
      const el = document.getElementById(`digit-${index + 1}`);
      el?.focus();
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
      const el = document.getElementById(`digit-${index - 1}`);
      el?.focus();
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

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-[#f6faf7] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-ink">
            {BRAND.appName}
          </p>
          <h1 className="mt-2 font-display text-xl font-semibold text-graphite">
            Pointage de présence
          </h1>
        </div>

        <div className="panel-grain shadow-sm">
          {isLoading && <p className="py-8 text-center text-ash">Chargement…</p>}

          {error && (
            <p className="py-8 text-center text-red-600">
              Séance introuvable ou lien invalide.
            </p>
          )}

          {seance && (
            <>
              <div className="mb-6 text-center">
                <p className="font-semibold text-graphite">{seance.titre}</p>
                <p className="mt-1 text-sm text-slate">{formatDate(seance.date_seance)}</p>
                {closed && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Cette réunion est terminée. Le pointage n&apos;est plus possible.
                  </p>
                )}
              </div>

              {!closed && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="label-grain text-center">
                      Entrez votre code à 4 chiffres
                    </label>
                    <div className="mt-3 flex justify-center gap-3">
                      {digits.map((d, i) => (
                        <input
                          key={i}
                          id={`digit-${i}`}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          value={d}
                          onChange={(e) => handleDigit(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          className="h-14 w-12 rounded-lg border border-hairline bg-white text-center font-mono text-2xl font-bold text-graphite focus:border-forest-ink focus:outline-none focus:ring-2 focus:ring-[#e0f5ea]"
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={checkInMutation.isPending || digits.join("").length !== 4}
                    className="w-full rounded-lg bg-forest-ink py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {checkInMutation.isPending ? "Vérification…" : "Confirmer ma présence"}
                  </button>
                </form>
              )}

              {result && (
                <div
                  className={`mt-6 rounded-lg px-4 py-3 text-center text-sm ${
                    result.type === "success"
                      ? "bg-[#e0f5ea] text-forest-ink"
                      : result.type === "info"
                        ? "bg-blue-50 text-blue-800"
                        : "bg-red-50 text-red-700"
                  }`}
                >
                  {result.nom && result.type === "success" && (
                    <p className="mb-1 font-semibold">{result.nom}</p>
                  )}
                  <p>{result.message}</p>
                </div>
              )}
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ash">
          Ministère de l&apos;Industrie et du Commerce — Conseil de Cabinet
        </p>
      </div>
    </div>
  );
}
