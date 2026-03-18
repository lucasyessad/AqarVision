export const MAP_CONFIG = {
  defaultCenter: [3.042, 36.753] as [number, number], // Algiers
  defaultZoom: 6,
  maxZoom: 18,
  minZoom: 4,
  bounds: [
    [-9.0, 18.96], // SW corner
    [12.0, 37.1], // NE corner
  ] as [[number, number], [number, number]],
} as const;

export function getStyleUrl(): string {
  return process.env.NEXT_PUBLIC_MAPLIBRE_STYLE_URL!;
}
