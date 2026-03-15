"use client";

import { useState } from "react";

interface UploadZoneProps {
  label: string;
  hint: string;
  aspectRatio: "square" | "panoramic";
  maxSizeLabel: string;
  currentUrl: string | null;
}

function UploadZone({ label, hint, aspectRatio, maxSizeLabel, currentUrl }: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isDragging, setIsDragging] = useState(false);

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

  const previewClass = aspectRatio === "square"
    ? "aspect-square w-24 rounded-full"
    : "aspect-[4/1] w-full rounded-lg";

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
      {/* Left: label + hint */}
      <div>
        <h3 className="text-sm font-semibold" style={{ color: "var(--charcoal-950)" }}>
          {label}
        </h3>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--charcoal-500)" }}>
          {hint}
        </p>
        {preview && (
          <div className={`mt-4 overflow-hidden border bg-gray-100 ${previewClass}`} style={{ borderColor: "#E3E8EF" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={label} className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      {/* Right: upload zone */}
      <div>
        <label
          className={[
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-all",
            isDragging
              ? "border-[var(--coral)] bg-[rgba(232,114,92,0.04)]"
              : "border-[#E3E8EF] bg-[#F6F9FC] hover:border-[var(--coral)] hover:bg-[rgba(232,114,92,0.02)]",
          ].join(" ")}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileChange(e.dataTransfer.files[0] ?? null);
          }}
        >
          <svg className="mb-3 h-8 w-8" style={{ color: "var(--charcoal-400)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm" style={{ color: "var(--charcoal-700)" }}>
            Glissez le fichier ici ou{" "}
            <span style={{ color: "var(--coral)", fontWeight: 500 }}>choisissez</span>
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--charcoal-400)" }}>
            PNG, JPEG, WebP — max {maxSizeLabel}
          </p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
    </div>
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

      {/* Logo section */}
      <div className="border-b p-6" style={{ borderColor: "#E3E8EF" }}>
        <UploadZone
          label="Logo de l'agence"
          hint="Image carrée de votre agence. Recommandé : 400 × 400 px minimum."
          aspectRatio="square"
          maxSizeLabel="500 Ko"
          currentUrl={currentLogoUrl}
        />
      </div>

      {/* Cover section */}
      <div className="border-b p-6" style={{ borderColor: "#E3E8EF" }}>
        <UploadZone
          label="Image de couverture"
          hint="Bannière panoramique affichée en haut de votre vitrine. Recommandé : 1200 × 400 px."
          aspectRatio="panoramic"
          maxSizeLabel="2 Mo"
          currentUrl={currentCoverUrl}
        />
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-3 px-6 py-4" style={{ background: "#F6F9FC" }}>
        <svg className="h-4 w-4 shrink-0" style={{ color: "var(--charcoal-400)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-xs" style={{ color: "var(--charcoal-500)" }}>
          L&apos;upload vers Supabase Storage sera disponible prochainement. Les fichiers sont prévisualisés localement.
        </p>
      </div>
    </div>
  );
}
