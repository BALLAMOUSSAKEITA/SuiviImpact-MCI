"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/types";

const ROLES = ["user", "admin", "directeur", "sg", "ministre", "daf"] as const satisfies readonly UserRole[];

const schema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  username: z.string().min(3, "Minimum 3 caractères"),
  password: z.string().min(6, "Minimum 6 caractères"),
  type_acces: z.enum(["lecture", "ecriture"]),
  role: z.enum(ROLES),
});

type FormData = z.infer<typeof schema>;

const INSTITUTION_ROLES: UserRole[] = ["directeur", "sg", "ministre"];

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
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type_acces: "ecriture", role: "user", nom: "" },
  });

  const role = useWatch({ control, name: "role" });
  const isInstitution = INSTITUTION_ROLES.includes(role);

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("Compte créé avec succès");
      router.push("/admin/comptes");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Nouveau compte</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) =>
              mutation.mutate({
                ...data,
                type_acces: isInstitution ? "lecture" : data.type_acces,
              }),
            )}
            className="space-y-4"
          >
            <Field label="Prénom" error={errors.prenom?.message}>
              <input
                {...register("prenom")}
                className="input-grain w-full"
              />
            </Field>
            <Field label="Nom" error={errors.nom?.message}>
              <input
                {...register("nom")}
                className="input-grain w-full"
              />
            </Field>
            <Field label="Identifiant" error={errors.username?.message}>
              <input
                {...register("username")}
                className="input-grain w-full"
              />
            </Field>
            <Field label="Mot de passe" error={errors.password?.message}>
              <input
                type="password"
                {...register("password")}
                className="input-grain w-full"
              />
            </Field>
            <Field label="Rôle" error={errors.role?.message}>
              <select
                {...register("role")}
                className="input-grain w-full"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </Field>
            {isInstitution ? (
              <p className="rounded-[var(--radius-sm)] bg-veil px-3 py-2 text-xs text-slate">
                Ce rôle a un accès <strong>lecture seule</strong> : workflow, archives
                {role === "directeur" ? ", vue d'ensemble et planification PAO" : ", vue d'ensemble et statistiques"}
                . Pas d&apos;accès au suivi ni à l&apos;édition des données.
              </p>
            ) : (
              <Field label="Type d'accès" error={errors.type_acces?.message}>
                <select
                  {...register("type_acces")}
                  className="input-grain w-full"
                >
                  <option value="lecture">Lecture (Visiteur)</option>
                  <option value="ecriture">Écriture (Éditeur)</option>
                </select>
              </Field>
            )}
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
    </>
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
      <label className="mb-1 block text-sm font-medium text-slate">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
