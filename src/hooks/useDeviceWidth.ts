"use client";

import { useState, useEffect } from "react";

/** Breakpoints in pixels (matches common Tailwind-like breakpoints). */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

interface DeviceWidthInfo {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isAbove: (bp: BreakpointKey) => boolean;
  isBelow: (bp: BreakpointKey) => boolean;
}

/**
 * Hook that tracks the current window width and exposes convenience helpers.
 * The resize listener is debounced (100 ms) to avoid excessive re-renders.
 * Returns safe default values during SSR (width = 0).
 */
export function useDeviceWidth(): DeviceWidthInfo {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const update = () => setWidth(window.innerWidth);

    const debouncedUpdate = () => {
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(update, 100);
    };

    // Set immediately on mount (no delay).
    update();

    window.addEventListener("resize", debouncedUpdate);
    return () => {
      if (timer !== null) clearTimeout(timer);
      window.removeEventListener("resize", debouncedUpdate);
    };
  }, []);

  const isAbove = (bp: BreakpointKey) => width >= BREAKPOINTS[bp];
  const isBelow = (bp: BreakpointKey) => width < BREAKPOINTS[bp];

  return {
    width,
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    isAbove,
    isBelow,
  };
}
