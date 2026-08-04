"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BarChart3,
  ClipboardList,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  username: z.string().min(1, "Identifiant requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

const FEATURES = [
  { label: "Plan d'action OCT / OMT / OLT", color: "bg-tangerine", icon: Target },
  { label: "Suivi & exécution PAO", color: "bg-vivid-green", icon: ClipboardList },
  { label: "Statistiques & indicateurs", color: "bg-lavender", icon: BarChart3 },
] as const;

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      await login(data);
      toast.success("Connexion réussie");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dub-dot-grid flex min-h-screen items-center justify-center">
        <p className="text-sm text-fog">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="dub-dot-grid flex min-h-screen flex-col">
      <header className="border-b border-ash bg-canvas-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-btn)] bg-midnight-ink text-xs font-bold text-canvas-white">
              SI
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal">{BRAND.appName}</p>
              <p className="text-[11px] text-fog">{BRAND.ministryShort}</p>
            </div>
          </div>
          <p className="hidden text-xs text-silver sm:block">{BRAND.country}</p>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="grid w-full max-w-[1100px] items-center gap-10 lg:grid-cols-[1.1fr_400px] lg:gap-16">
          <section className="text-center lg:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-electric-blue">
              {BRAND.ministry}
            </p>
            <h1 className="font-display mt-3 text-[2.5rem] leading-[1.05] text-charcoal sm:text-[3rem] lg:text-[3.25rem]">
              Suivi d&apos;impact
              <span className="text-electric-blue"> MIPME</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-steel lg:mx-0">
              {BRAND.tagline}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {FEATURES.map(({ label, color, icon: Icon }) => (
                <span key={label} className="dub-pill">
                  <span className={cn("dub-pill-dot", color)} />
                  <Icon className="h-3.5 w-3.5 text-charcoal" strokeWidth={2} />
                  {label}
                </span>
              ))}
            </div>

            <p className="mt-8 text-xs text-silver">
              {BRAND.bureau} · {BRAND.program}
            </p>
          </section>

          <section className="mx-auto w-full max-w-[400px]">
            <div className="dub-card-elevated">
              <h2 className="text-lg font-semibold text-charcoal">Connexion</h2>
              <p className="mt-1 text-sm text-fog">{BRAND.loginSubtitle}</p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                  <label className="label-dub" htmlFor="username">
                    Identifiant
                  </label>
                  <input
                    id="username"
                    {...register("username")}
                    autoComplete="username"
                    className="dub-input"
                  />
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="label-dub" htmlFor="password">
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...register("password")}
                    autoComplete="current-password"
                    className="dub-input"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-10 w-full rounded-[var(--radius-pill)] text-sm font-semibold"
                  disabled={submitting}
                >
                  {submitting ? "Connexion…" : "Se connecter"}
                </Button>
              </form>

              <p className="mt-5 border-t border-ash pt-4 text-center text-[11px] leading-relaxed text-silver">
                Accès réservé au personnel autorisé du {BRAND.bureauShort}.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-ash bg-canvas-white px-6 py-3 text-center text-[11px] text-silver">
        © {new Date().getFullYear()} {BRAND.country} · {BRAND.ministry}
      </footer>
    </div>
  );
}
