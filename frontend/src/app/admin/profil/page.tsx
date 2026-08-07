"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { updateProfile, uploadProfileAvatar } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/roles";

export default function ProfilPage() {
  return <ProfilContent />;
}

function ProfilContent() {
  const { user, refreshUser, canWrite } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [avatarKey, setAvatarKey] = useState(0);

  useEffect(() => {
    if (user) {
      setPrenom(user.prenom ?? "");
      setNom(user.nom ?? "");
    }
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: () => updateProfile({ prenom: prenom.trim(), nom: nom.trim() }),
    onSuccess: async () => {
      toast.success("Profil mis à jour");
      await refreshUser();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => uploadProfileAvatar(file),
    onSuccess: async () => {
      toast.success("Photo de profil enregistrée");
      setAvatarKey((k) => k + 1);
      await refreshUser();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) {
    return (
      <p className="text-sm text-ash">Impossible de charger votre profil. Reconnectez-vous.</p>
    );
  }

  const displayName = [user.prenom, user.nom].filter(Boolean).join(" ");

  return (
    <>
      <PageHeader
        eyebrow="Compte"
        title="Mon profil"
        description="Vos informations personnelles et votre photo de profil."
      />

      <div className="panel-grain mx-auto max-w-2xl space-y-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <UserAvatar
            key={avatarKey}
            prenom={user.prenom}
            nom={user.nom ?? ""}
            hasAvatar={user.has_avatar}
            size="lg"
          />
          <div className="text-center sm:text-left">
            <p className="text-xl font-semibold text-graphite">{displayName || user.username}</p>
            <p className="text-sm text-slate">@{user.username}</p>
            <p className="mt-1 text-sm text-ash">{ROLE_LABELS[user.role]}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) avatarMutation.mutate(file);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={avatarMutation.isPending}
              onClick={() => fileRef.current?.click()}
            >
              {avatarMutation.isPending ? "Envoi…" : "Changer la photo"}
            </Button>
          </div>
        </div>

        <form
          className="space-y-4 border-t border-cloud/60 pt-6"
          onSubmit={(e) => {
            e.preventDefault();
            profileMutation.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-grain">Prénom</label>
              <input
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="input-grain"
              />
            </div>
            <div>
              <label className="label-grain">Nom</label>
              <input
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="input-grain"
              />
            </div>
          </div>
          <p className="text-xs text-ash">
            L&apos;identifiant de connexion ({user.username}) est géré par l&apos;administrateur.
            {!canWrite &&
              " Votre rôle ne permet pas de modifier les données métier de la plateforme."}
          </p>
          <Button type="submit" disabled={profileMutation.isPending}>
            {profileMutation.isPending ? "Enregistrement…" : "Enregistrer le profil"}
          </Button>
        </form>
      </div>
    </>
  );
}
