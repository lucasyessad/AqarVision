"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export interface WilayaScrollerItem {
  name: string;
  imageUrl: string;
  count: number;
  code: string;
}

export interface WilayaScrollerProps {
  wilayas: WilayaScrollerItem[];
  title?: string;
  className?: string;
}

export function WilayaScroller({
  wilayas,
  title,
  className,
}: WilayaScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = container.querySelector("a")?.offsetWidth ?? 176;
    const scrollAmount = cardWidth + 16; // card width + gap
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <section
      className={cn(
        "bg-stone-50 dark:bg-stone-950 py-16 lg:py-20",
        className
      )}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="mb-8 text-2xl font-bold text-stone-900 dark:text-stone-50 sm:text-3xl">
            {title}
          </h2>
        )}

        <div className="relative">
          {/* Desktop arrow left */}
          <button
            type="button"
            onClick={() => scroll("left")}
            className={cn(
              "absolute -start-4 top-1/2 z-10 -translate-y-1/2",
              "hidden lg:flex",
              "h-10 w-10 items-center justify-center rounded-full",
              "bg-white dark:bg-stone-800 shadow-md",
              "text-stone-700 dark:text-stone-300",
              "hover:bg-stone-50 dark:hover:bg-stone-700",
              "transition-colors duration-fast"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
          >
            {wilayas.map((wilaya) => (
              <Link
                key={wilaya.code}
                href={`/search?wilaya=${wilaya.code}`}
                className={cn(
                  "relative shrink-0 snap-start overflow-hidden rounded-2xl",
                  "w-36 lg:w-44 aspect-[3/4]",
                  "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 dark:focus-visible:ring-offset-stone-950"
                )}
              >
                <Image
                  src={wilaya.imageUrl}
                  alt={wilaya.name}
                  fill
                  sizes="(max-width: 1024px) 144px, 176px"
                  className="object-cover transition-transform duration-slow group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-4">
                  <p className="text-sm font-semibold text-white sm:text-base">
                    {wilaya.name}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-300 dark:text-stone-400">
                    {wilaya.count.toLocaleString("fr-FR")} annonces
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop arrow right */}
          <button
            type="button"
            onClick={() => scroll("right")}
            className={cn(
              "absolute -end-4 top-1/2 z-10 -translate-y-1/2",
              "hidden lg:flex",
              "h-10 w-10 items-center justify-center rounded-full",
              "bg-white dark:bg-stone-800 shadow-md",
              "text-stone-700 dark:text-stone-300",
              "hover:bg-stone-50 dark:hover:bg-stone-700",
              "transition-colors duration-fast"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
