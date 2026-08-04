"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronRight, Folder, File } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  createDossier,
  deleteArchiveFile,
  deleteDossier,
  getDossier,
  renameDossier,
  uploadArchiveFile,
} from "@/lib/api";

export default function ArchiveDossierPage() {
  return (
    <ProtectedRoute>
      <DossierContent />
    </ProtectedRoute>
  );
}

function DossierContent() {
  const params = useParams();
  const dossierId = Number(params.id);
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const queryKey = ["archive-dossier", dossierId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getDossier(dossierId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["archive-root"] });
  };

  const createFolderMutation = useMutation({
    mutationFn: () => createDossier(newFolderName, dossierId),
    onSuccess: () => {
      toast.success("Sous-dossier créé");
      setNewFolderName("");
      setShowNewFolder(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const renameMutation = useMutation({
    mutationFn: () => renameDossier(dossierId, renameValue),
    onSuccess: () => {
      toast.success("Dossier renommé");
      setRenaming(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadArchiveFile(file, dossierId),
    onSuccess: () => {
      toast.success("Fichier uploadé");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteFolderMutation = useMutation({
    mutationFn: deleteDossier,
    onSuccess: () => {
      toast.success("Dossier supprimé");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteFileMutation = useMutation({
    mutationFn: deleteArchiveFile,
    onSuccess: () => {
      toast.success("Fichier supprimé");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 space-y-6 p-8">
        <div>
          <nav className="flex flex-wrap items-center gap-1 text-sm text-fog">
            <Link href="/admin/archive" className="hover:text-forest-ink">
              Archive
            </Link>
            {data?.breadcrumb.map((item, i) => (
              <span key={item.id} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {i === data.breadcrumb.length - 1 ? (
                  <span className="font-medium text-graphite">{item.nom}</span>
                ) : (
                  <Link
                    href={`/admin/archive/dossier/${item.id}`}
                    className="hover:text-forest-ink"
                  >
                    {item.nom}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="mt-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-graphite">
              {data?.dossier.nom ?? "Dossier"}
            </h1>
            {canWrite && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRenaming(true);
                    setRenameValue(data?.dossier.nom ?? "");
                  }}
                >
                  Renommer
                </Button>
                <Button variant="outline" onClick={() => setShowNewFolder(true)}>
                  Nouveau sous-dossier
                </Button>
                <label className="cursor-pointer">
                  <span className="inline-flex h-10 items-center justify-center rounded-card bg-forest-ink px-4 text-sm font-medium text-white hover:bg-forest-ink/90">
                    Uploader
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadMutation.mutate(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {renaming && canWrite && (
          <div className="flex gap-2 rounded-card border border-cloud bg-paper p-4">
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="flex-1 rounded-card border border-cloud px-3 py-2 text-sm"
            />
            <Button
              onClick={() => renameMutation.mutate()}
              disabled={!renameValue.trim()}
            >
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => setRenaming(false)}>
              Annuler
            </Button>
          </div>
        )}

        {showNewFolder && canWrite && (
          <div className="flex gap-2 rounded-card border border-cloud bg-paper p-4">
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nom du sous-dossier"
              className="flex-1 rounded-card border border-cloud px-3 py-2 text-sm"
            />
            <Button
              onClick={() => createFolderMutation.mutate()}
              disabled={!newFolderName.trim()}
            >
              Créer
            </Button>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>
              Annuler
            </Button>
          </div>
        )}

        {canWrite && (
          <div
            className="rounded-card border-2 border-dashed border-mist bg-paper p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) uploadMutation.mutate(file);
            }}
          >
            <p className="text-sm text-fog">
              Glissez-déposez un fichier ici pour l&apos;uploader dans ce dossier
            </p>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-ash">Chargement…</p>
        ) : (
          <div className="space-y-2 rounded-card border border-cloud bg-paper p-4 shadow-sm">
            {data?.sous_dossiers.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-card px-3 py-2 hover:bg-paper"
              >
                <Link
                  href={`/admin/archive/dossier/${d.id}`}
                  className="flex items-center gap-2 text-sm font-medium text-graphite hover:text-forest-ink"
                >
                  <Folder className="h-4 w-4 text-amber-500" />
                  {d.nom}
                </Link>
                {canWrite && (
                  <Button
                    variant="ghost"
                    className="h-8 px-3 text-xs text-red-600"
                    onClick={() => {
                      if (window.confirm(`Supprimer « ${d.nom} » ?`)) {
                        deleteFolderMutation.mutate(d.id);
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            ))}
            {data?.fichiers.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-card px-3 py-2 hover:bg-paper"
              >
                <div className="flex items-center gap-2 text-sm text-slate">
                  <File className="h-4 w-4 text-ash" />
                  {f.nom}
                  <span className="text-xs text-ash">
                    ({formatSize(f.taille)})
                  </span>
                </div>
                {canWrite && (
                  <Button
                    variant="ghost"
                    className="h-8 px-3 text-xs text-red-600"
                    onClick={() => {
                      if (window.confirm("Supprimer ce fichier ?")) {
                        deleteFileMutation.mutate(f.id);
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            ))}
            {data &&
              data.sous_dossiers.length === 0 &&
              data.fichiers.length === 0 && (
                <p className="py-8 text-center text-sm text-ash">
                  Dossier vide.
                </p>
              )}
          </div>
        )}
      </main>
    </div>
  );
}
