"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { createObjectif } from "@/lib/api";

export function ObjectifForm({ queryKey }: { queryKey: string[] }) {
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
    <div className="panel-grain">
      <button
        type="button"
        className="flex items-center gap-2 text-sm font-medium text-graphite transition-colors hover:text-slate"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <>
            <Minus className="h-4 w-4" />
            Masquer le formulaire
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Ajouter un objectif
          </>
        )}
      </button>
      {open && (
        <form
          className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({ code, description });
          }}
        >
          <div>
            <label className="label-grain">Code</label>
            <input
              placeholder="Ex. OC1"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-grain"
              required
            />
          </div>
          <div>
            <label className="label-grain">Description</label>
            <input
              placeholder="Description de l'objectif"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-grain"
              required
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            Enregistrer
          </Button>
        </form>
      )}
    </div>
  );
}
