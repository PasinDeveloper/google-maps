"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFitBounds } from "@/hooks/useFitBounds";
import { useMapEvents } from "@/hooks/useMapEvents";
import HtmlMarker from "./HtmlMarker";
// import HtmlMarker from "@/src/components/Map/HtmlMarker";
// import { useFitBounds } from "@/src/hooks/useFitBounds";
// import { useMapEvents } from "@/src/hooks/useMapEvents";

export interface MarkerData {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  /** Optional extra React content — passed through to custom marker if needed. */
  data?: Record<string, unknown>;
}

export interface MarkerRenderProps {
  marker: MarkerData;
  isSelected: boolean;
}

export interface MapProps {
  markers: readonly MarkerData[];
  selectedMarkerId?: string | number | null;
  shouldZoomToSelectedMarker?: boolean;
  onMarkerClick?: (id: string | number) => void;
  onBoundsChange?: (bounds: google.maps.LatLngBoundsLiteral) => void;
  defaultCenter?: google.maps.LatLngLiteral;
  defaultZoom?: number;
  renderMarker?: (props: MarkerRenderProps) => ReactNode;
}

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 51.0, lng: 10.0 };
const DEFAULT_ZOOM = 4;
const FOCUSED_MARKER_ZOOM = 15;
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];

/**
 * Core map component.
 * Must be rendered inside an already-loaded Google Maps context
 * (e.g. wrapped by <Wrapper> from @googlemaps/react-wrapper).
 */
export default function Map({
  markers,
  selectedMarkerId = null,
  shouldZoomToSelectedMarker = false,
  onMarkerClick,
  onBoundsChange,
  defaultCenter = DEFAULT_CENTER,
  defaultZoom = DEFAULT_ZOOM,
  renderMarker,
}: MapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Initialise the map once.
  useEffect(() => {
    if (!mapDivRef.current) return;
    const instance = new google.maps.Map(mapDivRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      clickableIcons: false,
      disableDefaultUI: true,
      styles: MAP_STYLES,
    });
    setMap(instance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fit bounds to markers whenever they change.
  useFitBounds(map, markers);

  // Debounced bounds_changed event.
  const handleBoundsChanged = useCallback(() => {
    if (!map || !onBoundsChange) return;
    const bounds = map.getBounds();
    if (bounds) onBoundsChange(bounds.toJSON());
  }, [map, onBoundsChange]);

  const handleZoomIn = useCallback(() => {
    if (!map) return;
    map.setZoom((map.getZoom() ?? defaultZoom) + 1);
  }, [defaultZoom, map]);

  const handleZoomOut = useCallback(() => {
    if (!map) return;
    map.setZoom((map.getZoom() ?? defaultZoom) - 1);
  }, [defaultZoom, map]);

  const animateMapCenter = useCallback(
    (targetCenter: google.maps.LatLngLiteral, targetZoom?: number) => {
      if (!map) return;

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      const startCenter = map.getCenter()?.toJSON() ?? defaultCenter;
      const startZoom = map.getZoom() ?? defaultZoom;
      const durationMs = 450;
      const startTime = performance.now();

      const easeInOutCubic = (progress: number) =>
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const step = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const easedProgress = easeInOutCubic(progress);

        map.setCenter({
          lat:
            startCenter.lat +
            (targetCenter.lat - startCenter.lat) * easedProgress,
          lng:
            startCenter.lng +
            (targetCenter.lng - startCenter.lng) * easedProgress,
        });

        if (progress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(step);
          return;
        }

        animationFrameRef.current = null;
        map.setCenter(targetCenter);

        if (targetZoom !== undefined) {
          map.setZoom(Math.max(startZoom, targetZoom));
        }
      };

      animationFrameRef.current = window.requestAnimationFrame(step);
    },
    [defaultCenter, defaultZoom, map],
  );

  useMapEvents(map, "bounds_changed", handleBoundsChanged, 300);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Move to selected marker.
  useEffect(() => {
    if (!map || selectedMarkerId === null) return;
    const found = markers.find((m) => m.id === selectedMarkerId);
    if (found) {
      if (shouldZoomToSelectedMarker) {
        animateMapCenter(
          { lat: found.lat, lng: found.lng },
          FOCUSED_MARKER_ZOOM,
        );
        return;
      }

      map.panTo({ lat: found.lat, lng: found.lng });
    }
  }, [animateMapCenter, map, markers, selectedMarkerId, shouldZoomToSelectedMarker]);

  const handleMarkerClick = useCallback(
    (id: string | number) => {
      onMarkerClick?.(id);
    },
    [onMarkerClick],
  );

  return (
    <div className="relative h-full w-full">
      <div ref={mapDivRef} className="h-full w-full" />
      <div className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleZoomIn}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.16)] backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600"
          aria-label="Zoom in"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M12 5v14M5 12h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.16)] backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600"
          aria-label="Zoom out"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M5 12h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {map &&
        markers.map((marker) => (
          <HtmlMarker
            key={marker.id}
            map={map}
            marker={marker}
            isSelected={marker.id === selectedMarkerId}
            onClick={handleMarkerClick}
            renderMarker={renderMarker}
          />
        ))}
    </div>
  );
}
