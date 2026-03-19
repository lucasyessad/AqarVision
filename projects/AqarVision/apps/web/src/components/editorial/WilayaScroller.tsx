"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export interface WilayaScrollerItem {
  name: string;
  name_ar?: string;
  imageUrl: string;
  count: number;
  code: string;
}

export interface WilayaScrollerProps {
  wilayas: WilayaScrollerItem[];
  title?: string;
  subtitle?: string;
  locale?: string;
  className?: string;
}

export function WilayaScroller({
  wilayas,
  title,
  subtitle,
  locale,
  className,
}: WilayaScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAr = locale === "ar";

  function scroll(direction: "left" | "right") {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = container.querySelector("a")?.offsetWidth ?? 256;
    const scrollAmount = cardWidth + 16;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <section
      className={cn(
        "bg-stone-900 dark:bg-stone-950 py-16 lg:py-24",
        className
      )}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {title && (
          <div className="mb-10 flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-stone-400">{subtitle}</p>
            )}
          </div>
        )}

        <div className="relative">
          {/* Arrow left */}
          <button
            type="button"
            onClick={() => scroll("left")}
            className={cn(
              "absolute -start-4 top-1/2 z-10 -translate-y-1/2",
              "hidden lg:flex",
              "h-10 w-10 items-center justify-center rounded-full",
              "bg-stone-800 shadow-lg ring-1 ring-stone-700",
              "text-stone-300 hover:text-white hover:bg-stone-700",
              "transition-colors duration-fast"
            )}
            aria-label="Précédent"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2"
          >
            {wilayas.map((wilaya) => {
              const displayName =
                isAr && wilaya.name_ar ? wilaya.name_ar : wilaya.name;

              return (
                <Link
                  key={wilaya.code}
                  href={`/search?wilaya=${wilaya.code}`}
                  className={cn(
                    "relative shrink-0 snap-start overflow-hidden rounded-xl",
                    "w-52 sm:w-60 lg:w-64",
                    "aspect-[3/4]",
                    "group",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
                  )}
                >
                  {/* Photo */}
                  <Image
                    src={wilaya.imageUrl}
                    alt={displayName}
                    fill
                    sizes="(max-width: 640px) 208px, (max-width: 1024px) 240px, 256px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient overlay — stronger at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/30 to-transparent" />

                  {/* Amber accent on hover */}
                  <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors duration-normal" />

                  {/* Count pill — top right */}
                  <div className="absolute end-3 top-3 z-10">
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1",
                        "bg-stone-900/70 backdrop-blur-sm",
                        "text-xs font-medium text-stone-300",
                        "ring-1 ring-white/10"
                      )}
                    >
                      <MapPin size={10} className="text-amber-400" />
                      {wilaya.count.toLocaleString(isAr ? "ar-DZ" : "fr-FR")}
                    </span>
                  </div>

                  {/* Name — bottom */}
                  <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5">
                    <p className="text-lg font-bold text-white leading-tight group-hover:text-amber-300 transition-colors duration-fast">
                      {displayName}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-400">
                      {isAr
                        ? `${wilaya.count.toLocaleString("ar-DZ")} إعلان`
                        : `${wilaya.count.toLocaleString("fr-FR")} annonces`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Arrow right */}
          <button
            type="button"
            onClick={() => scroll("right")}
            className={cn(
              "absolute -end-4 top-1/2 z-10 -translate-y-1/2",
              "hidden lg:flex",
              "h-10 w-10 items-center justify-center rounded-full",
              "bg-stone-800 shadow-lg ring-1 ring-stone-700",
              "text-stone-300 hover:text-white hover:bg-stone-700",
              "transition-colors duration-fast"
            )}
            aria-label="Suivant"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
