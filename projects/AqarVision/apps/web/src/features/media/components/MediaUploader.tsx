"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  getSignedUploadUrlAction,
  finalizeMediaUploadAction,
} from "../actions/upload.action";
import { ALLOWED_TYPES, MAX_SIZE_BYTES } from "../schemas/media.schema";
import type { MediaDto } from "../types/media.types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 1,
    }).format(bytes / 1024) + " KB";
  }
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(bytes / (1024 * 1024)) + " MB";
}

interface MediaUploaderProps {
  listingId: string;
  onUploadComplete?: (media: MediaDto) => void;
}

export function MediaUploader({
  listingId,
  onUploadComplete,
}: MediaUploaderProps) {
  const t = useTranslations("media");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (
        !ALLOWED_TYPES.includes(
          file.type as (typeof ALLOWED_TYPES)[number]
        )
      ) {
        return t("error_invalid_type");
      }
      if (file.size > MAX_SIZE_BYTES) {
        return t("error_file_too_large", {
          max: formatFileSize(MAX_SIZE_BYTES),
        });
      }
      return null;
    },
    [t]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsUploading(true);
      setProgress(0);

      try {
        // Step 1: Get signed upload URL
        setProgress(10);
        const urlResult = await getSignedUploadUrlAction({
          listing_id: listingId,
          file_name: file.name,
          content_type: file.type,
          file_size_bytes: file.size,
        });

        if (!urlResult.success) {
          setError(urlResult.error.message);
          return;
        }

        // Step 2: Upload directly to storage
        setProgress(30);
        const uploadResponse = await fetch(urlResult.data.signed_url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          setError(t("error_upload_failed"));
          return;
        }

        // Step 3: Finalize in DB
        setProgress(80);
        const finalizeResult = await finalizeMediaUploadAction({
          listing_id: listingId,
          storage_path: urlResult.data.storage_path,
          content_type: file.type,
          file_size_bytes: file.size,
        });

        if (!finalizeResult.success) {
          setError(finalizeResult.error.message);
          return;
        }

        setProgress(100);
        onUploadComplete?.(finalizeResult.data);
      } catch {
        setError(t("error_upload_failed"));
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [listingId, onUploadComplete, validateFile, t]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [uploadFile]
  );

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click();
          }
        }}
        className={`
          flex cursor-pointer flex-col items-center justify-center
          rounded-xl border-2 border-dashed p-8 transition-colors
          ${
            isDragging
              ? "border-amber-500 bg-amber-500/5"
              : "border-gray-300 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-900/40"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        {/* Upload icon */}
        <svg
          className="mb-3 h-10 w-10 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>

        <p className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {t("drop_zone_title")}
        </p>
        <p className="text-xs text-zinc-400">
          {t("drop_zone_subtitle", {
            types: "JPEG, PNG, WebP",
            max: formatFileSize(MAX_SIZE_BYTES),
          })}
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Progress bar */}
      {isUploading && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-zinc-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400">
            {t("uploading", { progress })}
          </p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
