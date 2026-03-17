/**
 * Map navigation helpers — animated zoom to wilaya/wilayas.
 *
 * These functions accept a MapLibre Map instance and animate
 * to the target location using the geodata coordinates.
 */

import { getWilaya, type Wilaya } from "@/lib/geodata";
import { getWilayaCenter, computeWilayaBounds } from "./wilaya-geojson";
import { MAP_ZOOM_WILAYA, MAP_CENTER_NORTH, MAP_ZOOM_COUNTRY } from "./config";

type MapInstance = {
  flyTo: (opts: {
    center: [number, number];
    zoom: number;
    duration?: number;
    essential?: boolean;
  }) => void;
  fitBounds: (
    bounds: [[number, number], [number, number]],
    opts?: { padding?: number; duration?: number; maxZoom?: number }
  ) => void;
};

/**
 * Animate map to center on a specific wilaya.
 *
 * @param map    MapLibre Map instance
 * @param code   Two-digit wilaya code (e.g. "16" for Algiers)
 * @param zoom   Optional zoom level (default: MAP_ZOOM_WILAYA = 10)
 * @returns      true if fly-to succeeded, false if wilaya not found
 */
export function flyToWilaya(
  map: MapInstance,
  code: string,
  zoom: number = MAP_ZOOM_WILAYA
): boolean {
  const wilaya = getWilaya(code);
  if (!wilaya) return false;

  const center = getWilayaCenter(wilaya);
  if (!center) return false;

  map.flyTo({
    center,
    zoom,
    duration: 1200,
    essential: true,
  });

  return true;
}

/**
 * Fit map view to show multiple wilayas.
 * Used for multi-zone search results.
 *
 * @param map     MapLibre Map instance
 * @param codes   Array of two-digit wilaya codes
 * @param padding Pixel padding around bounds (default: 50)
 * @returns       true if fit succeeded, false if no valid wilayas
 */
export function fitToWilayas(
  map: MapInstance,
  codes: string[],
  padding: number = 50
): boolean {
  if (codes.length === 0) {
    // Reset to country view
    map.flyTo({
      center: MAP_CENTER_NORTH,
      zoom: MAP_ZOOM_COUNTRY,
      duration: 1200,
      essential: true,
    });
    return true;
  }

  if (codes.length === 1) {
    return flyToWilaya(map, codes[0]!);
  }

  const wilayas = codes
    .map((code) => getWilaya(code))
    .filter((w): w is Wilaya => w !== undefined);

  const bounds = computeWilayaBounds(wilayas);
  if (!bounds) return false;

  map.fitBounds(bounds, {
    padding,
    duration: 1200,
    maxZoom: MAP_ZOOM_WILAYA,
  });

  return true;
}
