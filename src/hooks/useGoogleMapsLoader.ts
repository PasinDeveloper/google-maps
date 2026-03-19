"use client";

import { useEffect, useState } from "react";

type LoaderStatus = "loading" | "ready" | "error";

/**
 * Hook that tracks the Google Maps JS API loading status.
 * Works together with @googlemaps/react-wrapper's <Wrapper> component.
 * The Wrapper component itself handles injecting the script;
 * this hook lets children inspect the status passed down as a prop.
 */
export function useGoogleMapsLoader(status: string): {
  isReady: boolean;
  isLoading: boolean;
  isError: boolean;
  loaderStatus: LoaderStatus;
} {
  const [loaderStatus, setLoaderStatus] = useState<LoaderStatus>("loading");

  useEffect(() => {
    if (status === "SUCCESS") {
      setLoaderStatus("ready");
    } else if (status === "FAILURE") {
      setLoaderStatus("error");
    } else {
      setLoaderStatus("loading");
    }
  }, [status]);

  return {
    isReady: loaderStatus === "ready",
    isLoading: loaderStatus === "loading",
    isError: loaderStatus === "error",
    loaderStatus,
  };
}
