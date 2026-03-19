"use client";

import { type DragEvent, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  is_public: boolean;
}

export interface DocumentUploadProps {
  documents: UploadedDoc[];
  onUpload: (file: File) => void;
  onRemove: (id: string) => void;
  onTogglePublic: (id: string) => void;
  maxSizeMb?: number;
  acceptedTypes?: string[];
  className?: string;
}

const DEFAULT_ACCEPTED = ["application/pdf", "image/jpeg", "image/png"];
const DEFAULT_MAX_SIZE_MB = 10;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) {
    return ImageIcon;
  }
  return FileText;
}

export function DocumentUpload({
  documents,
  onUpload,
  onRemove,
  onTogglePublic,
  maxSizeMb = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED,
  className,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(file: File): string | null {
    if (!acceptedTypes.includes(file.type)) {
      return `Type non accept\u00e9. Formats autoris\u00e9s : PDF, JPG, PNG.`;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      return `Fichier trop volumineux. Maximum : ${maxSizeMb} MB.`;
    }
    return null;
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      onUpload(file);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2",
          "rounded-lg border-2 border-dashed p-6",
          "cursor-pointer transition-colors duration-fast",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2",
          isDragging
            ? "border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/50"
            : "border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 hover:border-stone-400 dark:hover:border-stone-600"
        )}
      >
        <Upload
          size={24}
          className={cn(
            "transition-colors duration-fast",
            isDragging
              ? "text-teal-600 dark:text-teal-400"
              : "text-stone-400 dark:text-stone-500"
          )}
          aria-hidden="true"
        />
        <div className="text-center">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Glissez vos fichiers ici
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            ou cliquez pour parcourir &bull; PDF, JPG, PNG &bull; max {maxSizeMb} MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          multiple
          onChange={handleInputChange}
          className="sr-only"
          aria-label="Upload document"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* File list */}
      {documents.length > 0 && (
        <ul className="space-y-2" aria-label="Uploaded documents">
          {documents.map((doc) => {
            const Icon = getFileIcon(doc.type);

            return (
              <li
                key={doc.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5",
                  "bg-white dark:bg-stone-900",
                  "border border-stone-200 dark:border-stone-800"
                )}
              >
                {/* Icon */}
                <Icon
                  size={18}
                  className="shrink-0 text-stone-400 dark:text-stone-500"
                  aria-hidden="true"
                />

                {/* File info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {formatFileSize(doc.size)}
                  </p>
                </div>

                {/* Toggle public */}
                <button
                  type="button"
                  onClick={() => onTogglePublic(doc.id)}
                  className={cn(
                    "shrink-0 rounded-md p-1.5",
                    "transition-colors duration-fast",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
                    doc.is_public
                      ? "text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950"
                      : "text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  )}
                  title={doc.is_public ? "Public" : "Priv\u00e9"}
                  aria-label={
                    doc.is_public
                      ? "Rendre priv\u00e9"
                      : "Rendre public"
                  }
                >
                  {doc.is_public ? (
                    <Eye size={16} aria-hidden="true" />
                  ) : (
                    <EyeOff size={16} aria-hidden="true" />
                  )}
                </button>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => onRemove(doc.id)}
                  className={cn(
                    "shrink-0 rounded-md p-1.5",
                    "text-stone-400 dark:text-stone-500",
                    "hover:text-red-600 dark:hover:text-red-400",
                    "hover:bg-red-50 dark:hover:bg-red-950",
                    "transition-colors duration-fast",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:focus-visible:ring-red-400"
                  )}
                  aria-label={`Supprimer ${doc.name}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
