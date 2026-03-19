"use client";

import { useState, useCallback, type ReactNode } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import type { Status } from "@googlemaps/react-wrapper";
import Map, { MarkerData, type MarkerRenderProps } from "./Map";
import { useGoogleMapsLoader } from "@/hooks/useGoogleMapsLoader";
import MarkerList from "../LeftPanel/MarkerList";

interface MapClientProps {
  markers: readonly MarkerData[];
  defaultCenter?: google.maps.LatLngLiteral;
  defaultZoom?: number;
  renderMarker?: (props: MarkerRenderProps) => ReactNode;
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

/** Renders loading/error states while the Google Maps script loads. */
function MapStatusView({ status }: { readonly status: Status }) {
  const { isLoading, isError } = useGoogleMapsLoader(status);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-50 flex-col items-center justify-center gap-3 p-6 text-center text-slate-600">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"
          aria-label="Loading map…"
        />
        <p>Loading map…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex h-full min-h-50 flex-col items-center justify-center gap-3 bg-rose-50 p-6 text-center text-rose-700"
        role="alert"
      >
        <p>
          Failed to load Google Maps. Please check your{" "}
          <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable.
        </p>
      </div>
    );
  }

  return null;
}

/**
 * Client-side wrapper that loads the Google Maps script via
 * @googlemaps/react-wrapper and renders the Map + LeftPanel.
 *
 * Usage:
 * ```tsx
 * <MapClient markers={myMarkers} />
 * ```
 *
 * Required env variable: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 */
export default function MapClient({
  markers,
  defaultCenter,
  defaultZoom,
  renderMarker,
}: MapClientProps) {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const handleMarkerClick = useCallback((id: string | number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleCardClick = useCallback((id: string | number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  if (!apiKey) {
    return (
      <div
        className="flex min-h-50 flex-col items-center justify-center gap-3 bg-rose-50 p-6 text-center text-rose-700"
        role="alert"
      >
        <p>
          <strong>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</strong> is not set. Add it to
          your <code>.env.local</code> file to enable the map.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden md:flex-row">
      <aside className="w-full shrink-0 overflow-y-auto border-b border-slate-200 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.06)] md:h-full md:w-80 md:border-r md:border-b-0">
        <MarkerList
          markers={markers}
          selectedId={selectedId}
          onCardClick={handleCardClick}
        />
      </aside>
      <div className="relative h-[60vh] flex-1 overflow-hidden md:h-full">
        <Wrapper
          apiKey={apiKey}
          render={(status) => <MapStatusView status={status} />}
        >
          <Map
            markers={markers}
            selectedMarkerId={selectedId}
            onMarkerClick={handleMarkerClick}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            renderMarker={renderMarker}
          />
        </Wrapper>
      </div>
    </div>
  );
}
