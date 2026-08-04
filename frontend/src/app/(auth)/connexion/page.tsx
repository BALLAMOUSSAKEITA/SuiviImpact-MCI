"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(1, "Identifiant requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function ConnexionPage() {
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

  return (
    <div className="grain-gradient flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md shadow-[var(--shadow-elevated)]">
        <CardHeader className="text-center">
          <span className="badge-grain mx-auto">MIPME — BSD Guinée</span>
          <CardTitle className="mt-4 font-display text-2xl">Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label-grain">Identifiant</label>
              <input
                {...register("username")}
                className="input-grain"
                autoComplete="username"
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
                className="input-grain"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-fog">
            <Link href="/" className="text-forest-ink hover:underline">
              Retour à l&apos;accueil
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
