"use client";

import { useState, useEffect, useCallback } from "react";
import type { ListingMediaDto } from "../types/search.types";

interface PhotoGalleryProps {
  media: ListingMediaDto[];
  title: string;
}

export function PhotoGallery({ media, title }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sort: cover first, then by sort_order
  const sorted = [...media].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return a.sort_order - b.sort_order;
  });

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null && i < sorted.length - 1 ? i + 1 : i
    );
  }, [sorted.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-[21/9] items-center justify-center bg-gray-100">
        <svg
          className="h-16 w-16 text-gray-400"
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
      </div>
    );
  }

  return (
    <>
      {/* Gallery grid */}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
        {/* Main image */}
        <div
          className="relative aspect-[4/3] cursor-pointer overflow-hidden"
          onClick={() => openLightbox(0)}
          role="button"
          aria-label="Voir la photo principale"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openLightbox(0)}
        >
          <img
            src={sorted[0]?.storage_path ?? ""}
            alt={title}
            className="h-full w-full object-cover transition-opacity hover:opacity-90"
          />
          {/* Photo count pill */}
          {sorted.length > 1 && (
            <span className="absolute bottom-2 end-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
              </svg>
              {sorted.length} photos
            </span>
          )}
        </div>

        {/* Secondary 2×2 grid */}
        {sorted.length > 1 && (
          <div className="grid grid-cols-2 gap-1">
            {sorted.slice(1, 5).map((media, i) => {
              const isLast = i === 3 && sorted.length > 5;
              return (
                <div
                  key={media.id}
                  className="relative aspect-[4/3] cursor-pointer overflow-hidden"
                  onClick={() => openLightbox(i + 1)}
                  role="button"
                  aria-label={`Voir photo ${i + 2}`}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openLightbox(i + 1)}
                >
                  <img
                    src={media.storage_path}
                    alt={title}
                    className="h-full w-full object-cover transition-opacity hover:opacity-90"
                  />
                  {isLast && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="text-sm font-semibold text-white">
                        +{sorted.length - 5} photos
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute end-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Fermer"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute start-1/2 top-4 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
            {lightboxIndex + 1} / {sorted.length}
          </div>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            disabled={lightboxIndex === 0}
            className="absolute start-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Photo précédente"
          >
            <svg className="h-6 w-6 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Image */}
          <img
            src={sorted[lightboxIndex]?.storage_path ?? ""}
            alt={`${title} — photo ${lightboxIndex + 1}`}
            className="max-h-[88vh] max-w-[88vw] select-none rounded object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            disabled={lightboxIndex === sorted.length - 1}
            className="absolute end-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Photo suivante"
          >
            <svg className="h-6 w-6 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Thumbnails strip */}
          {sorted.length > 1 && (
            <div
              className="absolute bottom-4 flex max-w-[90vw] gap-1.5 overflow-x-auto px-2 pb-1"
              onClick={(e) => e.stopPropagation()}
            >
              {sorted.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setLightboxIndex(i)}
                  className={`h-12 w-16 shrink-0 overflow-hidden rounded transition-all ${
                    i === lightboxIndex
                      ? "ring-2 ring-amber-500 ring-offset-1 ring-offset-black"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={m.storage_path}
                    alt={`Miniature ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
