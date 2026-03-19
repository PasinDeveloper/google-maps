"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MarkerData, type MarkerRenderProps } from "./Map";

interface HtmlMarkerProps {
  map: google.maps.Map;
  marker: MarkerData;
  isSelected: boolean;
  onClick: (id: string | number) => void;
  renderMarker?: (props: MarkerRenderProps) => ReactNode;
}

interface HtmlMarkerOverlayInstance extends google.maps.OverlayView {
  setSelected: (selected: boolean) => void;
  setOnClick: (handler: (id: string | number) => void) => void;
  setContainerChange: (
    handler: (container: HTMLDivElement | null) => void,
  ) => void;
}

function DefaultMarkerContent({ marker }: { marker: MarkerData }) {
  return (
    <>
      {marker.title ? (
        <span className="mb-[3px] whitespace-nowrap rounded-md border border-blue-500 bg-white px-1.5 py-0.5 text-[0.72rem] font-semibold text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition-colors duration-150 group-[.is-selected]:border-blue-600 group-[.is-selected]:bg-blue-500 group-[.is-selected]:text-white">
          {marker.title}
        </span>
      ) : null}
      <div className="h-4 w-4 rounded-[50%_50%_50%_0] border-[2.5px] border-white bg-blue-500 shadow-[0_2px_6px_rgba(66,133,244,0.4)] transition duration-150 group-hover:scale-120 group-hover:bg-rose-500 group-[.is-selected]:scale-120 group-[.is-selected]:bg-rose-500 [transform:rotate(-45deg)]" />
    </>
  );
}

/**
 * Factory that creates a custom HTML marker class extending OverlayView.
 * Called lazily on the client only, after the Google Maps script has loaded,
 * to avoid referencing `google` at module evaluation time (SSR-safe).
 */
function createOverlayClass(
  markerData: MarkerData,
  onClick: (id: string | number) => void,
  selected: boolean,
): HtmlMarkerOverlayInstance {
  class HtmlMarkerOverlay
    extends google.maps.OverlayView
    implements HtmlMarkerOverlayInstance
  {
    private readonly position: google.maps.LatLngLiteral;
    private container: HTMLDivElement | null = null;
    private onClickHandler: (id: string | number) => void;
    private containerChangeHandler: (container: HTMLDivElement | null) => void =
      () => undefined;
    private isSelected: boolean;
    private readonly handleClick = () => {
      this.onClickHandler(markerData.id);
    };

    private readonly handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.onClickHandler(markerData.id);
      }
    };

    constructor() {
      super();
      this.position = { lat: markerData.lat, lng: markerData.lng };
      this.onClickHandler = onClick;
      this.isSelected = selected;
    }

    onAdd(): void {
      this.container = document.createElement("div");
      this.container.className = [
        "group absolute z-[1] flex -translate-x-1/2 -translate-y-full cursor-pointer flex-col items-center select-none",
        this.isSelected ? "is-selected z-[2]" : "",
      ]
        .join(" ")
        .trim();
      this.container.setAttribute("role", "button");
      this.container.setAttribute(
        "aria-label",
        markerData.title ?? "Map marker",
      );
      this.container.tabIndex = 0;
      this.container.addEventListener("click", this.handleClick);
      this.container.addEventListener("keydown", this.handleKeyDown);

      const panes = this.getPanes();
      panes?.overlayMouseTarget.appendChild(this.container);
      this.containerChangeHandler(this.container);
    }

    draw(): void {
      if (!this.container) return;
      const projection = this.getProjection();
      if (!projection) return;

      const point = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(this.position),
      );
      if (!point) return;

      this.container.style.left = `${point.x}px`;
      this.container.style.top = `${point.y}px`;
    }

    onRemove(): void {
      if (this.container) {
        this.container.removeEventListener("click", this.handleClick);
        this.container.removeEventListener("keydown", this.handleKeyDown);
      }
      this.container?.remove();
      this.container = null;
      this.containerChangeHandler(null);
    }

    setSelected(s: boolean): void {
      this.isSelected = s;
      if (!this.container) return;
      this.container.classList.toggle("is-selected", s);
      this.container.classList.toggle("z-[2]", s);
      this.container.classList.toggle("z-[1]", !s);
    }

    setOnClick(handler: (id: string | number) => void): void {
      this.onClickHandler = handler;
    }

    setContainerChange(
      handler: (container: HTMLDivElement | null) => void,
    ): void {
      this.containerChangeHandler = handler;
      handler(this.container);
    }
  }

  return new HtmlMarkerOverlay();
}

/**
 * React component that manages the lifecycle of a custom HTML map overlay.
 * Returns null – all rendering is done via the Google Maps OverlayView DOM.
 */
export default function HtmlMarker({
  map,
  marker,
  isSelected,
  onClick,
  renderMarker,
}: HtmlMarkerProps) {
  const overlayRef = useRef<HtmlMarkerOverlayInstance | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const overlay = createOverlayClass(marker, onClick, isSelected);
    overlay.setContainerChange(setContainer);
    overlay.setMap(map);
    overlayRef.current = overlay;

    return () => {
      overlay.setMap(null);
      overlayRef.current = null;
      setContainer(null);
    };
    // marker.id/lat/lng/title changes recreate the overlay; description updates are handled elsewhere.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, marker.id, marker.lat, marker.lng, marker.title]);

  useEffect(() => {
    overlayRef.current?.setSelected(isSelected);
  }, [isSelected]);

  useEffect(() => {
    overlayRef.current?.setOnClick(onClick);
  }, [onClick]);

  if (!container) {
    return null;
  }

  return createPortal(
    renderMarker ? (
      renderMarker({ marker, isSelected })
    ) : (
      <DefaultMarkerContent marker={marker} />
    ),
    container,
  );
}
