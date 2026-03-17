/**
 * Map utilities — public API.
 *
 * Usage:
 *   import { getMapStyle, MAP_CENTER_NORTH, flyToWilaya } from "@/lib/map";
 */

export {
  MAP_CENTER,
  MAP_CENTER_NORTH,
  MAP_ZOOM_COUNTRY,
  MAP_ZOOM_WILAYA,
  MAP_ZOOM_COMMUNE,
  MAP_ZOOM_LISTING,
  MAP_MAX_BOUNDS,
  getMapStyle,
  getTileUrl,
  getTileAttribution,
  MARKER_CLASSES,
  buildPopupHtml,
} from "./config";

export {
  buildWilayaPoints,
  getWilayaCenter,
  computeWilayaBounds,
  type WilayaFeatureCollection,
  type WilayaPointFeature,
  type WilayaFeatureProperties,
} from "./wilaya-geojson";

export { flyToWilaya, fitToWilayas } from "./fly-to";
