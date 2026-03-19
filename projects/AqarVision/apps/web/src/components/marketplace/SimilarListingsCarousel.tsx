"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ListingCard } from "./ListingCard";
import type { ListingCard as ListingCardType } from "@/features/listings/types/listing.types";

export interface SimilarListingsCarouselProps {
  listings: ListingCardType[];
  className?: string;
}

export function SimilarListingsCarousel({
  listings,
  className,
}: SimilarListingsCarouselProps) {
  const t = useTranslations("search");
  const scrollRef = useRef<HTMLDivElement>(null);

  if (listings.length === 0) return null;

  function scroll(direction: "left" | "right") {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = container.querySelector("a")?.offsetWidth ?? 300;
    const scrollAmount = cardWidth + 16;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <section className={cn("py-8", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50 sm:text-xl">
          {t("similarListings")}
        </h3>
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              "bg-stone-100 dark:bg-stone-800",
              "text-stone-600 dark:text-stone-400",
              "hover:bg-stone-200 dark:hover:bg-stone-700",
              "transition-colors duration-fast"
            )}
            aria-label="Previous"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              "bg-stone-100 dark:bg-stone-800",
              "text-stone-600 dark:text-stone-400",
              "hover:bg-stone-200 dark:hover:bg-stone-700",
              "transition-colors duration-fast"
            )}
            aria-label="Next"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
      >
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="w-[280px] shrink-0 snap-start sm:w-[300px]"
          >
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}
