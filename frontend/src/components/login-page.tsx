"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
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
        <p className="text-sm text-gray-400">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="login-shell flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius)] bg-primary text-white">
            <Building2 className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-xl text-gray-900">{BRAND.appName}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {BRAND.ministryShort} · {BRAND.bureauShort} · {BRAND.program}
          </p>
        </div>

        <div className="login-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label-grain">Identifiant</label>
              <input
                {...register("username")}
                autoComplete="username"
                className="login-input"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="label-grain">Mot de passe</label>
              <input
                type="password"
                {...register("password")}
                autoComplete="current-password"
                className="login-input"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Accès réservé au personnel autorisé du {BRAND.bureauShort}.
        </p>
      </div>
    </div>
  );
}
