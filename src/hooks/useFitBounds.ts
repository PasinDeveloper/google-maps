"use client";

import { useEffect } from "react";
import { MarkerData } from "./useMarkers";
import { computeBounds } from "@/utils/map";

interface UseFitBoundsOptions {
  /** Padding in pixels around the bounds. */
  padding?: number;
}

/**
 * Hook that fits the map viewport to encompass all provided markers.
 * Re-runs whenever the markers array reference changes.
 */
export function useFitBounds(
  map: google.maps.Map | null,
  markers: readonly MarkerData[],
  options: UseFitBoundsOptions = {},
): void {
  const { padding = 40 } = options;

  useEffect(() => {
    if (!map || markers.length === 0) return;

    const positions = markers.map((m) => ({ lat: m.lat, lng: m.lng }));
    const bounds = computeBounds(positions);
    if (!bounds) return;

    map.fitBounds(bounds, padding);
  }, [map, markers, padding]);
}
