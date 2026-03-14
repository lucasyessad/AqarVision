"use client";

import { useTranslations } from "next-intl";

export function SearchMap() {
  const t = useTranslations("search");

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      {/* MapLibre integration in future sprint */}
      <div
        id="map"
        className="flex h-64 items-center justify-center bg-gray-100 lg:h-80"
      >
        <div className="text-center">
          <svg
            className="mx-auto mb-2 h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
            />
          </svg>
          <p className="text-sm text-gray-500">{t("map_coming_soon")}</p>
        </div>
      </div>
    </div>
  );
}
