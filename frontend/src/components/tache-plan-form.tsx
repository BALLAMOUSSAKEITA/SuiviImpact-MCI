"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { createTachePlan } from "@/lib/api";

export function TachePlanForm({ queryKey }: { queryKey: string[] }) {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: createTachePlan,
    onSuccess: () => {
      toast.success("Tâche créée");
      setCode("");
      setDescription("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!canWrite) return null;

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Ajouter une tâche
      </Button>
    );
  }

  return (
    <div className="panel-grain">
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({ code, description });
        }}
      >
        <div className="w-full sm:w-24">
          <label className="label-grain">Code</label>
          <input
            placeholder="T1"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-grain"
            required
          />
        </div>
        <div className="flex-1">
          <label className="label-grain">Description</label>
          <input
            placeholder="Description de la tâche"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-grain"
            required
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            Enregistrer
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
