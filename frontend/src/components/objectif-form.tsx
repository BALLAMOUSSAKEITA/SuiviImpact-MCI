"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { createObjectif } from "@/lib/api";
import type { ObjectifType } from "@/types";

export function ObjectifForm({
  type,
  queryKey,
}: {
  type: ObjectifType;
  queryKey: string[];
}) {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: createObjectif,
    onSuccess: () => {
      toast.success("Objectif créé");
      setCode("");
      setDescription("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!canWrite) return null;

  return (
    <div className="panel-dub">
      <button
        type="button"
        className="text-sm font-medium text-electric-blue"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "− Masquer le formulaire" : "+ Ajouter un objectif"}
      </button>
      {open && (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({ type, code, description });
          }}
        >
          <input
            placeholder="Code (ex. OC1)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="dub-input"
            required
          />
          <input
            placeholder="Description de l'objectif"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="dub-input sm:col-span-2"
            required
          />
          <Button type="submit" disabled={mutation.isPending} className="sm:w-fit">
            Enregistrer
          </Button>
        </form>
      )}
    </div>
  );
}
