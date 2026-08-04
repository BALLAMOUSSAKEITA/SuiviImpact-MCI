"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

const loginSchema = z.object({
  username: z.string().min(1, "Identifiant requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

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
      <div className="login-shell flex min-h-screen items-center justify-center">
        <p className="text-sm text-fog">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="login-shell flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-[980px] items-center gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
          {/* Colonne institutionnelle — style Facebook */}
          <section className="hidden text-center lg:block lg:text-left">
            <div className="mb-8 flex items-center justify-center gap-4 lg:justify-start">
              <div className="flex h-14 w-14 items-center justify-center rounded-card bg-forest-ink text-paper shadow-[var(--shadow-card)]">
                <Building2 className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-fog">
                  {BRAND.country}
                </p>
                <p className="text-sm font-semibold text-slate">{BRAND.ministry}</p>
              </div>
            </div>

            <h1 className="font-display text-[3.25rem] leading-[1.05] text-forest-ink">
              {BRAND.appName}
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-slate">
              {BRAND.tagline}
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-card border border-cloud bg-paper px-4 py-2.5 text-sm text-slate shadow-[var(--shadow-card)]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-forest-ink" />
              <span>
                {BRAND.bureau} · {BRAND.program}
              </span>
            </div>
          </section>

          {/* Formulaire de connexion */}
          <section className="mx-auto w-full max-w-[400px]">
            <div className="login-card">
              <div className="mb-6 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-card bg-forest-ink text-paper">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-xl text-forest-ink">{BRAND.appName}</p>
                    <p className="text-xs text-fog">{BRAND.ministryShort} · {BRAND.bureauShort}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-graphite">Connexion</h2>
              <p className="mt-1 text-sm text-fog">{BRAND.loginSubtitle}</p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
                <input
                  {...register("username")}
                  placeholder="Identifiant"
                  autoComplete="username"
                  className="login-input"
                />
                {errors.username && (
                  <p className="text-xs text-red-600">{errors.username.message}</p>
                )}

                <input
                  type="password"
                  {...register("password")}
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                  className="login-input"
                />
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}

                <Button
                  type="submit"
                  className="mt-2 h-12 w-full text-base font-semibold"
                  disabled={submitting}
                >
                  {submitting ? "Connexion en cours…" : "Se connecter"}
                </Button>
              </form>

              <p className="mt-6 border-t border-cloud pt-4 text-center text-xs leading-relaxed text-ash">
                Plateforme sécurisée — accès réservé au personnel autorisé.
                <br />
                En cas de problème, contactez l&apos;administrateur {BRAND.bureauShort}.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-cloud/80 bg-paper px-6 py-4 text-center text-xs text-ash">
        © {new Date().getFullYear()} {BRAND.country} · {BRAND.ministry} · {BRAND.bureau}
      </footer>
    </div>
  );
}
