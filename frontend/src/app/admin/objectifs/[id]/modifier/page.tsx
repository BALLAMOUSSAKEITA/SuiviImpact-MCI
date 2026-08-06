"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { listObjectifs, updateObjectif } from "@/lib/api";
import type { Objectif } from "@/types";

export default function ModifierObjectifPage() {
  return <ModifierObjectifContent />;
}

function ModifierObjectifContent() {
  const params = useParams<{ id: string }>();
  const objectifId = Number(params.id);

  const { data: objectifs = [] } = useQuery({
    queryKey: ["objectifs"],
    queryFn: () => listObjectifs(),
  });
  const objectif = objectifs.find((o) => o.id === objectifId);

  if (!objectif) {
    return <p className="text-sm text-ash">Objectif introuvable</p>;
  }

  return <ObjectifEditForm key={objectif.id} objectif={objectif} />;
}

function ObjectifEditForm({ objectif }: { objectif: Objectif }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [code, setCode] = useState(objectif.code);
  const [description, setDescription] = useState(objectif.description);

  const mutation = useMutation({
    mutationFn: () =>
      updateObjectif(objectif.id, {
        code,
        description,
      }),
    onSuccess: () => {
      toast.success("Objectif mis à jour");
      queryClient.invalidateQueries({ queryKey: ["objectifs"] });
      router.push(`/activite/${objectif.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/activite/${objectif.id}`}
          className="text-sm text-forest-ink hover:underline"
        >
          ← Retour aux activités
        </Link>
        <h1 className="mt-2 text-xl font-bold text-graphite sm:text-2xl">
          Modifier l&apos;objectif
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="panel-grain space-y-4"
      >
        <div>
          <label className="label-grain">Code</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-grain"
          />
        </div>
        <div>
          <label className="label-grain">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="input-grain"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Link href={`/activite/${objectif.id}`}>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
