import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { setMetaPixelId } from "@/lib/meta";

function loadFbq(pixelId: string) {
  if (document.getElementById("fb-pixel-script")) return;

  // Bootstrap fbq queue (standard Meta snippet, without initial PageView)
  if (!window.fbq) {
    const fbq = function (this: unknown) {
      // eslint-disable-next-line prefer-rest-params
      (fbq as any).callMethod
        ? (fbq as any).callMethod.apply(fbq, arguments)
        : (fbq as any).queue.push(arguments);
    } as any;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
  }

  window.fbq!("init", pixelId);

  const script = document.createElement("script");
  script.id = "fb-pixel-script";
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
}

export function useMetaPixel(pixelId: string | null | undefined) {
  const location = useLocation();

  useEffect(() => {
    if (!pixelId?.trim()) return;
    setMetaPixelId(pixelId.trim());
    loadFbq(pixelId.trim());
  }, [pixelId]);

  // PageView fires on every route change (including initial load)
  useEffect(() => {
    if (!pixelId?.trim() || !window.fbq) return;
    window.fbq("track", "PageView");
  }, [location, pixelId]);
}
