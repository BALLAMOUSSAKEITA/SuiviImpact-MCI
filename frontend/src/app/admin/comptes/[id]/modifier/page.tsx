"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ProtectedRoute } from "@/components/protected-route";
import { BsdMemberTabsField } from "@/components/bsd-member-tabs-field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getUser, updateUser } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/roles";

const schema = z.object({
  type_acces: z.enum(["lecture", "ecriture"]),
  allowed_tabs: z.array(z.string()).min(1, "Sélectionnez au moins un onglet"),
});

type FormData = z.infer<typeof schema>;

export default function ModifierComptePage() {
  return (
    <ProtectedRoute adminOnly>
      <ModifierCompteContent />
    </ProtectedRoute>
  );
}

function ModifierCompteContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Number(params.id);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUser(userId),
    enabled: Number.isInteger(userId) && userId > 0,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type_acces: "ecriture", allowed_tabs: [] },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      type_acces: user.type_acces,
      allowed_tabs: user.allowed_tabs ?? [],
    });
  }, [user, reset]);

  const allowedTabs = useWatch({ control, name: "allowed_tabs" }) ?? [];

  const mutation = useMutation({
    mutationFn: (data: FormData) => updateUser(userId, data),
    onSuccess: () => {
      toast.success("Compte mis à jour");
      router.push("/admin/comptes");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate">Chargement…</p>;
  }

  if (isError || !user) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate">Compte introuvable.</p>
        <Link href="/admin/comptes" className="mt-3 inline-block text-sm text-forest-ink hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  if (user.role !== "membre_bsd") {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-slate">
          Seuls les comptes Membre BSD ont des onglets configurables.
        </p>
        <Link href="/admin/comptes" className="mt-3 inline-block text-sm text-forest-ink hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Modifier le compte"
        description={`${user.prenom} ${user.nom} — ${ROLE_LABELS[user.role]} (@${user.username})`}
      />

      <div className="panel-grain mx-auto max-w-2xl">
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <label className="label-grain">Type d&apos;accès</label>
            <select {...register("type_acces")} className="input-grain w-full">
              <option value="lecture">Lecture (Visiteur)</option>
              <option value="ecriture">Écriture (Éditeur)</option>
            </select>
            {errors.type_acces && (
              <p className="mt-1 text-xs text-red-600">{errors.type_acces.message}</p>
            )}
          </div>
          <BsdMemberTabsField
            value={allowedTabs}
            onChange={(tabs) => setValue("allowed_tabs", tabs, { shouldValidate: true })}
            error={errors.allowed_tabs?.message}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Link href="/admin/comptes">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
