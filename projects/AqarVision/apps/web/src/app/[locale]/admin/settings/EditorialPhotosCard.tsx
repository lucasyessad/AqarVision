"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  getEditorialUploadUrlAction,
  saveEditorialPhotoAction,
} from "@/features/admin/actions/editorial-photo.action";

interface PhotoSlot {
  key: string;
  label: string;
  hint: string;
  currentUrl: string | null;
}

interface EditorialPhotosCardProps {
  slots: PhotoSlot[];
}

function UploadSlot({ slot }: { slot: PhotoSlot }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(slot.currentUrl);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setSaved(false);
    setUploading(true);
    setProgress(10);

    try {
      // Step 1 — get signed URL
      const urlResult = await getEditorialUploadUrlAction(slot.key, file.name);
      if (!urlResult.success) throw new Error(urlResult.error.message);
      setProgress(30);

      // Step 2 — upload directly to Supabase Storage
      const res = await fetch(urlResult.data.signed_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error(`Upload échoué (${res.status})`);
      setProgress(80);

      // Step 3 — save public URL to platform_settings
      const saveResult = await saveEditorialPhotoAction(slot.key, urlResult.data.path);
      if (!saveResult.success) throw new Error(saveResult.error.message);
      setProgress(100);

      setPreview(saveResult.data.url);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium text-white/90 dark:text-zinc-100">{slot.label}</p>
        <p className="mt-0.5 text-xs text-white/40 dark:text-zinc-400">{slot.hint}</p>
      </div>

      {/* Preview */}
      <div className="relative h-36 w-full overflow-hidden rounded-xl bg-white/[0.06] dark:bg-zinc-800 border border-dashed border-white/15 dark:border-zinc-700">
        {preview ? (
          <Image src={preview} alt={slot.label} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-8 w-8 text-white/20 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 10.5h.008v.008H18V10.5zm-12 6h12a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0018 4.5H6A2.25 2.25 0 003.75 6.75v7.5A2.25 2.25 0 006 16.5z" />
            </svg>
          </div>
        )}

        {/* Progress bar */}
        {progress > 0 && progress < 100 && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Drop zone / button */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500/15 py-2.5 text-sm font-medium text-amber-500 transition-opacity hover:opacity-80"
      >
        {uploading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Upload en cours…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {preview ? "Remplacer la photo" : "Choisir une photo"}
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />

      {error && <p className="text-xs text-red-400">{error}</p>}
      {saved && <p className="text-xs text-green-400">Photo enregistrée</p>}
    </div>
  );
}

export function EditorialPhotosCard({ slots }: EditorialPhotosCardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 rounded-xl bg-white/[0.04] dark:bg-zinc-800/50 p-5 sm:grid-cols-3">
      {slots.map((slot) => (
        <UploadSlot key={slot.key} slot={slot} />
      ))}
    </div>
  );
}
