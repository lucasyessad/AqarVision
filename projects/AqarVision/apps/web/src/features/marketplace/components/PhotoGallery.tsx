"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Camera, Grid, ImageIcon } from "lucide-react";
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
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  // ── Empty state ──────────────────────────────────────────────
  if (sorted.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <div className="text-center">
          <ImageIcon className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" />
          <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-600">Aucune photo</p>
        </div>
      </div>
    );
  }

  // ── Single photo ─────────────────────────────────────────────
  if (sorted.length === 1) {
    return (
      <>
        <div
          className="relative h-full w-full cursor-pointer"
          onClick={() => openLightbox(0)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openLightbox(0)}
        >
          <Image
            src={sorted[0]!.storage_path}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        {lightboxIndex !== null && (
          <Lightbox
            sorted={sorted}
            index={lightboxIndex}
            title={title}
            onClose={closeLightbox}
            onPrev={goPrev}
            onNext={goNext}
            onSelect={setLightboxIndex}
          />
        )}
      </>
    );
  }

  // ── Multi-photo grid (Airbnb style) ──────────────────────────
  const secondary = sorted.slice(1, 5);
  const remaining = sorted.length - 5;

  return (
    <>
      <div className="grid h-full grid-cols-1 gap-1 md:grid-cols-[2fr_1fr]">
        {/* Main large photo */}
        <div
          className="relative cursor-pointer overflow-hidden"
          onClick={() => openLightbox(0)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openLightbox(0)}
        >
          <Image
            src={sorted[0]!.storage_path}
            alt={title}
            fill
            priority
            className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 66vw"
          />
        </div>

        {/* Right column: 2×2 grid */}
        <div className="hidden grid-rows-2 gap-1 md:grid">
          {secondary.map((photo, i) => {
            const isLast = i === secondary.length - 1 && remaining > 0;
            return (
              <div
                key={photo.id}
                className="relative cursor-pointer overflow-hidden"
                onClick={() => openLightbox(i + 1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openLightbox(i + 1)}
              >
                <Image
                  src={photo.storage_path}
                  alt={`${title} — ${i + 2}`}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {isLast && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <span className="text-lg font-semibold text-white">
                      +{remaining}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* "See all photos" button — overlaid bottom-right */}
        {sorted.length > 1 && (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 end-4 z-10 flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-lg backdrop-blur-sm transition-all hover:bg-white dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            <Grid className="h-4 w-4" />
            {sorted.length} photos
          </button>
        )}
      </div>

      {/* Mobile: photo count pill */}
      <div className="absolute bottom-4 start-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm md:hidden">
        <Camera className="h-3.5 w-3.5" />
        1 / {sorted.length}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          sorted={sorted}
          index={lightboxIndex}
          title={title}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
          onSelect={setLightboxIndex}
        />
      )}
    </>
  );
}

// ── Lightbox component ───────────────────────────────────────────
function Lightbox({
  sorted,
  index,
  title,
  onClose,
  onPrev,
  onNext,
  onSelect,
}: {
  sorted: ListingMediaDto[];
  index: number;
  title: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute end-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
        aria-label="Fermer"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <div className="absolute start-1/2 top-4 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
        {index + 1} / {sorted.length}
      </div>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        disabled={index === 0}
        className="absolute start-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Précédente"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Image — fill the viewport */}
      <div
        className="relative h-[80vh] w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={sorted[index]?.storage_path ?? ""}
          alt={`${title} — photo ${index + 1}`}
          fill
          className="rounded-lg object-contain"
          sizes="90vw"
          priority
        />
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        disabled={index === sorted.length - 1}
        className="absolute end-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Suivante"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Thumbnail strip */}
      {sorted.length > 1 && (
        <div
          className="absolute bottom-4 flex max-w-[90vw] gap-1.5 overflow-x-auto rounded-xl bg-black/40 p-2 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {sorted.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onSelect(i)}
              className={[
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all",
                i === index
                  ? "ring-2 ring-amber-500 ring-offset-1 ring-offset-black"
                  : "opacity-50 hover:opacity-100",
              ].join(" ")}
            >
              <Image
                src={m.storage_path}
                alt={`Miniature ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
