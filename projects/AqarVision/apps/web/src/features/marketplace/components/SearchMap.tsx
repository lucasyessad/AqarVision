"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import type { MapBounds } from "../schemas/search.schema";
import { formatPrice } from "@/lib/format";
import {
  MAP_CENTER_NORTH,
  MAP_ZOOM_COUNTRY,
  MAP_MAX_BOUNDS,
  getMapStyle,
  MARKER_CLASSES,
  buildPopupHtml,
  flyToWilaya,
  fitToWilayas,
  buildWilayaPoints,
} from "@/lib/map";
import type { Locale } from "@/lib/geodata";

import type { Map as MapLibreMap, Marker as MapLibreMarker, Popup as MapLibrePopup } from "maplibre-gl";

export interface MapListing {
  id: string;
  lat: number;
  lng: number;
  price: number;
  currency: string;
  title: string;
  slug: string;
}

interface SearchMapProps {
  listings: MapListing[];
  onBoundsChange: (bounds: MapBounds) => void;
  locale?: string;
  /** When true, the map fills its parent container (used in split layout) */
  fillContainer?: boolean;
  /** Called with listing id on marker hover, null on leave */
  onListingHover?: (id: string | null) => void;
  /** Wilaya code(s) to zoom to — from search filters */
  activeWilayas?: string[];
  /** ID of the listing to highlight on the map */
  highlightedListingId?: string | null;
  /** Called when user draws/clears a polygon. WKT string or null. */
  onDrawPolygon?: (polygonWkt: string | null) => void;
}

const DRAW_SOURCE_ID = "draw-polygon-source";
const DRAW_FILL_LAYER_ID = "draw-polygon-fill";
const DRAW_LINE_LAYER_ID = "draw-polygon-line";
const DRAW_POINTS_LAYER_ID = "draw-polygon-points";
const DRAW_POINTS_SOURCE_ID = "draw-polygon-points-source";

/** Convert an array of [lng, lat] points to a WKT POLYGON string */
function pointsToWkt(points: [number, number][]): string {
  // Close the ring by repeating the first point
  const ring = [...points, points[0]!];
  const coords = ring.map(([lng, lat]) => `${lng} ${lat}`).join(", ");
  return `POLYGON((${coords}))`;
}

/** Build a GeoJSON Polygon from an array of [lng, lat] points */
function buildPolygonGeoJson(points: [number, number][]): GeoJSON.Feature<GeoJSON.Polygon> {
  const ring = [...points, points[0]!];
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [ring],
    },
  };
}

/** Build a GeoJSON FeatureCollection of points for the polygon vertices */
function buildPointsGeoJson(points: [number, number][]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: points.map((coord) => ({
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: coord },
    })),
  };
}

export function SearchMap({
  listings,
  onBoundsChange,
  locale = "fr",
  fillContainer,
  onListingHover,
  activeWilayas,
  highlightedListingId,
  onDrawPolygon,
}: SearchMapProps) {
  const t = useTranslations("search");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [hasPolygon, setHasPolygon] = useState(false);
  const drawClickHandlerRef = useRef<((e: { lngLat: { lng: number; lat: number } }) => void) | null>(null);
  const wilayaMarkersRef = useRef<MapLibreMarker[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced bounds change handler
  const handleBoundsChange = useCallback(
    (map: MapLibreMap) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const rawBounds = map.getBounds();
        const bounds: MapBounds = {
          north: rawBounds.getNorth(),
          south: rawBounds.getSouth(),
          east: rawBounds.getEast(),
          west: rawBounds.getWest(),
        };
        onBoundsChange(bounds);
      }, 500);
    },
    [onBoundsChange]
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mapInstance: MapLibreMap;

    import("maplibre-gl").then((maplibre) => {
      if (!containerRef.current) return;

      try {
        mapInstance = new maplibre.Map({
          container: containerRef.current,
          style: getMapStyle() as maplibregl.StyleSpecification,
          center: MAP_CENTER_NORTH,
          zoom: MAP_ZOOM_COUNTRY,
          maxBounds: MAP_MAX_BOUNDS,
        });

        mapRef.current = mapInstance;

        mapInstance.on("moveend", () => {
          handleBoundsChange(mapInstance);
        });

        mapInstance.on("load", () => {
          handleBoundsChange(mapInstance);
          addWilayaMarkers(maplibre, mapInstance);
          initDrawLayers(mapInstance);
        });
      } catch (err) {
        console.warn("MapLibre: WebGL context creation failed", err);
        if (containerRef.current) {
          containerRef.current.innerHTML =
            `<div class="flex h-full items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm">${t("map_unavailable")}</div>`;
        }
      }
    });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Initialize empty GeoJSON sources + layers for the draw polygon */
  function initDrawLayers(map: MapLibreMap) {
    // Polygon fill + outline source
    map.addSource(DRAW_SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    // Vertex points source
    map.addSource(DRAW_POINTS_SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    // Semi-transparent fill
    map.addLayer({
      id: DRAW_FILL_LAYER_ID,
      type: "fill",
      source: DRAW_SOURCE_ID,
      paint: {
        "fill-color": "#1a8aaa",
        "fill-opacity": 0.15,
      },
    });

    // Outline
    map.addLayer({
      id: DRAW_LINE_LAYER_ID,
      type: "line",
      source: DRAW_SOURCE_ID,
      paint: {
        "line-color": "#1a8aaa",
        "line-width": 2,
        "line-dasharray": [2, 2],
      },
    });

    // Vertex dots
    map.addLayer({
      id: DRAW_POINTS_LAYER_ID,
      type: "circle",
      source: DRAW_POINTS_SOURCE_ID,
      paint: {
        "circle-radius": 5,
        "circle-color": "#1a8aaa",
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
      },
    });
  }

  /** Update the drawn polygon on the map */
  function updateDrawnPolygonOnMap(points: [number, number][]) {
    const map = mapRef.current;
    if (!map) return;

    const polygonSource = map.getSource(DRAW_SOURCE_ID);
    const pointsSource = map.getSource(DRAW_POINTS_SOURCE_ID);

    if (polygonSource && "setData" in polygonSource) {
      if (points.length >= 3) {
        (polygonSource as { setData: (data: GeoJSON.Feature | GeoJSON.FeatureCollection) => void }).setData(
          buildPolygonGeoJson(points)
        );
      } else {
        (polygonSource as { setData: (data: GeoJSON.FeatureCollection) => void }).setData({
          type: "FeatureCollection",
          features: [],
        });
      }
    }

    if (pointsSource && "setData" in pointsSource) {
      (pointsSource as { setData: (data: GeoJSON.FeatureCollection) => void }).setData(
        buildPointsGeoJson(points)
      );
    }
  }

  /** Clear the drawn polygon from the map and state */
  function clearDrawnPolygon() {
    setDrawnPoints([]);
    setHasPolygon(false);
    updateDrawnPolygonOnMap([]);
    onDrawPolygon?.(null);
  }

  /** Toggle draw mode on/off */
  function toggleDrawMode() {
    const map = mapRef.current;
    if (!map) return;

    if (isDrawing) {
      // Exit draw mode without confirming
      setIsDrawing(false);
      map.getCanvas().style.cursor = "";
      if (drawClickHandlerRef.current) {
        map.off("click", drawClickHandlerRef.current);
        drawClickHandlerRef.current = null;
      }
      // If user was mid-draw without enough points, clear
      if (drawnPoints.length < 3) {
        clearDrawnPolygon();
      }
    } else {
      // Enter draw mode: clear any existing polygon first
      clearDrawnPolygon();
      setIsDrawing(true);
      map.getCanvas().style.cursor = "crosshair";

      const handler = (e: { lngLat: { lng: number; lat: number } }) => {
        setDrawnPoints((prev) => {
          const next = [...prev, [e.lngLat.lng, e.lngLat.lat] as [number, number]];
          updateDrawnPolygonOnMap(next);
          return next;
        });
      };

      drawClickHandlerRef.current = handler;
      map.on("click", handler);
    }
  }

  /** Confirm the drawn polygon and trigger search */
  function confirmPolygon() {
    if (drawnPoints.length < 3) return;

    const map = mapRef.current;
    if (!map) return;

    // Stop draw mode
    setIsDrawing(false);
    setHasPolygon(true);
    map.getCanvas().style.cursor = "";
    if (drawClickHandlerRef.current) {
      map.off("click", drawClickHandlerRef.current);
      drawClickHandlerRef.current = null;
    }

    // Convert points to WKT and notify parent
    const wkt = pointsToWkt(drawnPoints);
    onDrawPolygon?.(wkt);
  }

  // Add wilaya center markers (visible at low zoom, hidden at high zoom)
  function addWilayaMarkers(
    maplibre: typeof import("maplibre-gl"),
    map: MapLibreMap
  ) {
    // Clear existing
    wilayaMarkersRef.current.forEach((m) => m.remove());
    wilayaMarkersRef.current = [];

    const geojson = buildWilayaPoints(locale as Locale);

    for (const feature of geojson.features) {
      const el = document.createElement("div");
      el.className = `${MARKER_CLASSES.base} ${MARKER_CLASSES.cluster}`;
      el.textContent = feature.properties.name;
      el.title = `${feature.properties.name} (${feature.properties.commune_count} communes)`;

      // Click to zoom into this wilaya
      el.addEventListener("click", () => {
        flyToWilaya(map as unknown as Parameters<typeof flyToWilaya>[0], feature.properties.code);
      });

      const marker = new maplibre.Marker({ element: el })
        .setLngLat(feature.geometry.coordinates as [number, number])
        .addTo(map);

      wilayaMarkersRef.current.push(marker);
    }

    // Toggle visibility based on zoom
    const updateVisibility = () => {
      const zoom = map.getZoom();
      const show = zoom < 8;
      for (const m of wilayaMarkersRef.current) {
        (m.getElement() as HTMLElement).style.display = show ? "" : "none";
      }
    };

    map.on("zoom", updateVisibility);
    updateVisibility();
  }

  // Fly to active wilayas when filter changes
  useEffect(() => {
    if (!mapRef.current || !activeWilayas) return;
    fitToWilayas(
      mapRef.current as unknown as Parameters<typeof fitToWilayas>[0],
      activeWilayas
    );
  }, [activeWilayas]);

  // Update listing markers when listings change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Remove existing listing markers
    markersRef.current.forEach((marker: MapLibreMarker) => marker.remove());
    markersRef.current = [];

    import("maplibre-gl").then((maplibre) => {
      listings.forEach((listing) => {
        if (typeof listing.lat !== "number" || typeof listing.lng !== "number") {
          return;
        }

        const isHighlighted = highlightedListingId === listing.id;

        // Price badge marker — Tailwind classes only, no inline hex
        const el = document.createElement("div");
        el.className = `${MARKER_CLASSES.base} ${isHighlighted ? MARKER_CLASSES.active : MARKER_CLASSES.default}`;
        el.textContent = formatPrice(listing.price, listing.currency);

        if (onListingHover) {
          el.addEventListener("mouseenter", () => onListingHover(listing.id));
          el.addEventListener("mouseleave", () => onListingHover(null));
        }

        const popupHtml = buildPopupHtml({
          title: listing.title,
          price: formatPrice(listing.price, listing.currency),
          href: `/${locale}/annonce/${listing.slug}`,
          ctaLabel: t("view_listing"),
        });

        const popup: MapLibrePopup = new maplibre.Popup({
          closeButton: true,
          closeOnClick: false,
          offset: 25,
          maxWidth: "200px",
        }).setHTML(popupHtml);

        const marker: MapLibreMarker = new maplibre.Marker({ element: el })
          .setLngLat([listing.lng, listing.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    });
  }, [listings, highlightedListingId, locale, onListingHover, t]);

  const ariaLabel = t("map_coming_soon").includes("bientot")
    ? "Carte des annonces immobilières"
    : "Property listings map";

  /** Draw controls overlay */
  const drawControls = onDrawPolygon ? (
    <div className="absolute end-2 top-2 z-10 flex flex-col gap-1.5">
      {/* Toggle draw mode */}
      <button
        type="button"
        onClick={toggleDrawMode}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium shadow-md transition-colors ${
          isDrawing
            ? "bg-amber-500 text-white dark:bg-amber-600"
            : "bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        }`}
        aria-label={isDrawing ? t("draw_cancel") : t("draw_zone")}
      >
        {isDrawing ? t("draw_cancel") : t("draw_zone")}
      </button>

      {/* Confirm polygon (only when drawing with 3+ points) */}
      {isDrawing && drawnPoints.length >= 3 && (
        <button
          type="button"
          onClick={confirmPolygon}
          className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-colors hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600"
        >
          {t("draw_confirm")}
        </button>
      )}

      {/* Point count indicator while drawing */}
      {isDrawing && drawnPoints.length > 0 && drawnPoints.length < 3 && (
        <span className="rounded-lg bg-white px-3 py-1.5 text-xs text-zinc-500 shadow-md dark:bg-zinc-800 dark:text-zinc-400">
          {t("draw_points_needed", { count: 3 - drawnPoints.length })}
        </span>
      )}

      {/* Clear polygon (only when polygon is confirmed) */}
      {hasPolygon && !isDrawing && (
        <button
          type="button"
          onClick={clearDrawnPolygon}
          className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-md transition-colors hover:bg-red-50 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-zinc-700"
        >
          {t("draw_clear")}
        </button>
      )}
    </div>
  ) : null;

  if (fillContainer) {
    return (
      <div className="relative h-full w-full">
        <div
          ref={containerRef}
          className="h-full w-full"
          aria-label={ariaLabel}
          role="application"
        />
        {drawControls}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
      <div
        ref={containerRef}
        className="h-64 w-full lg:h-80"
        aria-label={ariaLabel}
        role="application"
      />
      {drawControls}
    </div>
  );
}
