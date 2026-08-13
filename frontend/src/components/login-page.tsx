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
        <p className="text-sm text-slate">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="login-shell flex min-h-screen flex-col">
      <div className="login-tricolor" aria-hidden="true" />

      <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col px-6 py-10 sm:py-14">
        <header className="text-center">
          <Image
            src="/branding/embleme-guinee.jpg"
            alt="Armoiries de la République de Guinée"
            width={112}
            height={126}
            className="mx-auto h-[5.5rem] w-auto object-contain"
            priority
          />
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.16em] text-slate">
            {BRAND.country}
          </p>
          <p className="mt-2 text-[15px] font-semibold leading-snug text-graphite">
            {BRAND.ministry}
          </p>
          <p className="mt-0.5 text-sm text-slate">{BRAND.bureau}</p>
        </header>

        <div className="mt-8 border-t border-cloud pt-8">
          <h1 className="text-center text-[1.375rem] font-semibold tracking-tight text-graphite">
            {BRAND.appName}
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate">
            {BRAND.tagline}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
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
                <p className="mt-1.5 text-xs font-medium text-red-600">
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
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="mt-2 h-11 w-full" disabled={submitting}>
              {submitting ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </div>

        <div className="mt-auto flex items-center justify-center gap-8 pt-12">
          <Image
            src="/branding/guinee-nimba.png"
            alt="Guinée"
            width={108}
            height={36}
            className="h-8 w-auto object-contain"
          />
          <Image
            src="/branding/simandou-2040.png"
            alt="Simandou 2040"
            width={140}
            height={44}
            className="h-10 w-auto rounded-sm bg-black object-contain px-2 py-1"
          />
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-ash">
        © {new Date().getFullYear()} {BRAND.ministry} — {BRAND.bureauShort}
      </footer>
    </div>
  );
}
