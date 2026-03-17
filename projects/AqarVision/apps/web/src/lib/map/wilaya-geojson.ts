/**
 * Wilaya GeoJSON — generates point features for all 69 wilayas.
 *
 * Used for:
 *   - Wilaya markers on the map (cluster view at low zoom)
 *   - Fly-to targets when user selects a wilaya filter
 *   - Bounds calculation for multi-zone search
 */

import type { Wilaya, Locale } from "@/lib/geodata";
import { getWilayasWithCoords, getWilayaName, getCommunesByWilaya } from "@/lib/geodata";

// ── GeoJSON types ───────────────────────────────────────────────

export interface WilayaFeatureProperties {
  id: number;
  code: string;
  name: string;
  region: string | null;
  coastal: boolean;
  commune_count: number;
}

export interface WilayaPointFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: WilayaFeatureProperties;
}

export interface WilayaFeatureCollection {
  type: "FeatureCollection";
  features: WilayaPointFeature[];
}

// ── Generators ──────────────────────────────────────────────────

/**
 * Build a GeoJSON FeatureCollection of wilaya point features.
 * Each feature has the wilaya center coordinates and metadata.
 */
export function buildWilayaPoints(locale: Locale = "fr"): WilayaFeatureCollection {
  const wilayas = getWilayasWithCoords();

  return {
    type: "FeatureCollection",
    features: wilayas.map((w) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [w.lng, w.lat],
      },
      properties: {
        id: w.id,
        code: w.code,
        name: getWilayaName(w.code, locale),
        region: w.region,
        coastal: w.coastal,
        commune_count: getCommunesByWilaya(w.id).length,
      },
    })),
  };
}

/**
 * Get the [lng, lat] center for a wilaya.
 * Returns null if the wilaya has no coordinates.
 */
export function getWilayaCenter(
  wilaya: Wilaya
): [number, number] | null {
  if (wilaya.lat === null || wilaya.lng === null) return null;
  return [wilaya.lng, wilaya.lat];
}

/**
 * Compute bounding box for a set of wilayas.
 * Returns [[west, south], [east, north]] or null if no coordinates.
 */
export function computeWilayaBounds(
  wilayas: Wilaya[]
): [[number, number], [number, number]] | null {
  const coords = wilayas
    .filter((w): w is Wilaya & { lat: number; lng: number } =>
      w.lat !== null && w.lng !== null
    );

  if (coords.length === 0) return null;

  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  for (const w of coords) {
    if (w.lng < west) west = w.lng;
    if (w.lat < south) south = w.lat;
    if (w.lng > east) east = w.lng;
    if (w.lat > north) north = w.lat;
  }

  // Add padding (~20km margin)
  const PAD = 0.2;
  return [
    [west - PAD, south - PAD],
    [east + PAD, north + PAD],
  ];
}
