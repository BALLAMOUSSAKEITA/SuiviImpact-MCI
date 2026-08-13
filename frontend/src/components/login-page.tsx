"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/auth-provider";
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
      <div className="login-page grid min-h-screen place-items-center">
        <p className="text-sm text-[#4a6b5c]">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="login-page flex min-h-screen flex-col">
      <div className="login-flag" aria-hidden="true">
        <span className="bg-[#ce1126]" />
        <span className="bg-[#fcd116]" />
        <span className="bg-[#009460]" />
      </div>

      <header className="login-masthead">
        <div className="login-wrap login-masthead-inner">
          <div className="flex min-w-0 items-center gap-4">
            <Image
              src="/branding/armoiries-guinee.jpg"
              alt="Armoiries de la République de Guinée"
              width={72}
              height={80}
              className="h-[4.25rem] w-auto shrink-0 object-contain sm:h-[4.75rem]"
              priority
            />
            <div className="min-w-0">
              <p className="login-serif text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0d4f38]">
                {BRAND.country}
              </p>
              <p className="login-serif mt-1 text-[1.05rem] font-semibold leading-snug text-[#0d4f38] sm:text-[1.2rem]">
                {BRAND.ministry}
              </p>
              <p className="mt-0.5 text-[13px] text-[#4a6b5c]">{BRAND.bureau}</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 sm:flex">
            <Image
              src="/branding/guinee-nimba.png"
              alt="Guinée"
              width={110}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
            <Image
              src="/branding/simandou-2040.png"
              alt="Programme Simandou 2040"
              width={180}
              height={72}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>
        </div>
      </header>

      <section className="login-banner">
        <div className="login-wrap py-10 sm:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Espace agents — {BRAND.bureauShort}
          </p>
          <h1 className="login-serif mt-3 text-[2.15rem] font-semibold leading-[1.15] text-white sm:text-[2.75rem]">
            {BRAND.appName}
          </h1>
          <p className="mt-3 max-w-xl text-[1.05rem] leading-relaxed text-white/85">
            {BRAND.tagline}
          </p>
        </div>
      </section>

      <main className="login-wrap flex flex-1 flex-col gap-10 py-10 sm:py-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="max-w-md lg:flex-1 lg:pt-2">
          <h2 className="login-serif text-[1.35rem] font-semibold text-[#0d4f38]">
            Accès à la plateforme
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#4a6b5c]">
            {BRAND.loginSubtitle}
          </p>
          <dl className="mt-8 space-y-4 border-t border-[#d4e5dc] pt-6 text-sm">
            <div>
              <dt className="font-semibold text-[#0d4f38]">Devise nationale</dt>
              <dd className="mt-1 text-[#4a6b5c]">Travail · Justice · Solidarité</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#0d4f38]">Tutelle</dt>
              <dd className="mt-1 text-[#4a6b5c]">
                {BRAND.ministry} ({BRAND.ministryShort})
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex items-center gap-6 sm:hidden">
            <Image
              src="/branding/guinee-nimba.png"
              alt="Guinée"
              width={110}
              height={36}
              className="h-8 w-auto object-contain"
            />
            <Image
              src="/branding/simandou-2040.png"
              alt="Programme Simandou 2040"
              width={180}
              height={72}
              className="h-14 w-auto object-contain"
            />
          </div>
        </div>

        <div className="w-full lg:max-w-[400px] lg:shrink-0">
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <h2 className="login-serif text-xl font-semibold text-[#0d4f38]">Connexion</h2>
            <p className="mt-1 text-sm text-[#4a6b5c]">
              Saisissez vos identifiants institutionnels.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="login-username" className="login-label">
                  Identifiant
                </label>
                <input
                  id="login-username"
                  {...register("username")}
                  autoComplete="username"
                  className="login-input"
                />
                {errors.username && (
                  <p className="mt-1.5 text-xs font-medium text-[#b42318]">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="login-label">
                  Mot de passe
                </label>
                <input
                  id="login-password"
                  type="password"
                  {...register("password")}
                  autoComplete="current-password"
                  className="login-input"
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs font-medium text-[#b42318]">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={submitting}>
              {submitting ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </main>

      <footer className="login-footer">
        <div className="login-wrap py-5 text-center sm:text-left">
          <p className="login-serif text-sm font-semibold text-[#0d4f38]">
            Travail · Justice · Solidarité
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#4a6b5c]">
            © {new Date().getFullYear()} {BRAND.country} — {BRAND.ministry} — {BRAND.bureau}.
            Accès réservé au personnel autorisé.
          </p>
        </div>
      </footer>
    </div>
  );
}
