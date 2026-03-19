import type { Map as MaplibreMap } from "maplibre-gl";

/**
 * Fly the map camera to a specific location with smooth animation.
 */
export function flyTo(
  map: MaplibreMap,
  lng: number,
  lat: number,
  zoom: number = 14
): void {
  map.flyTo({
    center: [lng, lat],
    zoom,
    duration: 1200,
    essential: true,
  });
}

/**
 * Fit the map to show all provided coordinates with padding.
 */
export function fitBounds(
  map: MaplibreMap,
  coordinates: Array<[number, number]>,
  padding: number = 60
): void {
  if (coordinates.length === 0) return;

  if (coordinates.length === 1) {
    flyTo(map, coordinates[0]![0], coordinates[0]![1], 12);
    return;
  }

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coordinates) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  map.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    {
      padding,
      duration: 1000,
    }
  );
}
