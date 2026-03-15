"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useCallback } from "react";
import type { MapBounds } from "../schemas/search.schema";

// Minimal type declarations for maplibre-gl so the file compiles without the package installed
// Once maplibre-gl is installed, these types are provided by the package itself.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapLibreMap = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapLibreMarker = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapLibrePopup = any;

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
  /** When true, the map fills its parent container (used in split layout) */
  fillContainer?: boolean;
  /** Called with listing id on marker hover, null on leave */
  onListingHover?: (id: string | null) => void;
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function SearchMap({ listings, onBoundsChange, fillContainer, onListingHover }: SearchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
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

    // Dynamic import to ensure client-side only loading
    import("maplibre-gl").then((maplibre) => {
      if (!containerRef.current) return;

      try {
      mapInstance = new maplibre.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: [
                process.env.NEXT_PUBLIC_MAPTILER_KEY
                  ? `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
                  : "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution: process.env.NEXT_PUBLIC_MAPTILER_KEY
                ? "© MapTiler © OpenStreetMap contributors"
                : "© OpenStreetMap contributors",
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
        },
        // Algeria center: Algiers
        center: [3.0588, 36.7372],
        zoom: 6,
      });

      mapRef.current = mapInstance;

      // Emit bounds on move end
      mapInstance.on("moveend", () => {
        handleBoundsChange(mapInstance);
      });

      // Initial bounds emit after map loads
      mapInstance.on("load", () => {
        handleBoundsChange(mapInstance);
      });
      } catch (err) {
        // WebGL unavailable (sandboxed env, old browser) — map won't render
        console.warn("MapLibre: WebGL context creation failed", err);
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<div class="flex h-full items-center justify-center text-gray-400 text-sm">Carte non disponible dans cet environnement</div>';
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

  // Update markers when listings change
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Remove existing markers
    markersRef.current.forEach((marker: MapLibreMarker) => marker.remove());
    markersRef.current = [];

    import("maplibre-gl").then((maplibre) => {
      listings.forEach((listing) => {
        if (typeof listing.lat !== "number" || typeof listing.lng !== "number") {
          return;
        }

        // Create custom marker element — Onyx & Ivoire price badge
        const el = document.createElement("div");
        el.className =
          "cursor-pointer select-none rounded-full px-2.5 py-1 text-xs font-bold shadow-md whitespace-nowrap transition-all";
        el.style.cssText =
          "background:#09090b;color:#fafafa;border:1.5px solid rgba(255,255,255,0.15);";
        el.textContent = formatPrice(listing.price, listing.currency);

        if (onListingHover) {
          el.addEventListener("mouseenter", () => onListingHover(listing.id));
          el.addEventListener("mouseleave", () => onListingHover(null));
        }

        // Popup content
        const popupHtml = `
          <div class="p-2 min-w-[160px]">
            <p class="text-xs font-semibold text-zinc-800 truncate mb-1">${listing.title}</p>
            <p class="text-sm font-bold text-zinc-900 mb-2">${formatPrice(listing.price, listing.currency)}</p>
            <a
              href="/fr/l/${listing.slug}"
              class="block w-full rounded bg-zinc-900 px-3 py-1 text-center text-xs font-medium text-white hover:bg-amber-500 transition-colors"
            >
              Voir l'annonce
            </a>
          </div>
        `;

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
  }, [listings]);

  if (fillContainer) {
    return (
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Carte des annonces immobilières"
        role="img"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div
        ref={containerRef}
        className="h-64 w-full lg:h-80"
        aria-label="Carte des annonces immobilières"
        role="img"
      />
    </div>
  );
}
