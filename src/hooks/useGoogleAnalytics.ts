import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function loadGtag(measurementId: string) {
  if (document.getElementById("gtag-script")) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function (...args) { window.dataLayer!.push(args); };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });

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

  useEffect(() => {
    if (!measurementId?.trim() || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location, measurementId]);
}
