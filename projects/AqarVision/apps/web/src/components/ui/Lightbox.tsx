"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LightboxImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const touchDeltaRef = useRef<number>(0);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    containerRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function goNext() {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }

  function goPrev() {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowRight") {
      goNext();
    } else if (e.key === "ArrowLeft") {
      goPrev();
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = e.touches[0]?.clientX ?? 0;
    touchDeltaRef.current = 0;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartRef.current === null) return;
    touchDeltaRef.current = (e.touches[0]?.clientX ?? 0) - touchStartRef.current;
  }

  function handleTouchEnd() {
    if (touchStartRef.current === null) return;
    const threshold = 50;
    if (touchDeltaRef.current > threshold) {
      goPrev();
    } else if (touchDeltaRef.current < -threshold) {
      goNext();
    }
    touchStartRef.current = null;
    touchDeltaRef.current = 0;
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  if (images.length === 0) return null;

  const current = images[currentIndex];
  const transitionClass = prefersReducedMotion
    ? ""
    : "transition-opacity duration-300";

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${currentIndex + 1} of ${images.length}`}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "fixed inset-0 z-modal flex items-center justify-center",
        "bg-black/90 dark:bg-black/95",
        prefersReducedMotion ? "" : "animate-fade-in",
        "focus:outline-none"
      )}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className={cn(
          "absolute top-4 end-4 z-10",
          "rounded-full p-2",
          "text-white/80 hover:text-white",
          "bg-black/30 hover:bg-black/50",
          "transition-colors duration-fast",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        )}
        aria-label="Close lightbox"
      >
        <X size={24} aria-hidden="true" />
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className={cn(
            "absolute start-4 top-1/2 -translate-y-1/2 z-10",
            "rounded-full p-2",
            "text-white/80 hover:text-white",
            "bg-black/30 hover:bg-black/50",
            "transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            "hidden sm:flex"
          )}
          aria-label="Previous image"
        >
          <ChevronLeft size={28} aria-hidden="true" />
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className={cn(
            "absolute end-4 top-1/2 -translate-y-1/2 z-10",
            "rounded-full p-2",
            "text-white/80 hover:text-white",
            "bg-black/30 hover:bg-black/50",
            "transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            "hidden sm:flex"
          )}
          aria-label="Next image"
        >
          <ChevronRight size={28} aria-hidden="true" />
        </button>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div
          className={cn(
            "absolute bottom-6 start-1/2 -translate-x-1/2 z-10",
            "rounded-full px-4 py-1.5",
            "bg-black/50 text-white text-sm font-medium",
            "tabular-nums"
          )}
          aria-live="polite"
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Image */}
      <div
        className={cn(
          "relative w-full h-full max-w-[90vw] max-h-[85vh]",
          "flex items-center justify-center",
          "p-4 sm:p-8",
          transitionClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={current!.src}
          alt={current!.alt}
          width={current!.width}
          height={current!.height}
          className="max-w-full max-h-full object-contain"
          sizes="90vw"
          priority
        />
      </div>
    </div>,
    document.body
  );
}
