"use client";

import { useActionState, useState, useRef } from "react";
import { uploadBrandingAction } from "../actions/upload-branding.action";
import type { BrandingType } from "../actions/upload-branding.action";
import type { ActionResult } from "@/features/agencies/types/agency.types";

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
          <h3 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
            {label}
          </h3>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--charcoal-500)" }}>
            {hint}
          </p>
          {displayUrl && (
            <div className={`mt-4 overflow-hidden border bg-gray-100 ${previewClass}`} style={{ borderColor: "#E3E8EF" }}>
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
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-all",
              isDragging
                ? "border-[var(--coral)] bg-[rgba(232,114,92,0.04)]"
                : selectedFile
                  ? "border-[var(--coral)] bg-[rgba(232,114,92,0.02)]"
                  : "border-[#E3E8EF] bg-[#F6F9FC] hover:border-[var(--coral)] hover:bg-[rgba(232,114,92,0.02)]",
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
                <svg className="mb-2 h-6 w-6" style={{ color: "var(--coral)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium" style={{ color: "var(--charcoal-700)" }}>{selectedFile.name}</p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-400)" }}>
                  {(selectedFile.size / 1024).toFixed(0)} Ko
                </p>
              </>
            ) : (
              <>
                <svg className="mb-2 h-7 w-7" style={{ color: "var(--charcoal-400)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm" style={{ color: "var(--charcoal-700)" }}>
                  Glissez le fichier ici ou{" "}
                  <span style={{ color: "var(--coral)", fontWeight: 500 }}>choisissez</span>
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--charcoal-400)" }}>
                  PNG, JPEG, WebP — max {maxSizeLabel}
                </p>
              </>
            )}
          </label>

          {/* Feedback */}
          {state?.success === false && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {state.error.message}
            </div>
          )}
          {state?.success === true && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Image enregistrée avec succès.
            </div>
          )}

          {/* Save button — only shown when a file is selected */}
          {selectedFile && (
            <button
              type="submit"
              disabled={isPending}
              className="self-start inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--coral)" }}
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
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
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
    <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "#E3E8EF" }}>
      {/* Card header */}
      <div className="border-b px-6 py-4" style={{ borderColor: "#E3E8EF" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
          Identité visuelle
        </h2>
        <p className="mt-0.5 text-xs" style={{ color: "var(--charcoal-500)" }}>
          Ces visuels apparaissent sur votre vitrine publique et dans les résultats de recherche.
        </p>
      </div>

      {/* Logo */}
      <div className="border-b p-6" style={{ borderColor: "#E3E8EF" }}>
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
