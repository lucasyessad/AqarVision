"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Lightbox, type LightboxImage } from "./Lightbox";

export interface PhotoGalleryProps {
  images: LightboxImage[];
  className?: string;
}

export function PhotoGallery({ images, className }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const mainImage = images[0];
  const thumbnails = images.slice(1, 5);
  const remainingCount = images.length - 5;

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-5 gap-2 rounded-xl overflow-hidden",
          className
        )}
      >
        {/* Main image — 60% width (3/5 cols) */}
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className={cn(
            "relative col-span-1 md:col-span-3 aspect-video",
            "overflow-hidden cursor-pointer group",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2"
          )}
          aria-label={mainImage!.alt}
        >
          <Image
            src={mainImage!.src}
            alt={mainImage!.alt}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </button>

        {/* Thumbnails — 2x2 grid in remaining 40% (2/5 cols) */}
        {thumbnails.length > 0 && (
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-2">
            {thumbnails.map((image, idx) => {
              const imageIndex = idx + 1;
              const isLast = idx === thumbnails.length - 1 && remainingCount > 0;

              return (
                <button
                  key={imageIndex}
                  type="button"
                  onClick={() => setLightboxIndex(imageIndex)}
                  className={cn(
                    "relative aspect-[4/3] overflow-hidden cursor-pointer group",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                  )}
                  aria-label={
                    isLast
                      ? `View all ${images.length} photos`
                      : image.alt
                  }
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {isLast && (
                    <div
                      className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        "bg-black/50 dark:bg-black/60",
                        "text-white font-semibold text-lg"
                      )}
                      aria-hidden="true"
                    >
                      +{remainingCount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
