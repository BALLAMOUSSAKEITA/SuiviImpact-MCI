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
        <p className="text-sm text-silver-mist">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="login-shell flex min-h-screen flex-col">
      <div className="aurora-ribbon" aria-hidden />
      <main className="relative z-[1] flex flex-1 items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-[980px] items-center gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
          <section className="hidden text-center lg:block lg:text-left">
            <div className="mb-8 flex items-center justify-center gap-4 lg:justify-start">
              <div className="flex h-14 w-14 items-center justify-center rounded-card border border-cloud bg-veil text-bioluminescent-teal">
                <Building2 className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-mono-label text-silver-mist">{BRAND.country}</p>
                <p className="text-sm font-medium text-warm-sand">{BRAND.ministry}</p>
              </div>
            </div>

            <p className="font-mono-label text-bioluminescent-teal">Plateforme MCI</p>
            <h1 className="mt-3 font-display text-5xl leading-none tracking-[-0.02em] text-canvas-white lg:text-6xl">
              {BRAND.appName}
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-warm-sand">{BRAND.tagline}</p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-cloud bg-veil px-4 py-2.5 text-sm text-warm-sand">
              <ShieldCheck className="h-4 w-4 shrink-0 text-bioluminescent-teal" />
              <span>
                {BRAND.bureau} · {BRAND.program}
              </span>
            </div>
          </section>

          <section className="mx-auto w-full max-w-[400px]">
            <div className="login-card">
              <div className="mb-6 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-card border border-cloud bg-veil text-bioluminescent-teal">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-xl text-canvas-white">{BRAND.appName}</p>
                    <p className="text-xs text-silver-mist">
                      {BRAND.ministryShort} · {BRAND.bureauShort}
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="font-display text-xl text-canvas-white">Connexion</h2>
              <p className="mt-1 text-sm text-silver-mist">{BRAND.loginSubtitle}</p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
                <input
                  {...register("username")}
                  placeholder="Identifiant"
                  autoComplete="username"
                  className="login-input"
                />
                {errors.username && (
                  <p className="text-xs text-red-300">{errors.username.message}</p>
                )}

                <input
                  type="password"
                  {...register("password")}
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                  className="login-input"
                />
                {errors.password && (
                  <p className="text-xs text-red-300">{errors.password.message}</p>
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

      <footer className="relative z-[1] border-t border-cloud px-6 py-4 text-center text-xs text-ash">
        © {new Date().getFullYear()} {BRAND.country} · {BRAND.ministry} · {BRAND.bureau}
      </footer>
    </div>
  );
}
