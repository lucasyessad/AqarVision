"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UploadZoneProps {
  label: string;
  description: string;
  aspectRatio: "square" | "panoramic";
  maxSizeLabel: string;
  currentUrl: string | null;
}

// ── Upload zone (UI only — Supabase Storage TODO) ─────────────────────────────

function UploadZone({
  label,
  description,
  aspectRatio,
  maxSizeLabel,
  currentUrl,
}: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isDragging, setIsDragging] = useState(false);

  /*
   * TODO: implémenter l'upload réel via Supabase Storage signed URLs
   *
   * Flow recommandé :
   *   1. Appeler GET /api/upload/agency-media?type=logo|cover
   *      → Server Action ou Route Handler génère une signed upload URL
   *        via supabase.storage.from("agency-media").createSignedUploadUrl(path)
   *   2. Uploader le fichier directement depuis le browser avec fetch(signedUrl, { method: 'PUT', body: file })
   *   3. Une fois uploadé, récupérer l'URL publique et mettre à jour
   *      agencies.logo_url ou agencies.cover_url via updateAgencyAction
   *
   * Buckets recommandés :
   *   - "agency-media" (public) — logos + covers
   *   - path pattern : `{agencyId}/logo.{ext}` et `{agencyId}/cover.{ext}`
   */
  function handleFileChange(file: File | null) {
    if (!file) return;
    const maxBytes = aspectRatio === "square" ? 500 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert(`Fichier trop volumineux. Maximum : ${maxSizeLabel}`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const aspectClass =
    aspectRatio === "square" ? "aspect-square max-w-xs" : "aspect-[16/5] w-full";

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <p className="mb-3 text-xs text-gray-500">{description}</p>

      {/* Preview */}
      {preview && (
        <div className={`mb-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 ${aspectClass}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={label}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Drop zone */}
      <div
        className={[
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          isDragging
            ? "border-blue-night bg-blue-night/5"
            : "border-gray-300 bg-gray-50 hover:border-gray-400",
        ].join(" ")}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0] ?? null;
          handleFileChange(file);
        }}
      >
        <svg
          className="mx-auto mb-2 h-8 w-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm text-gray-500">
          Glissez votre {label.toLowerCase()} ici ou{" "}
          <label className="cursor-pointer font-medium text-blue-night hover:underline">
            choisissez un fichier
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          PNG, JPEG ou WebP — max {maxSizeLabel}
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface BrandingUploadProps {
  currentLogoUrl: string | null;
  currentCoverUrl: string | null;
}

export function BrandingUpload({
  currentLogoUrl,
  currentCoverUrl,
}: BrandingUploadProps) {
  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <UploadZone
          label="Logo"
          description="Image carrée représentant votre agence. Recommandé : 400×400 px."
          aspectRatio="square"
          maxSizeLabel="500 Ko"
          currentUrl={currentLogoUrl}
        />
      </div>

      {/* Cover */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <UploadZone
          label="Image de couverture"
          description="Bannière panoramique affichée en haut de votre profil public. Recommandé : 1200×400 px."
          aspectRatio="panoramic"
          maxSizeLabel="2 Mo"
          currentUrl={currentCoverUrl}
        />
      </div>

      {/* Save note */}
      <p className="text-sm text-gray-400">
        L&apos;upload des fichiers sera disponible prochainement via Supabase
        Storage. En attendant, vous pouvez renseigner les URLs directement dans
        les paramètres de l&apos;agence.
      </p>
    </div>
  );
}
