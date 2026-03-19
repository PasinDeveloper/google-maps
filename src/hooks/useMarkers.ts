"use client";

import { useState, useCallback } from "react";

export interface MarkerData {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
  description?: string;
}

interface UseMarkersReturn {
  markers: readonly MarkerData[];
  selectedId: string | number | null;
  addMarker: (marker: MarkerData) => void;
  removeMarker: (id: string | number) => void;
  replaceMarkers: (markers: MarkerData[]) => void;
  selectMarker: (id: string | number | null) => void;
}

/**
 * Hook to manage a list of map markers and the currently selected marker id.
 */
export function useMarkers(
  initialMarkers: readonly MarkerData[] = []
): UseMarkersReturn {
  const [markers, setMarkersState] = useState<readonly MarkerData[]>(
    initialMarkers
  );
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const addMarker = useCallback((marker: MarkerData) => {
    setMarkersState((prev) => [...prev, marker]);
  }, []);

  const removeMarker = useCallback((id: string | number) => {
    setMarkersState((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const replaceMarkers = useCallback((next: MarkerData[]) => {
    setMarkersState(next);
  }, []);

  const selectMarker = useCallback((id: string | number | null) => {
    setSelectedId(id);
  }, []);

  return {
    markers,
    selectedId,
    addMarker,
    removeMarker,
    replaceMarkers,
    selectMarker,
  };
}
