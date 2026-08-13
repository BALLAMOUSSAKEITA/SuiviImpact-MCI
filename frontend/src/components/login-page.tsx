"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import Image from "next/image";
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

const LOGOS = [
  {
    src: "/branding/embleme-guinee.jpg",
    alt: "Armoiries de la République de Guinée",
    className: "login-logo-emblem",
  },
  {
    src: "/branding/guinee-nimba.png",
    alt: "Logo Guinée — masque Nimba",
    className: "login-logo-nimba",
  },
  {
    src: "/branding/simandou-2040.png",
    alt: "Simandou 2040",
    className: "login-logo-simandou",
  },
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
      <div className="login-shell flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--guinea-green)]/25 border-t-[var(--guinea-green)]" />
          <p className="text-sm text-fog">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-shell flex min-h-screen flex-col">
      <div className="login-flag-stripe" aria-hidden="true" />

      <header className="login-brand-bar px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-4">
          <div className="text-center animate-fade-in">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--guinea-red)]">
              {BRAND.country}
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug text-graphite sm:text-base">
              {BRAND.ministry}
            </p>
            <p className="text-xs text-slate">{BRAND.bureau}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 animate-fade-in">
            {LOGOS.map((logo) => (
              <div key={logo.src} className={`login-logo-chip ${logo.className}`}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={180}
                  height={90}
                  className="h-12 w-auto object-contain sm:h-14"
                  priority
                />
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid w-full max-w-[1100px] items-center gap-10 lg:grid-cols-[1.05fr_420px] lg:gap-16">
          <section className="hidden lg:block">
            <div className="login-hero-panel animate-fade-in">
              <div className="flex items-start gap-5">
                <Image
                  src="/branding/embleme-guinee.jpg"
                  alt=""
                  width={120}
                  height={140}
                  className="h-[7.5rem] w-auto shrink-0 object-contain"
                  aria-hidden
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--guinea-gold)]">
                    Travail · Justice · Solidarité
                  </p>
                  <h1 className="mt-2 font-display text-[2.6rem] leading-[1.08] tracking-tight text-graphite">
                    {BRAND.appName}
                  </h1>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-slate">
                    {BRAND.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="login-pill">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--guinea-green)]" />
                  <span>
                    {BRAND.bureauShort} · {BRAND.program}
                  </span>
                </div>
                <div className="login-pill login-pill-dark">
                  <Image
                    src="/branding/simandou-2040.png"
                    alt="Simandou 2040"
                    width={120}
                    height={40}
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <div className="login-pill">
                  <Image
                    src="/branding/guinee-nimba.png"
                    alt="Guinée"
                    width={100}
                    height={36}
                    className="h-7 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-[420px] animate-scale-in">
            <div className="login-card">
              <div className="mb-5 flex items-center gap-3 lg:hidden">
                <Image
                  src="/branding/embleme-guinee.jpg"
                  alt="Armoiries nationales"
                  width={48}
                  height={54}
                  className="h-12 w-auto object-contain"
                />
                <div>
                  <p className="font-display text-xl text-graphite">{BRAND.appName}</p>
                  <p className="text-xs text-slate">
                    {BRAND.ministryShort} · {BRAND.bureauShort}
                  </p>
                </div>
              </div>

              <div className="mb-5 flex items-center justify-center gap-3 lg:hidden">
                <div className="login-logo-chip login-logo-nimba px-2 py-1">
                  <Image
                    src="/branding/guinee-nimba.png"
                    alt="Guinée"
                    width={90}
                    height={32}
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div className="login-logo-chip login-logo-simandou px-2 py-1">
                  <Image
                    src="/branding/simandou-2040.png"
                    alt="Simandou 2040"
                    width={110}
                    height={36}
                    className="h-8 w-auto object-contain"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold tracking-tight text-graphite">Connexion</h2>
              <p className="mt-1 text-sm text-slate">{BRAND.loginSubtitle}</p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                  <input
                    {...register("username")}
                    placeholder="Identifiant"
                    autoComplete="username"
                    className="login-input"
                  />
                  {errors.username && (
                    <p className="mt-1.5 text-xs font-medium text-[var(--guinea-red)]">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    {...register("password")}
                    placeholder="Mot de passe"
                    autoComplete="current-password"
                    className="login-input"
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs font-medium text-[var(--guinea-red)]">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="login-submit mt-2 h-12 w-full text-base"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Connexion en cours…
                    </span>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>

              <p className="mt-6 border-t border-cloud/60 pt-4 text-center text-xs leading-relaxed text-ash">
                Plateforme sécurisée — accès réservé au personnel autorisé.
                <br />
                En cas de problème, contactez l&apos;administrateur {BRAND.bureauShort}.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-cloud/80 bg-white/80 px-6 py-4 text-center text-xs text-slate backdrop-blur-sm">
        <p className="font-medium text-graphite">
          Travail · Justice · Solidarité
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} {BRAND.country} · {BRAND.ministry} · {BRAND.bureau}
        </p>
      </footer>
    </div>
  );
}
