"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

import { ProtectedRoute } from "@/components/protected-route";
import { FormDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { createUser } from "@/lib/api";
import { INSTITUTION_ROLES, ROLE_LABELS } from "@/lib/roles";
import { BsdMemberTabsField } from "@/components/bsd-member-tabs-field";
import type { UserRole } from "@/types";

const ROLES = [
  "admin",
  "membre_bsd",
  "developpeur",
  "directeur",
  "sg",
  "ministre",
  "daf",
] as const satisfies readonly UserRole[];

const schema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  username: z.string().min(3, "Minimum 3 caractères"),
  type_acces: z.enum(["lecture", "ecriture"]),
  role: z.enum(ROLES),
  allowed_tabs: z.array(z.string()),
}).superRefine((data, ctx) => {
  if (data.role === "membre_bsd" && data.allowed_tabs.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["allowed_tabs"],
      message: "Sélectionnez au moins un onglet",
    });
  }
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
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [createdUsername, setCreatedUsername] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type_acces: "ecriture", role: "admin", nom: "", allowed_tabs: [] },
  });

  const role = useWatch({ control, name: "role" });
  const allowedTabs = useWatch({ control, name: "allowed_tabs" }) ?? [];
  const isInstitution = INSTITUTION_ROLES.includes(role);
  const isDeveloper = role === "developpeur";
  const isMembreBsd = role === "membre_bsd";

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (result) => {
      const pwd = result.generated_password;
      if (pwd) {
        setGeneratedPassword(pwd);
        setCreatedUsername(result.user.username);
      } else {
        toast.success("Compte créé avec succès");
        router.push("/admin/comptes");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const closePasswordDialog = () => {
    setGeneratedPassword(null);
    setCreatedUsername(null);
    router.push("/admin/comptes");
  };

  const copyPassword = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast.success("Mot de passe copié");
    } catch {
      toast.error("Impossible de copier le mot de passe");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Nouveau compte"
        description="Un mot de passe sécurisé est généré automatiquement à la création."
      />

      <div className="panel-grain mx-auto max-w-2xl">
        <form
          onSubmit={handleSubmit((data) =>
            mutation.mutate({
              ...data,
              type_acces: isInstitution ? "lecture" : isDeveloper ? "ecriture" : data.type_acces,
              allowed_tabs: isMembreBsd ? data.allowed_tabs : [],
            }),
          )}
          className="space-y-4"
        >
          <Field label="Prénom" error={errors.prenom?.message}>
            <input {...register("prenom")} className="input-grain w-full" />
          </Field>
          <Field label="Nom" error={errors.nom?.message}>
            <input {...register("nom")} className="input-grain w-full" />
          </Field>
          <Field label="Identifiant" error={errors.username?.message}>
            <input {...register("username")} className="input-grain w-full" autoComplete="off" />
          </Field>
          <Field label="Rôle" error={errors.role?.message}>
            <select {...register("role")} className="input-grain w-full">
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
          ) : isDeveloper ? (
            <p className="rounded-[var(--radius-sm)] bg-veil px-3 py-2 text-xs text-slate">
              Accès exclusif à l&apos;onglet <strong>Notifications</strong> (configuration e-mail,
              historique et rappels d&apos;activités). Aucun accès aux modules métier.
            </p>
          ) : isMembreBsd ? (
            <>
              <Field label="Type d'accès" error={errors.type_acces?.message}>
                <select {...register("type_acces")} className="input-grain w-full">
                  <option value="lecture">Lecture (Visiteur)</option>
                  <option value="ecriture">Écriture (Éditeur)</option>
                </select>
              </Field>
              <BsdMemberTabsField
                value={allowedTabs}
                onChange={(tabs) => setValue("allowed_tabs", tabs, { shouldValidate: true })}
                error={errors.allowed_tabs?.message}
              />
            </>
          ) : (
            <Field label="Type d'accès" error={errors.type_acces?.message}>
              <select {...register("type_acces")} className="input-grain w-full">
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
      </div>

      <FormDialog
        open={generatedPassword !== null}
        title="Compte créé"
        onClose={closePasswordDialog}
      >
        <p className="text-sm leading-[1.43] text-slate">
          Communiquez ce mot de passe à{" "}
          <span className="font-medium text-graphite">@{createdUsername}</span>. Il ne sera plus
          affiché après fermeture de cette fenêtre.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code className="rounded-[var(--radius-sm)] bg-veil px-3 py-2 text-sm font-semibold text-graphite">
            {generatedPassword}
          </code>
          <Button type="button" variant="outline" size="sm" onClick={() => void copyPassword()}>
            Copier
          </Button>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={closePasswordDialog}>
            J&apos;ai noté le mot de passe
          </Button>
        </div>
      </FormDialog>
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
      <label className="label-grain">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
