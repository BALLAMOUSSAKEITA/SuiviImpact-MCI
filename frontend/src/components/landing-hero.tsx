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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-emerald-700" />
          Statut de l&apos;API
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-zinc-500">Vérification en cours…</p>
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
          <div className="flex items-center gap-2 text-emerald-700">
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-6 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            MIPME — République de Guinée
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            SuiviImpact
          </h1>
          <p className="mx-auto max-w-xl text-lg text-zinc-600">
            Plateforme de gestion et de suivi d&apos;impact du Bureau de Suivi
            et de Développement (BSD) — refonte Next.js + FastAPI.
          </p>
        </div>

        <ApiStatusCard />

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/connexion">
            <Button size="lg">Se connecter</Button>
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">
              Documentation API
            </Button>
          </a>
        </div>

        <p className="text-xs text-zinc-400">Sprint 0 — Fondations</p>
      </div>
    </div>
  );
}
