"use client";

import { FileUp, Upload, X } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadFieldProps {
  label?: string;
  hint?: string;
  accept?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  existingFileName?: string | null;
  disabled?: boolean;
  className?: string;
}

export function FileUploadField({
  label,
  hint,
  accept,
  file,
  onFileChange,
  existingFileName,
  disabled,
  className,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={className}>
      {label && <label className="label-grain">{label}</label>}
      <div
        className={cn(
          "mt-1 border border-dashed border-cloud bg-white p-4 transition-colors",
          !disabled && "hover:bg-veil",
          disabled && "opacity-60",
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-forest-ink/8 text-forest-ink">
            <FileUp className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            {file ? (
              <p className="truncate text-sm font-medium text-graphite">{file.name}</p>
            ) : existingFileName ? (
              <p className="text-sm text-slate">
                Fichier actuel :{" "}
                <span className="font-medium text-graphite">{existingFileName}</span>
              </p>
            ) : (
              <p className="text-sm text-ash">Aucun fichier sélectionné</p>
            )}
            {hint && <p className="mt-1 text-xs text-fog">{hint}</p>}
          </div>
          {file && !disabled && (
            <button
              type="button"
              aria-label="Retirer le fichier"
              className="rounded-[var(--radius-sm)] p-1 text-ash hover:bg-veil hover:text-graphite"
              onClick={() => {
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            {file || existingFileName ? "Choisir un autre fichier" : "Parcourir…"}
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            onFileChange(e.target.files?.[0] ?? null);
          }}
        />
      </div>
    </div>
  );
}

interface FileUploadTriggerProps {
  label?: string;
  accept?: string;
  disabled?: boolean;
  loading?: boolean;
  onFile: (file: File) => void;
}

/** Bouton compact pour dépôt immédiat (ex. archive). */
export function FileUploadTrigger({
  label = "Joindre un fichier",
  accept,
  disabled,
  loading,
  onFile,
}: FileUploadTriggerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled || loading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {loading ? "Envoi…" : label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}
