"use client";

import Link from "next/link";

interface WilayaItem {
  code: string;
  name: string;
  sub?: string;
  count: string;
  imageUrl?: string;
}

interface WilayaScrollerProps {
  wilayas: WilayaItem[];
  locale: string;
}

export function WilayaScroller({ wilayas, locale }: WilayaScrollerProps) {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {wilayas.map((city) => (
        <Link
          key={city.code}
          href={`/${locale}/search?wilaya_code=${city.code}`}
          className="group relative flex w-48 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-xl bg-zinc-800 dark:bg-zinc-900 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg min-h-[200px]"
        >
          {/* Background image or gradient */}
          {city.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={city.imageUrl}
              alt={city.name}
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Content */}
          <div className="relative">
            <p className="font-mono text-xs font-semibold text-amber-400">{city.count}</p>
            <p className="text-sm font-bold text-zinc-50">{city.name}</p>
            {city.sub && (
              <p className="text-[10px] text-zinc-400">{city.sub}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
