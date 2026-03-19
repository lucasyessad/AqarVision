"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  price: number;
  type: "sale" | "rent" | "vacation";
}

export interface MapViewProps {
  markers: MapMarker[];
  onMarkerClick: (id: string) => void;
  className?: string;
  selectedMarkerId?: string | null;
}

const MARKER_COLORS: Record<MapMarker["type"], { bg: string; text: string; border: string }> = {
  sale: {
    bg: "bg-blue-600 dark:bg-blue-500",
    text: "text-white",
    border: "border-blue-700 dark:border-blue-400",
  },
  rent: {
    bg: "bg-purple-600 dark:bg-purple-500",
    text: "text-white",
    border: "border-purple-700 dark:border-purple-400",
  },
  vacation: {
    bg: "bg-amber-400 dark:bg-amber-500",
    text: "text-stone-950 dark:text-stone-950",
    border: "border-amber-500 dark:border-amber-400",
  },
};

const CLUSTER_GRID_SIZE = 0.5; // degrees

interface Cluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  markers: MapMarker[];
}

function clusterMarkers(markers: MapMarker[], zoom: number): Array<Cluster | MapMarker> {
  // At high zoom, no clustering
  if (zoom >= 10) return markers;

  const gridSize = CLUSTER_GRID_SIZE / Math.pow(2, zoom - 6);
  const grid = new Map<string, MapMarker[]>();

  for (const marker of markers) {
    const gridX = Math.floor(marker.lng / gridSize);
    const gridY = Math.floor(marker.lat / gridSize);
    const key = `${gridX}:${gridY}`;

    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key)!.push(marker);
  }

  const result: Array<Cluster | MapMarker> = [];

  for (const [key, group] of grid) {
    if (group.length === 1) {
      result.push(group[0]!);
    } else {
      const avgLat = group.reduce((s, m) => s + m.lat, 0) / group.length;
      const avgLng = group.reduce((s, m) => s + m.lng, 0) / group.length;
      result.push({
        id: `cluster-${key}`,
        lat: avgLat,
        lng: avgLng,
        count: group.length,
        markers: group,
      });
    }
  }

  return result;
}

function isCluster(item: Cluster | MapMarker): item is Cluster {
  return "count" in item;
}

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    return `${(price / 1_000_000_000).toFixed(1)}G`;
  }
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(0)}M`;
  }
  if (price >= 1_000) {
    return `${(price / 1_000).toFixed(0)}K`;
  }
  return price.toString();
}

function MapContent({ markers, onMarkerClick, className, selectedMarkerId }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersLayerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(6);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: maplibregl.Map;
    let cancelled = false;

    async function initMap() {
      const maplibregl = (await import("maplibre-gl")).default;
      // @ts-expect-error -- CSS import has no type declarations
      await import("maplibre-gl/dist/maplibre-gl.css");

      if (cancelled || !container) return;

      // Check WebGL support before initializing
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setMapError("WebGL non disponible. Activez l'accélération matérielle dans les paramètres de votre navigateur.");
        return;
      }

      const { MAP_CONFIG, getStyleUrl } = await import("@/lib/map/config");

      try {
        map = new maplibregl.Map({
          container,
          style: getStyleUrl(),
          center: MAP_CONFIG.defaultCenter,
          zoom: MAP_CONFIG.defaultZoom,
          maxZoom: MAP_CONFIG.maxZoom,
          minZoom: MAP_CONFIG.minZoom,
          maxBounds: MAP_CONFIG.bounds,
          attributionControl: false,
        });
      } catch (err) {
        setMapError("Impossible de charger la carte. Vérifiez que l'accélération matérielle est activée.");
        return;
      }

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      map.addControl(new maplibregl.AttributionControl({ compact: true }));

      map.on("load", () => {
        if (!cancelled) {
          setIsLoaded(true);
        }
      });

      map.on("zoomend", () => {
        if (!cancelled) {
          setZoom(Math.floor(map.getZoom()));
        }
      });

      mapRef.current = map;
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Render markers as DOM overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;

    // Remove previous overlay
    if (markersLayerRef.current) {
      markersLayerRef.current.remove();
      markersLayerRef.current = null;
    }

    const overlay = document.createElement("div");
    overlay.className = "map-markers-overlay";
    markersLayerRef.current = overlay;
    containerRef.current?.appendChild(overlay);

    const clustered = clusterMarkers(markers, zoom);

    function updateMarkerPositions() {
      if (!map) return;
      overlay.innerHTML = "";

      for (const item of clustered) {
        const point = map.project([item.lng, item.lat]);
        const el = document.createElement("button");
        el.setAttribute("type", "button");

        if (isCluster(item)) {
          el.className = [
            "absolute -translate-x-1/2 -translate-y-1/2",
            "flex items-center justify-center",
            "h-10 w-10 rounded-full",
            "bg-teal-600 text-white text-xs font-bold",
            "border-2 border-white shadow-md",
            "cursor-pointer transition-transform hover:scale-110",
            "z-10",
          ].join(" ");
          el.textContent = item.count.toString();
          el.addEventListener("click", () => {
            import("@/lib/map/fly-to").then(({ flyTo }) => {
              if (map) flyTo(map, item.lng, item.lat, zoom + 2);
            });
          });
        } else {
          const colors = MARKER_COLORS[item.type];
          const isSelected = selectedMarkerId === item.id;
          el.className = [
            "absolute -translate-x-1/2 -translate-y-full",
            "flex items-center",
            "rounded-full px-2 py-1",
            "text-xs font-bold whitespace-nowrap",
            "border shadow-md",
            "cursor-pointer transition-all",
            isSelected ? "scale-110 z-20 ring-2 ring-teal-400" : "z-10 hover:scale-105 hover:z-20",
            colors.bg,
            colors.text,
            colors.border,
          ].join(" ");
          el.textContent = formatPrice(item.price);
          el.addEventListener("click", () => {
            onMarkerClick(item.id);
          });
        }

        el.style.left = `${point.x}px`;
        el.style.top = `${point.y}px`;
        overlay.appendChild(el);
      }
    }

    updateMarkerPositions();
    map.on("move", updateMarkerPositions);

    return () => {
      map.off("move", updateMarkerPositions);
      if (markersLayerRef.current) {
        markersLayerRef.current.remove();
        markersLayerRef.current = null;
      }
    };
  }, [markers, zoom, isLoaded, onMarkerClick, selectedMarkerId]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-xl",
        "bg-stone-100 dark:bg-stone-800",
        className
      )}
    >
      {mapError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <MapIcon className="h-10 w-10 text-stone-400 dark:text-stone-500" />
          <p className="text-sm text-stone-600 dark:text-stone-400">{mapError}</p>
        </div>
      ) : !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-teal-600 dark:border-stone-600 dark:border-t-teal-400" />
        </div>
      )}
    </div>
  );
}

export function MapView(props: MapViewProps & { mobileToggle?: boolean }) {
  const { mobileToggle = true, ...mapProps } = props;
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      {/* Mobile toggle pill */}
      {mobileToggle && (
        <div className="fixed bottom-20 start-1/2 z-30 -translate-x-1/2 lg:hidden">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowMap((v) => !v)}
            className="rounded-full shadow-lg"
          >
            <MapIcon size={16} aria-hidden="true" />
            {showMap ? "Liste" : "Carte"}
          </Button>
        </div>
      )}

      {/* Mobile full-screen map overlay */}
      {showMap && (
        <div className="fixed inset-0 z-20 lg:hidden">
          <MapContent {...mapProps} className="rounded-none" />
          <button
            type="button"
            onClick={() => setShowMap(false)}
            className="absolute end-4 top-4 z-30 rounded-full bg-white p-2 shadow-md dark:bg-stone-900"
            aria-label="Fermer la carte"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-stone-700 dark:text-stone-300"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Desktop map (always visible) */}
      <div className="hidden lg:block lg:h-full">
        <MapContent {...mapProps} />
      </div>
    </>
  );
}
