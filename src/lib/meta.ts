// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FbqFn = (...args: any[]) => void;

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

// Module-level pixel ID — set once by useMetaPixel when settings load.
let _pixelId: string | null = null;

export function setMetaPixelId(id: string) {
  _pixelId = id;
}

export function trackEvent(
  eventName: string,
  customData?: Record<string, unknown>,
) {
  if (!_pixelId) return;
  const eventId = crypto.randomUUID();

  // 1. Browser pixel — queued until fbevents.js loads
  if (window.fbq) {
    window.fbq("track", eventName, customData ?? {}, { eventID: eventId });
  }

  // 2. Server CAPI — fire and forget, never blocks the user
  void fetch("/api/meta-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pixelId: _pixelId,
      eventName,
      eventId,
      sourceUrl: window.location.href,
      customData: customData ?? {},
    }),
  }).catch(() => {});
}
