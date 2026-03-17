"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import { createDraftIndividualListingAction } from "../../actions/create-draft-individual.action";
import {
  getIndividualSignedUploadUrlAction,
  finalizeIndividualMediaUploadAction,
  deleteIndividualMediaAction,
} from "@/features/media/actions/individual-upload.action";
import type { WizardState } from "./wizard-state";

interface UploadedPhoto {
  media_id: string;
  url: string;
  storage_path: string;
  is_cover: boolean;
}

interface StepPhotosProps {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const MAX_PHOTOS = 20;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export function StepPhotos({ state, onChange, onNext, onBack }: StepPhotosProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [creatingDraft, startDraftTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Ensure draft exists before uploading
  async function ensureDraft(): Promise<string | null> {
    if (state.draft_listing_id) return state.draft_listing_id;

    return new Promise((resolve) => {
      startDraftTransition(async () => {
        const result = await createDraftIndividualListingAction({
          listing_type: state.listing_type,
          property_type: state.property_type,
          wilaya_code: state.wilaya_code,
          commune_id: state.commune_id ?? undefined,
          address_text: state.address_text || undefined,
          latitude: state.latitude ?? undefined,
          longitude: state.longitude ?? undefined,
          current_price: Number(state.current_price),
          surface_m2: state.surface_m2 ? Number(state.surface_m2) : undefined,
          floor: state.floor ? Number(state.floor) : undefined,
          total_floors: state.total_floors ? Number(state.total_floors) : undefined,
          year_built: state.year_built ? Number(state.year_built) : undefined,
          rooms: state.rooms || undefined,
          bathrooms: state.bathrooms || undefined,
          details: state.details,
          title: state.title,
          description: state.description,
        });

        if (result.success) {
          onChange({ draft_listing_id: result.data.listing_id, draft_slug: result.data.slug });
          resolve(result.data.listing_id);
        } else {
          setError(result.error.message);
          resolve(null);
        }
      });
    });
  }

  const uploadFile = useCallback(async (file: File, listingId: string) => {
    const fileKey = `${file.name}-${Date.now()}`;

    if (!ALLOWED_MIME.includes(file.type)) {
      setError(`Format non supporté : ${file.name}. Utilisez JPEG, PNG ou WebP.`);
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`Photo trop volumineuse : ${file.name} (max 10 Mo).`);
      return;
    }

    setProgress((p) => ({ ...p, [fileKey]: 0 }));

    const urlResult = await getIndividualSignedUploadUrlAction({
      listing_id: listingId,
      file_name: file.name,
      content_type: file.type,
      file_size_bytes: file.size,
    });

    if (!urlResult.success) {
      setError(urlResult.error.message);
      setProgress((p) => { const n = { ...p }; delete n[fileKey]; return n; });
      return;
    }

    // XHR upload with progress
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress((p) => ({ ...p, [fileKey]: Math.round((e.loaded / e.total) * 100) }));
        }
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed: ${xhr.status}`));
      });
      xhr.addEventListener("error", () => reject(new Error("Upload network error")));
      xhr.open("PUT", urlResult.data.signed_url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });

    setProgress((p) => ({ ...p, [fileKey]: 100 }));

    const finalResult = await finalizeIndividualMediaUploadAction({
      listing_id: listingId,
      storage_path: urlResult.data.storage_path,
      content_type: file.type,
      file_size_bytes: file.size,
    });

    setProgress((p) => { const n = { ...p }; delete n[fileKey]; return n; });

    if (finalResult.success) {
      setPhotos((prev) => [
        ...prev,
        {
          media_id: finalResult.data.id,
          url: finalResult.data.url,
          storage_path: finalResult.data.storage_path,
          is_cover: finalResult.data.is_cover,
        },
      ]);
    } else {
      setError(finalResult.error.message);
    }
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");

    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = Array.from(files).slice(0, remaining);

    if (toUpload.length === 0) {
      setError(`Maximum ${MAX_PHOTOS} photos atteint.`);
      return;
    }

    setUploading(true);
    const listingId = await ensureDraft();
    if (!listingId) { setUploading(false); return; }

    await Promise.all(toUpload.map((f) => uploadFile(f, listingId)));
    setUploading(false);
  }

  async function handleDelete(mediaId: string) {
    const result = await deleteIndividualMediaAction({ media_id: mediaId });
    if (result.success) {
      setPhotos((prev) => prev.filter((p) => p.media_id !== mediaId));
    }
  }

  const isUploading = uploading || creatingDraft || Object.keys(progress).length > 0;
  const canProceed = photos.length >= 1;

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); void handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={[
          "cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all",
          dragOver
            ? "scale-[1.01] border-amber-500 bg-amber-100/50"
            : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-amber-400 hover:bg-amber-50/50",
        ].join(" ")}
      >
        <svg className="mx-auto mb-3 h-10 w-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
        <p className="text-sm font-semibold text-zinc-600">Glissez vos photos ici</p>
        <p className="mt-1 text-xs text-zinc-400">ou cliquez pour sélectionner · JPEG, PNG, WebP · max 10 Mo · {photos.length}/{MAX_PHOTOS}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {/* Upload progress */}
      {Object.entries(progress).map(([key, pct]) => (
        <div key={key} className="space-y-1">
          <p className="text-xs text-zinc-500">Upload en cours...</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-150"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ))}

      {creatingDraft && (
        <p className="text-xs text-zinc-500">Création du brouillon...</p>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Thumbnails */}
      {photos.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-zinc-500">
            Photos ajoutées ({photos.length}/{MAX_PHOTOS})
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((photo, i) => (
              <div key={photo.media_id} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Photo ${i + 1}`}
                  className="h-24 w-full rounded-lg object-cover"
                />
                {/* Cover badge */}
                {i === 0 && (
                  <span className="absolute start-1 top-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-950 dark:text-zinc-50">
                    ⭐ Couverture
                  </span>
                )}
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => void handleDelete(photo.media_id)}
                  className="absolute end-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-50 transition-all group-hover:flex"
                  aria-label="Supprimer"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            💡 La première photo sera la couverture.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:bg-zinc-800"
        >
          ← Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isUploading}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-50 transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {canProceed ? "Suivant →" : "Ajoutez au moins 1 photo"}
        </button>
      </div>
    </div>
  );
}
