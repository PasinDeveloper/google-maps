"use client";

import { useEffect, useRef } from "react";

type GoogleMapsEventName =
  | "bounds_changed"
  | "center_changed"
  | "click"
  | "dblclick"
  | "drag"
  | "dragend"
  | "dragstart"
  | "idle"
  | "zoom_changed"
  | "tilesloaded";

/**
 * Hook to subscribe to a Google Maps map event with an optional debounce delay.
 * Automatically cleans up the listener when the component unmounts or deps change.
 */
export function useMapEvents(
  map: google.maps.Map | null,
  eventName: GoogleMapsEventName,
  handler: (event?: google.maps.MapMouseEvent) => void,
  debounceMs = 0,
): void {
  // Keep a stable ref to the handler so we don't re-subscribe on every render.
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!map) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const callback = (event?: google.maps.MapMouseEvent) => {
      if (debounceMs > 0) {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          handlerRef.current(event);
        }, debounceMs);
      } else {
        handlerRef.current(event);
      }
    };

    const listener = map.addListener(eventName, callback);

    return () => {
      google.maps.event.removeListener(listener);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, [map, eventName, debounceMs]);
}
