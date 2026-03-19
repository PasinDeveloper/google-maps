/**
 * Utility helpers for Google Maps operations.
 */

/** Convert a google.maps.LatLng to a plain literal object. */
export function latLngToLiteral(
  latLng: google.maps.LatLng
): google.maps.LatLngLiteral {
  return { lat: latLng.lat(), lng: latLng.lng() };
}

/** Compute a LatLngBounds that encompasses all given positions. */
export function computeBounds(
  positions: google.maps.LatLngLiteral[]
): google.maps.LatLngBounds | null {
  if (positions.length === 0) return null;
  const bounds = new google.maps.LatLngBounds();
  for (const pos of positions) {
    bounds.extend(pos);
  }
  return bounds;
}

/**
 * Return a simple debounced version of the provided function.
 * @param fn  - function to debounce
 * @param ms  - delay in milliseconds
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}
