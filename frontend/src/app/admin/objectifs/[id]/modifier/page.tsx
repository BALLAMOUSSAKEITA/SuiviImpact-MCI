"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { listObjectifs, updateObjectif } from "@/lib/api";
import type { Objectif } from "@/types";

export default function ModifierObjectifPage() {
  return (
    <ProtectedRoute>
      <ModifierObjectifContent />
    </ProtectedRoute>
  );
}

function ModifierObjectifContent() {
  const params = useParams<{ id: string }>();
  const objectifId = Number(params.id);

  const { data: objectifs = [] } = useQuery({
    queryKey: ["objectifs-all"],
    queryFn: () => listObjectifs(),
  });
  const objectif = objectifs.find((o) => o.id === objectifId);

  if (!objectif) {
    return (
      <AdminShell>
        <div className="space-y-8">
          <p className="text-sm text-fog">Objectif introuvable</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-8">
        <ObjectifEditForm key={objectif.id} objectif={objectif} />
      </div>
    </AdminShell>
  );
}

function ObjectifEditForm({ objectif }: { objectif: Objectif }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [code, setCode] = useState(objectif.code);
  const [description, setDescription] = useState(objectif.description);

  const mutation = useMutation({
    mutationFn: () => updateObjectif(objectif.id, { code, description }),
    onSuccess: () => {
      toast.success("Objectif mis à jour");
      queryClient.invalidateQueries({ queryKey: ["objectifs"] });
      router.push(`/admin/${objectif.type}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <CardForm
      title={`Modifier ${objectif.code}`}
      code={code}
      description={description}
      onCodeChange={setCode}
      onDescriptionChange={setDescription}
      onSubmit={() => mutation.mutate()}
      submitting={mutation.isPending}
      cancelHref={`/admin/${objectif.type}`}
    />
  );
}

function CardForm({
  title,
  code,
  description,
  onCodeChange,
  onDescriptionChange,
  onSubmit,
  submitting,
  cancelHref,
}: {
  title: string;
  code: string;
  description: string;
  onCodeChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  cancelHref: string;
}) {
  return (
    <div className="panel-dub mx-auto max-w-lg">
      <h1 className="text-xl font-semibold text-charcoal">{title}</h1>
      <div className="mt-4 space-y-3">
        <input
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="dub-input"
        />
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          className="dub-input"
        />
        <div className="flex gap-3">
          <Button onClick={onSubmit} disabled={submitting}>
            Enregistrer
          </Button>
          <Link href={cancelHref}>
            <Button variant="outline">Annuler</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
