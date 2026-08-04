"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchHealth } from "@/lib/api";

export function ApiStatusCard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
  });

  return (
    <Card className="w-full max-w-md shadow-[var(--shadow-elevated)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-card bg-veil">
            <Activity className="h-5 w-5 text-forest-ink" />
          </span>
          Statut de l&apos;API
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-fog">Vérification en cours…</p>
        )}
        {isError && (
          <div className="flex items-start gap-2 text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">
              {(error as Error).message ?? "Connexion impossible à l'API"}
            </p>
          </div>
        )}
        {data && (
          <div className="flex items-center gap-2 text-forest-ink">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">
              API opérationnelle — statut : {data.status}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LandingHero() {
  return (
    <div className="grain-gradient flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-12 text-center">
        <div className="space-y-6">
          <span className="badge-grain mx-auto inline-flex gap-2">
            MIPME — République de Guinée
          </span>
          <h1 className="font-display text-[38px] leading-[1.25] text-graphite sm:text-[42px]">
            SuiviImpact
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-slate">
            Plateforme de gestion et de suivi d&apos;impact du Bureau de Suivi
            et de Développement (BSD) — MIPME Guinée.
          </p>
        </div>

        <ApiStatusCard />

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/connexion">
            <Button size="lg">Se connecter</Button>
          </Link>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/docs`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">
              Documentation API
            </Button>
          </a>
        </div>

        <p className="text-xs text-ash">Bureau de Suivi et de Développement</p>
      </div>
    </div>
  );
}
