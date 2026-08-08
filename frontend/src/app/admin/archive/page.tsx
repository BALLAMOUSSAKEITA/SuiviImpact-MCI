"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Folder, File } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { FileUploadTrigger } from "@/components/file-upload-field";
import { Button } from "@/components/ui/button";
import {
  createDossier,
  deleteArchiveFile,
  deleteDossier,
  getArchiveRoot,
  uploadArchiveFile,
} from "@/lib/api";

type ArchiveDeleteTarget =
  | { kind: "folder"; id: number; name: string }
  | { kind: "file"; id: number }
  | null;

export default function ArchivePage() {
  return <ArchiveContent />;
}

function ArchiveContent() {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ArchiveDeleteTarget>(null);

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
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteFileMutation = useMutation({
    mutationFn: deleteArchiveFile,
    onSuccess: () => {
      toast.success("Fichier supprimé");
      setDeleteTarget(null);
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
    <>
      <PageHeader
        title="Archive"
        description="Explorateur de documents — racine"
        actions={
          canWrite ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setShowNewFolder(true)}>
                Nouveau dossier
              </Button>
              <FileUploadTrigger
                label="Joindre un fichier"
                loading={uploadMutation.isPending}
                onFile={(file) => uploadMutation.mutate(file)}
              />
            </div>
          ) : undefined
        }
      />

        {showNewFolder && canWrite && (
          <div className="panel-grain flex gap-2 p-4">
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nom du dossier"
              className="input-grain flex-1"
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
            className="panel-grain border-2 border-dashed border-cloud p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) uploadMutation.mutate(file);
            }}
          >
            <p className="text-sm text-slate">
              Glissez-déposez un fichier ici pour l&apos;uploader à la racine
            </p>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-ash">Chargement…</p>
        ) : (
          <div className="space-y-2 panel-grain">
            {data?.dossiers.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-card px-3 py-2 hover:bg-veil"
              >
                <Link
                  href={`/admin/archive/dossier/${d.id}`}
                  className="flex items-center gap-2 text-sm font-medium text-graphite hover:underline"
                >
                  <Folder className="h-4 w-4 text-amber-500" />
                  {d.nom}
                </Link>
                {canWrite && (
                  <Button
                    variant="ghost"
                    className="h-8 px-3 text-xs text-red-600"
                    onClick={() =>
                      setDeleteTarget({ kind: "folder", id: d.id, name: d.nom })
                    }
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            ))}
            {data?.fichiers.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-card px-3 py-2 hover:bg-veil"
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
                    onClick={() => setDeleteTarget({ kind: "file", id: f.id })}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            ))}
            {data &&
              data.dossiers.length === 0 &&
              data.fichiers.length === 0 && (
                <p className="py-8 text-center text-sm text-ash">
                  Archive vide.
                </p>
              )}
          </div>
        )}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={
          deleteTarget?.kind === "folder" ? "Supprimer le dossier" : "Supprimer le fichier"
        }
        description={
          deleteTarget?.kind === "folder"
            ? `Supprimer le dossier « ${deleteTarget.name} » et son contenu ?`
            : "Ce fichier sera définitivement supprimé."
        }
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleteFolderMutation.isPending || deleteFileMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.kind === "folder") {
            deleteFolderMutation.mutate(deleteTarget.id);
          } else {
            deleteFileMutation.mutate(deleteTarget.id);
          }
        }}
      />
    </>
  );
}
