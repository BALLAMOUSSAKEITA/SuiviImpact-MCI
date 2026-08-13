"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
      <div className="login-shell grid min-h-screen place-items-center">
        <p className="login-sans text-sm text-white/70">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="login-shell login-sans grid min-h-screen lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,480px)]">
      <aside className="relative flex flex-col justify-between px-8 py-10 text-white sm:px-12 lg:px-14 lg:py-12">
        <div className="login-tricolor" aria-hidden="true" />

        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/65">
            {BRAND.country}
          </p>
          <div className="mt-8 max-w-md">
            <Image
              src="/branding/embleme-guinee.jpg"
              alt="Armoiries de la République de Guinée"
              width={160}
              height={180}
              className="h-28 w-auto bg-white object-contain p-2 sm:h-36"
              priority
            />
            <h1 className="login-display mt-8 text-[2.75rem] leading-[1.05] tracking-[-0.02em] text-white sm:text-[3.25rem]">
              {BRAND.appName}
            </h1>
            <p className="mt-4 max-w-sm text-[1.05rem] leading-relaxed text-white/78">
              {BRAND.tagline}
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <div>
            <p className="text-sm font-medium text-white">{BRAND.ministry}</p>
            <p className="mt-1 text-sm text-white/65">{BRAND.bureau}</p>
          </div>

          <div className="flex flex-wrap items-end gap-6 border-t border-white/15 pt-6">
            <Image
              src="/branding/guinee-nimba.png"
              alt="Guinée"
              width={120}
              height={40}
              className="h-9 w-auto brightness-0 invert"
              priority
            />
            <Image
              src="/branding/simandou-2040.png"
              alt="Simandou 2040"
              width={150}
              height={48}
              className="h-11 w-auto"
              priority
            />
          </div>
        </div>
      </aside>

      <main className="flex flex-col justify-center bg-white px-6 py-12 sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-[360px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image
              src="/branding/embleme-guinee.jpg"
              alt=""
              width={48}
              height={54}
              className="h-12 w-auto bg-white object-contain p-1"
              aria-hidden
            />
            <div>
              <p className="login-display text-2xl text-[#1a1a1a]">{BRAND.appName}</p>
              <p className="text-xs text-[#666]">
                {BRAND.ministryShort} · {BRAND.bureauShort}
              </p>
            </div>
          </div>

          <h2 className="login-display text-[1.85rem] leading-tight text-[#1a1a1a]">
            Connexion
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#666]">
            {BRAND.loginSubtitle}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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

            <Button
              type="submit"
              className="login-submit mt-2 h-11 w-full text-[0.95rem]"
              disabled={submitting}
            >
              {submitting ? "Connexion…" : "Se connecter"}
            </Button>
          </form>

          <div className="mt-10 flex items-center gap-5 border-t border-[#e8e8e8] pt-6 lg:hidden">
            <Image
              src="/branding/guinee-nimba.png"
              alt="Guinée"
              width={100}
              height={34}
              className="h-8 w-auto"
            />
            <div className="bg-[#111] px-2 py-1">
              <Image
                src="/branding/simandou-2040.png"
                alt="Simandou 2040"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-[#888]">
            Accès réservé au personnel autorisé. Assistance : {BRAND.bureauShort}.
          </p>
        </div>
      </main>
    </div>
  );
}
