"use client";

import { useActionState, useState, useRef } from "react";
import { uploadBrandingAction } from "../actions/upload-branding.action";
import type { BrandingType } from "../actions/upload-branding.action";
import type { ActionResult } from "@/features/agencies/types/agency.types";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  label: string;
  hint: string;
  aspectRatio: "square" | "panoramic";
  maxSizeLabel: string;
  brandingType: BrandingType;
  currentUrl: string | null;
}

function UploadZone({ label, hint, aspectRatio, maxSizeLabel, brandingType, currentUrl }: UploadZoneProps) {
  type State = ActionResult<{ url: string; type: BrandingType }> | null;
  const [state, formAction, isPending] = useActionState<State, FormData>(uploadBrandingAction, null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // On success, update preview with the saved URL
  const displayUrl = state?.success ? state.data.url : preview;

  function handleFileSelect(file: File | null) {
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const previewClass = aspectRatio === "square"
    ? "aspect-square w-24 rounded-full"
    : "aspect-[3/1] w-full rounded-lg";

  return (
    <form action={formAction}>
      <input type="hidden" name="type" value={brandingType} />
      {/* Hidden file input that receives the selected file */}
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        {/* Left: label + preview */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            {label}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {hint}
          </p>
          {displayUrl && (
            <div className={`mt-4 overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 ${previewClass}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayUrl} alt={label} className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {/* Right: drop zone + feedback + button */}
        <div className="flex flex-col gap-3">
          {/* Drop zone */}
          <label
            className={[
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all",
              isDragging
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10"
                : selectedFile
                  ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/5"
                  : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10",
            ].join(" ")}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileSelect(e.dataTransfer.files[0] ?? null);
              // Assign to the hidden input
              if (inputRef.current && e.dataTransfer.files[0]) {
                const dt = new DataTransfer();
                dt.items.add(e.dataTransfer.files[0]);
                inputRef.current.files = dt.files;
              }
            }}
            onClick={() => inputRef.current?.click()}
          >
            {selectedFile ? (
              <>
                <CheckCircle className="mb-2 h-6 w-6 text-amber-500" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{selectedFile.name}</p>
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                  {(selectedFile.size / 1024).toFixed(0)} Ko
                </p>
              </>
            ) : (
              <>
                <Upload className="mb-2 h-7 w-7 text-zinc-400 dark:text-zinc-500" />
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  Glissez le fichier ici ou{" "}
                  <span className="font-medium text-amber-500">choisissez</span>
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  PNG, JPEG, WebP — max {maxSizeLabel}
                </p>
              </>
            )}
          </label>

          {/* Feedback */}
          {state?.success === false && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {state.error.message}
            </div>
          )}
          {state?.success === true && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-3 py-2 text-xs text-green-700 dark:text-green-400">
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              Image enregistrée avec succès.
            </div>
          )}

          {/* Save button — only shown when a file is selected */}
          {selectedFile && (
            <button
              type="submit"
              disabled={isPending}
              className="self-start inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 dark:text-zinc-50 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Enregistrer {brandingType === "logo" ? "le logo" : "la couverture"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

interface BrandingUploadProps {
  currentLogoUrl: string | null;
  currentCoverUrl: string | null;
}

export function BrandingUpload({ currentLogoUrl, currentCoverUrl }: BrandingUploadProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      {/* Card header */}
      <div className="border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          Identité visuelle
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Ces visuels apparaissent sur votre vitrine publique et dans les résultats de recherche.
        </p>
      </div>

      {/* Logo */}
      <div className="border-b border-zinc-200 dark:border-zinc-700 p-6">
        <UploadZone
          label="Logo de l'agence"
          hint="Image carrée de votre agence. Recommandé : 400 × 400 px minimum."
          aspectRatio="square"
          maxSizeLabel="500 Ko"
          brandingType="logo"
          currentUrl={currentLogoUrl}
        />
      </div>

      {/* Cover */}
      <div className="p-6">
        <UploadZone
          label="Image de couverture"
          hint="Bannière panoramique affichée en haut de votre vitrine. Recommandé : 1200 × 400 px."
          aspectRatio="panoramic"
          maxSizeLabel="2 Mo"
          brandingType="cover"
          currentUrl={currentCoverUrl}
        />
      </div>
    </div>
  );
}
