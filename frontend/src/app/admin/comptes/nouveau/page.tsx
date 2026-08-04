"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser } from "@/lib/api";

const schema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  username: z.string().min(3, "Minimum 3 caractères"),
  password: z.string().min(6, "Minimum 6 caractères"),
  type_acces: z.enum(["lecture", "ecriture"]),
  role: z.enum(["user", "admin"]),
});

type FormData = z.infer<typeof schema>;

export default function NouveauComptePage() {
  return (
    <ProtectedRoute adminOnly>
      <NouveauCompteContent />
    </ProtectedRoute>
  );
}

function NouveauCompteContent() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type_acces: "lecture", role: "user" },
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("Compte créé avec succès");
      router.push("/admin/comptes");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Nouveau compte</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((data) => mutation.mutate(data))}
              className="space-y-4"
            >
              <Field label="Prénom" error={errors.prenom?.message}>
                <input
                  {...register("prenom")}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Identifiant" error={errors.username?.message}>
                <input
                  {...register("username")}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Mot de passe" error={errors.password?.message}>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Type d'accès" error={errors.type_acces?.message}>
                <select
                  {...register("type_acces")}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="lecture">Lecture (Visiteur)</option>
                  <option value="ecriture">Écriture (Éditeur)</option>
                </select>
              </Field>
              <Field label="Rôle" error={errors.role?.message}>
                <select
                  {...register("role")}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </Field>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Création…" : "Créer le compte"}
                </Button>
                <Link href="/admin/comptes">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
