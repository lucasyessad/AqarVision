/**
 * Map configuration — centralized constants for MapLibre GL.
 *
 * All geographic constants come from @/lib/geodata.
 * No hardcoded coordinates anywhere else.
 */

import { ALGERIA_CENTER, ALGERIA_BOUNDS } from "@/lib/geodata";

// ── Map defaults ────────────────────────────────────────────────

/** Default center point (geometric center of Algeria). */
export const MAP_CENTER: [number, number] = [ALGERIA_CENTER.lng, ALGERIA_CENTER.lat];

/** Default center for northern Algeria (where most properties are). */
export const MAP_CENTER_NORTH: [number, number] = [3.0588, 36.7538]; // Algiers

/** Default zoom level showing all of Algeria. */
export const MAP_ZOOM_COUNTRY = 5;

/** Zoom level for a single wilaya. */
export const MAP_ZOOM_WILAYA = 10;

/** Zoom level for a commune-level view. */
export const MAP_ZOOM_COMMUNE = 13;

/** Zoom level for a single listing. */
export const MAP_ZOOM_LISTING = 16;

/** Maximum bounds — prevent panning outside Algeria + margin. */
export const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [ALGERIA_BOUNDS.west - 2, ALGERIA_BOUNDS.south - 1], // SW
  [ALGERIA_BOUNDS.east + 2, ALGERIA_BOUNDS.north + 1], // NE
];

// ── Tile source ─────────────────────────────────────────────────

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

export function getTileUrl(): string {
  if (MAPTILER_KEY) {
    return `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
  }
  return "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
}

export function getTileAttribution(): string {
  if (MAPTILER_KEY) {
    return "© MapTiler © OpenStreetMap contributors";
  }
  return "© OpenStreetMap contributors";
}

/** Pre-built MapLibre style object for raster tiles. */
export function getMapStyle(): Record<string, unknown> {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: [getTileUrl()],
        tileSize: 256,
        attribution: getTileAttribution(),
      },
    },
    layers: [
      {
        id: "osm",
        type: "raster",
        source: "osm",
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  };
}

// ── Marker styling ──────────────────────────────────────────────

/** Price marker styles — uses design system tokens, no hex hardcoding. */
export const MARKER_CLASSES = {
  /** Base marker pill */
  base: "cursor-pointer select-none rounded-full px-2.5 py-1 text-xs font-bold shadow-md whitespace-nowrap transition-all",
  /** Default state — dark on light */
  default: "bg-zinc-950 text-zinc-50 border border-zinc-800",
  /** Highlighted/active state */
  active: "bg-sahara-500 text-white border border-sahara-600 scale-110",
  /** Wilaya cluster marker */
  cluster: "bg-med-500 text-white border border-med-600 text-sm font-semibold",
} as const;

// ── Popup ───────────────────────────────────────────────────────

/**
 * Build popup HTML for a listing marker.
 * Uses Tailwind classes (no inline styles).
 */
export function buildPopupHtml(opts: {
  title: string;
  price: string;
  href: string;
  ctaLabel: string;
}): string {
  return `
    <div class="p-2 min-w-[160px]">
      <p class="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate mb-1">${opts.title}</p>
      <p class="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">${opts.price}</p>
      <a
        href="${opts.href}"
        class="block w-full rounded bg-zinc-900 dark:bg-zinc-100 px-3 py-1 text-center text-xs font-medium text-white dark:text-zinc-900 hover:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
      >
        ${opts.ctaLabel}
      </a>
    </div>
  `;
}
