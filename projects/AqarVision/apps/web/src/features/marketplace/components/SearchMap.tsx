"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useCallback } from "react";
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
}

export function SearchMap({
  listings,
  onBoundsChange,
  locale = "fr",
  fillContainer,
  onListingHover,
  activeWilayas,
  highlightedListingId,
}: SearchMapProps) {
  const t = useTranslations("search");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
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
          // Add wilaya point markers at low zoom
          addWilayaMarkers(maplibre, mapInstance);
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

  if (fillContainer) {
    return (
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label={ariaLabel}
        role="application"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
      <div
        ref={containerRef}
        className="h-64 w-full lg:h-80"
        aria-label={ariaLabel}
        role="application"
      />
    </div>
  );
}
