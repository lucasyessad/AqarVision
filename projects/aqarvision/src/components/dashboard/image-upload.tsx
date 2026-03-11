'use client';

import { useState, useRef, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImageUploadProps {
  agencyId: string;
  propertyId?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number; // 0-100
}

interface ValidationError {
  filename: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_WIDTH = 1920;

// ---------------------------------------------------------------------------
// Image compression via Canvas API
// ---------------------------------------------------------------------------

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.8);
    };
    img.src = URL.createObjectURL(file);
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImageUpload({
  agencyId,
  propertyId,
  value,
  onChange,
  maxImages = 15,
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Type de fichier non supporté (JPG, PNG ou WebP uniquement)';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Fichier trop volumineux (max 10 Mo, reçu ${(file.size / 1024 / 1024).toFixed(1)} Mo)`;
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // Upload
  // --------------------------------------------------------------------------

  const uploadFiles = useCallback(
    async (files: FileList) => {
      const remaining = maxImages - value.length;
      if (remaining <= 0) return;

      const candidates = Array.from(files).slice(0, remaining);
      const newErrors: ValidationError[] = [];
      const validFiles: File[] = [];

      for (const file of candidates) {
        const err = validateFile(file);
        if (err) {
          newErrors.push({ filename: file.name, reason: err });
        } else {
          validFiles.push(file);
        }
      }

      setErrors(newErrors);

      if (validFiles.length === 0) return;

      // Initialise progress entries
      const uploadEntries: UploadingFile[] = validFiles.map((f) => ({
        id: `${f.name}-${Date.now()}`,
        name: f.name,
        progress: 0,
      }));
      setUploading((prev) => [...prev, ...uploadEntries]);

      const uploadedUrls: string[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const entry = uploadEntries[i];

        try {
          // Compress before upload
          setUploading((prev) =>
            prev.map((u) => (u.id === entry.id ? { ...u, progress: 10 } : u)),
          );

          const compressed = await compressImage(file);

          setUploading((prev) =>
            prev.map((u) => (u.id === entry.id ? { ...u, progress: 40 } : u)),
          );

          const ext = 'jpg'; // compressImage always outputs jpeg
          const timestamp = Date.now();
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const folder = propertyId || 'temp';
          const storagePath = `${agencyId}/properties/${folder}/${timestamp}_${safeName}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('public')
            .upload(storagePath, compressed, {
              contentType: 'image/jpeg',
              upsert: false,
            });

          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            newErrors.push({ filename: file.name, reason: uploadError.message });
            setErrors([...newErrors]);
          } else {
            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public/${storagePath}`;
            uploadedUrls.push(publicUrl);
          }

          setUploading((prev) =>
            prev.map((u) => (u.id === entry.id ? { ...u, progress: 100 } : u)),
          );
        } catch (err) {
          console.error('Unexpected upload error:', err);
          newErrors.push({
            filename: file.name,
            reason: 'Erreur inattendue lors du téléchargement',
          });
          setErrors([...newErrors]);
        }
      }

      // Remove completed entries from uploading state
      setUploading((prev) => prev.filter((u) => !uploadEntries.some((e) => e.id === u.id)));

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agencyId, propertyId, value, maxImages, onChange],
  );

  // --------------------------------------------------------------------------
  // Drag & drop handlers
  // --------------------------------------------------------------------------

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  // --------------------------------------------------------------------------
  // Reorder helpers
  // --------------------------------------------------------------------------

  function handleReorder(fromIndex: number, toIndex: number) {
    const next = [...value];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
    setDragIndex(null);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    handleReorder(index, index - 1);
  }

  function moveDown(index: number) {
    if (index === value.length - 1) return;
    handleReorder(index, index + 1);
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  // --------------------------------------------------------------------------
  // Derived state
  // --------------------------------------------------------------------------

  const isUploading = uploading.length > 0;
  const atLimit = value.length >= maxImages;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Images ({value.length}/{maxImages})
        </label>
        {atLimit && (
          <span className="text-xs text-amber-600 font-medium">
            Limite atteinte
          </span>
        )}
      </div>

      {/* Drop zone */}
      {!atLimit && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Zone de dépôt d'images"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={[
            'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors',
            isUploading ? 'pointer-events-none opacity-60' : '',
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-gray-100',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              {/* Spinner */}
              <svg
                className="h-8 w-8 animate-spin text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-sm text-gray-600">
                Téléchargement en cours ({uploading.length} fichier
                {uploading.length > 1 ? 's' : ''})...
              </p>
              {/* Per-file progress */}
              <div className="w-full max-w-xs space-y-1 text-left">
                {uploading.map((u) => (
                  <div key={u.id}>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-0.5">
                      <span className="truncate max-w-[180px]">{u.name}</span>
                      <span>{u.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-1.5 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Glissez vos images ici ou{' '}
                <span className="text-blue-600 underline underline-offset-2">
                  cliquez pour sélectionner
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG, WebP — max 10 Mo par image — jusqu&apos;à {maxImages} images
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files);
            // Reset so re-selecting the same file triggers onChange again
            e.target.value = '';
          }
        }}
      />

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
          <p className="text-xs font-semibold text-red-700">
            {errors.length} fichier{errors.length > 1 ? 's' : ''} ignoré{errors.length > 1 ? 's' : ''} :
          </p>
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-600">
              <span className="font-medium">{err.filename}</span> — {err.reason}
            </p>
          ))}
          <button
            type="button"
            onClick={() => setErrors([])}
            className="text-xs text-red-500 underline mt-1"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Image preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('ring-2', 'ring-blue-500');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
                if (dragIndex !== null && dragIndex !== index) {
                  handleReorder(dragIndex, index);
                }
              }}
              className="group relative aspect-square cursor-move overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {/* Move up */}
                <button
                  type="button"
                  title="Monter"
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveUp(index);
                  }}
                  className="rounded-full bg-white/80 p-1 text-gray-700 hover:bg-white disabled:opacity-30"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  title="Supprimer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  className="rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Move down */}
                <button
                  type="button"
                  title="Descendre"
                  disabled={index === value.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveDown(index);
                  }}
                  className="rounded-full bg-white/80 p-1 text-gray-700 hover:bg-white disabled:opacity-30"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Position badge */}
              <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white">
                {index + 1}
              </span>

              {/* Primary badge */}
              {index === 0 && (
                <span className="absolute bottom-2 left-2 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reorder hint */}
      {value.length > 1 && (
        <p className="text-xs text-gray-400">
          Glissez les images pour les réorganiser, ou utilisez les flèches au survol. La
          première image sera l&apos;image principale.
        </p>
      )}
    </div>
  );
}
