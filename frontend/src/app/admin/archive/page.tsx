"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Folder, File } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import {
  createDossier,
  deleteArchiveFile,
  deleteDossier,
  getArchiveRoot,
  uploadArchiveFile,
} from "@/lib/api";

export default function ArchivePage() {
  return (
    <ProtectedRoute>
      <ArchiveContent />
    </ProtectedRoute>
  );
}

function ArchiveContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  const queryKey = ["archive-root"];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: getArchiveRoot,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createFolderMutation = useMutation({
    mutationFn: () => createDossier(newFolderName),
    onSuccess: () => {
      toast.success("Dossier créé");
      setNewFolderName("");
      setShowNewFolder(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadArchiveFile(file),
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
    <AdminShell>
        <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Archive</h1>
            <p className="mt-1 text-sm text-fog">
              Explorateur de documents — racine
            </p>
          </div>
          {canWrite && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNewFolder(true)}>
                Nouveau dossier
              </Button>
              <label className="cursor-pointer">
                <span className="inline-flex h-10 items-center justify-center rounded-[var(--radius-card)] border border-charcoal px-4 text-sm font-medium text-electric-blue hover:bg-paper-mist">
                  Uploader un fichier
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

        {showNewFolder && canWrite && (
          <div className="flex gap-2 rounded-[var(--radius-card)] border border-ash bg-canvas-white p-4">
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nom du dossier"
              className="flex-1 rounded-[var(--radius-card)] border border-ash px-3 py-2 text-sm"
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
            className="rounded-[var(--radius-card)] border-2 border-dashed border-ash bg-canvas-white p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) uploadMutation.mutate(file);
            }}
          >
            <p className="text-sm text-fog">
              Glissez-déposez un fichier ici pour l&apos;uploader à la racine
            </p>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-fog">Chargement…</p>
        ) : (
          <div className="space-y-2 rounded-[var(--radius-card)] border border-ash bg-canvas-white p-4 ">
            {data?.dossiers.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-[var(--radius-card)] px-3 py-2 hover:bg-paper-mist"
              >
                <Link
                  href={`/admin/archive/dossier/${d.id}`}
                  className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-electric-blue"
                >
                  <Folder className="h-4 w-4 text-amber-500" />
                  {d.nom}
                </Link>
                {canWrite && (
                  <Button
                    variant="ghost"
                    className="h-8 px-3 text-xs text-red-600"
                    onClick={() => {
                      if (window.confirm(`Supprimer le dossier « ${d.nom} » ?`)) {
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
                className="flex items-center justify-between rounded-[var(--radius-card)] px-3 py-2 hover:bg-paper-mist"
              >
                <div className="flex items-center gap-2 text-sm text-steel">
                  <File className="h-4 w-4 text-fog" />
                  {f.nom}
                  <span className="text-xs text-fog">
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
              data.dossiers.length === 0 &&
              data.fichiers.length === 0 && (
                <p className="py-8 text-center text-sm text-fog">
                  Archive vide.
                </p>
              )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
