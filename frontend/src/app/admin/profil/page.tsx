"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { FileUploadTrigger } from "@/components/file-upload-field";
import { PageHeader } from "@/components/page-header";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { changePassword, updateProfile, uploadProfileAvatar } from "@/lib/api";
import { openUsageGuide } from "@/lib/onboarding";
import { ROLE_LABELS } from "@/lib/roles";

export default function ProfilPage() {
  return <ProfilContent />;
}

function ProfilContent() {
  const { user, refreshUser, canWrite } = useAuth();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [avatarKey, setAvatarKey] = useState(0);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const passwordMutation = useMutation({
    mutationFn: () =>
      changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    onSuccess: () => {
      toast.success("Mot de passe modifié");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) {
    return (
      <p className="text-sm text-ash">Impossible de charger votre profil. Reconnectez-vous.</p>
    );
  }

  const displayName = [user.prenom, user.nom].filter(Boolean).join(" ");

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("La confirmation ne correspond pas");
      return;
    }
    passwordMutation.mutate();
  };

  return (
    <>
      <PageHeader
        eyebrow="Compte"
        title="Mon profil"
        description="Vos informations personnelles, votre sécurité et le guide d'utilisation."
        actions={
          <Button type="button" variant="outline" onClick={() => openUsageGuide()}>
            Guide d&apos;utilisation
          </Button>
        }
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
            <div className="mt-3">
              <FileUploadTrigger
                label={avatarMutation.isPending ? "Envoi…" : "Changer la photo"}
                accept="image/png,image/jpeg,image/jpg,image/gif"
                disabled={!canWrite}
                loading={avatarMutation.isPending}
                onFile={(file) => avatarMutation.mutate(file)}
              />
            </div>
          </div>
        </div>

        <form
          className="space-y-4 border-t border-cloud pt-6"
          onSubmit={(e) => {
            e.preventDefault();
            profileMutation.mutate();
          }}
        >
          <h2 className="text-base font-medium text-graphite">Identité</h2>
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
          <p className="text-xs text-slate">
            L&apos;identifiant de connexion ({user.username}) est géré par l&apos;administrateur.
            {!canWrite &&
              " Votre rôle ne permet pas de modifier les données métier de la plateforme."}
          </p>
          <Button type="submit" disabled={profileMutation.isPending}>
            {profileMutation.isPending ? "Enregistrement…" : "Enregistrer le profil"}
          </Button>
        </form>

        <form className="space-y-4 border-t border-cloud pt-6" onSubmit={submitPassword}>
          <h2 className="text-base font-medium text-graphite">Mot de passe</h2>
          <div>
            <label className="label-grain">Mot de passe actuel</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-grain"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-grain">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-grain"
              />
            </div>
            <div>
              <label className="label-grain">Confirmer</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-grain"
              />
            </div>
          </div>
          <Button type="submit" disabled={passwordMutation.isPending}>
            {passwordMutation.isPending ? "Modification…" : "Changer le mot de passe"}
          </Button>
        </form>
      </div>
    </>
  );
}
