"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  MarkerClustererEvents,
  MarkerClusterer,
  MarkerUtils,
  type Cluster,
  type Marker,
  type Renderer,
} from "@googlemaps/markerclusterer";
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
  onMarkerClick?: (id: string | number) => void;
  onBoundsChange?: (bounds: google.maps.LatLngBoundsLiteral) => void;
  defaultCenter?: google.maps.LatLngLiteral;
  defaultZoom?: number;
  enableClustering?: boolean;
  renderMarker?: (props: MarkerRenderProps) => ReactNode;
}

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 51.0, lng: 10.0 };
const DEFAULT_ZOOM = 4;
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

const clusterRenderer: Renderer = {
  render({ count, position }: Cluster) {
    return new google.maps.Marker({
      position,
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#2563eb",
        fillOpacity: 0.92,
        strokeColor: "#ffffff",
        strokeOpacity: 1,
        strokeWeight: 2,
        scale: 22,
      },
      label: {
        text: String(count),
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "700",
      },
    });
  },
};

class HtmlMarkerClusterer extends MarkerClusterer {
  getCurrentClusters(): readonly Cluster[] {
    return this.clusters;
  }
}

/**
 * Core map component.
 * Must be rendered inside an already-loaded Google Maps context
 * (e.g. wrapped by <Wrapper> from @googlemaps/react-wrapper).
 */
export default function Map({
  markers,
  selectedMarkerId = null,
  onMarkerClick,
  onBoundsChange,
  defaultCenter = DEFAULT_CENTER,
  defaultZoom = DEFAULT_ZOOM,
  enableClustering = true,
  renderMarker,
}: MapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const clustererRef = useRef<HtmlMarkerClusterer | null>(null);
  // Invisible marker placeholders used by the clusterer.
  const clusterMarkersRef = useRef<Marker[]>([]);
  const [clusteredMarkerIds, setClusteredMarkerIds] = useState<ReadonlySet<string | number>>(
    () => new Set(),
  );

  // Initialise the map once.
  useEffect(() => {
    if (!mapDivRef.current) return;
    const instance = new google.maps.Map(mapDivRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      clickableIcons: false,
      disableDefaultUI: false,
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

  useMapEvents(map, "bounds_changed", handleBoundsChanged, 300);

  // Keep clustering placeholders in sync with markers.
  useEffect(() => {
    if (!map) return;

    // If clustering is disabled, tear down any existing clusterer and placeholders.
    if (!enableClustering) {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        // Detach the clusterer from the map entirely.
        clustererRef.current.setMap(null);
        clustererRef.current = null;
      }
      for (const m of clusterMarkersRef.current) {
        MarkerUtils.setMap(m, null);
      }
      clusterMarkersRef.current = [];
      setClusteredMarkerIds(new Set());
      return;
    }

    // Clean up old placeholders.
    for (const m of clusterMarkersRef.current) {
      MarkerUtils.setMap(m, null);
    }
    clusterMarkersRef.current = [];

    // Create invisible legacy markers so MarkerClusterer can track positions
    // without requiring a vector map ID for AdvancedMarkerElement support.
    const markerIdsByPlaceholder = new WeakMap<Marker, string | number>();
    const placeholders = markers.map((m) => {
      const placeholder = new google.maps.Marker({
        position: { lat: m.lat, lng: m.lng },
        map: null,
        clickable: false,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0,
          fillOpacity: 0,
          strokeOpacity: 0,
        },
        opacity: 0,
        zIndex: -1000,
      });
      markerIdsByPlaceholder.set(placeholder, m.id);
      return placeholder;
    });
    clusterMarkersRef.current = placeholders;

    const syncClusterVisibility = () => {
      const hiddenIds = new Set<string | number>();
      for (const cluster of clustererRef.current?.getCurrentClusters() ?? []) {
        if (cluster.count <= 1) {
          continue;
        }

        for (const clusterMarker of cluster.markers) {
          const markerId = markerIdsByPlaceholder.get(clusterMarker);
          if (markerId !== undefined) {
            hiddenIds.add(markerId);
          }
        }
      }

      setClusteredMarkerIds(hiddenIds);
    };

    if (!clustererRef.current) {
      clustererRef.current = new HtmlMarkerClusterer({
        map,
        markers: placeholders,
        renderer: clusterRenderer,
      });
    } else {
      clustererRef.current.clearMarkers();
      clustererRef.current.addMarkers(placeholders);
    }

    const listener = clustererRef.current.addListener(
      MarkerClustererEvents.CLUSTERING_END,
      syncClusterVisibility,
    );
    clustererRef.current.render();

    return () => {
      listener.remove();
      clustererRef.current?.clearMarkers();
      for (const m of clusterMarkersRef.current) {
        MarkerUtils.setMap(m, null);
      }
      setClusteredMarkerIds(new Set());
    };
  }, [map, markers, enableClustering]);

  // Pan to selected marker.
  useEffect(() => {
    if (!map || selectedMarkerId === null) return;
    const found = markers.find((m) => m.id === selectedMarkerId);
    if (found) {
      map.panTo({ lat: found.lat, lng: found.lng });
    }
  }, [map, selectedMarkerId, markers]);

  const handleMarkerClick = useCallback(
    (id: string | number) => {
      onMarkerClick?.(id);
    },
    [onMarkerClick],
  );

  return (
    <div className="map-container">
      <div ref={mapDivRef} className="map-canvas" />
      {map &&
        markers
          .filter((marker) => !clusteredMarkerIds.has(marker.id))
          .map((marker) => (
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
