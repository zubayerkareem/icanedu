import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
  }
}

function loadGtag(measurementId: string) {
  if (document.getElementById("gtag-script")) return;

  window.dataLayer = window.dataLayer ?? [];

  // Must use a regular function + `arguments` — NOT rest params (...args).
  // gtag.js reads IArguments objects from dataLayer; regular arrays are silently ignored.
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() { (window.dataLayer!).push(arguments); } as never;

  window.gtag("js", new Date());
  window.gtag("config", measurementId);          // no send_page_view:false — let GA auto-fire

  const script = document.createElement("script");
  script.id = "gtag-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function useGoogleAnalytics(measurementId: string | null | undefined) {
  const location = useLocation();

  useEffect(() => {
    if (!measurementId?.trim()) return;
    loadGtag(measurementId.trim());
  }, [measurementId]);

  // Fire a page_view on every route change (SPA navigation)
  useEffect(() => {
    if (!measurementId?.trim() || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_title: document.title,
      send_to: measurementId.trim(),
    });
  }, [location, measurementId]);
}
