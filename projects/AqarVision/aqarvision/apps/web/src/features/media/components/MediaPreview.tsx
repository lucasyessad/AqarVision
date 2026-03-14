"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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

interface MediaPreviewProps {
  media: MediaDto[];
  initialIndex: number;
  onClose: () => void;
}

export function MediaPreview({
  media,
  initialIndex,
  onClose,
}: MediaPreviewProps) {
  const t = useTranslations("media");
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const current = media[currentIndex];
  const hasNext = currentIndex < media.length - 1;
  const hasPrev = currentIndex > 0;

  const goNext = useCallback(() => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  }, [hasNext]);

  const goPrev = useCallback(() => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  }, [hasPrev]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goNext, goPrev]);

  if (!current) {
    return null;
  }

  // Extract filename from storage_path
  const fileName = current.storage_path.split("/").pop() ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-block-start-4 inset-inline-end-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label={t("close")}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Previous button */}
      {hasPrev && (
        <button
          type="button"
          onClick={goPrev}
          className="absolute inset-inline-start-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          aria-label={t("previous")}
        >
          <svg
            className="h-6 w-6 rtl:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          type="button"
          onClick={goNext}
          className="absolute inset-inline-end-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          aria-label={t("next")}
        >
          <svg
            className="h-6 w-6 rtl:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="flex max-h-[85vh] max-w-[90vw] flex-col items-center">
        <img
          src={current.url}
          alt={`${t("image")} ${currentIndex + 1}`}
          className="max-h-[75vh] max-w-full rounded-lg object-contain"
        />

        {/* Info bar */}
        <div className="mt-4 flex items-center gap-4 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/80">
          <span>
            {currentIndex + 1} / {media.length}
          </span>
          <span className="h-4 w-px bg-white/30" />
          <span className="max-w-[200px] truncate">{fileName}</span>
          <span className="h-4 w-px bg-white/30" />
          <span>{formatFileSize(current.file_size_bytes)}</span>
          {current.width && current.height && (
            <>
              <span className="h-4 w-px bg-white/30" />
              <span>
                {current.width} x {current.height}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
