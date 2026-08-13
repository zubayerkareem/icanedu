import { forwardRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

// Cloudflare test site key — always passes; works without a real key in development.
// Set VITE_TURNSTILE_SITE_KEY in .env for production.
const SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

/**
 * Thin wrapper around Cloudflare Turnstile.
 * Forward the ref to get access to `.reset()` / `.execute()`.
 *
 * @example
 * const ref = useRef<TurnstileInstance>(null);
 * <TurnstileWidget ref={ref} onSuccess={setToken} onExpire={() => setToken(null)} />
 * // on error/reset: ref.current?.reset()
 */
const TurnstileWidget = forwardRef<TurnstileInstance, TurnstileWidgetProps>(
  ({ onSuccess, onError, onExpire }, ref) => (
    <Turnstile
      ref={ref}
      siteKey={SITE_KEY}
      onSuccess={onSuccess}
      onError={onError}
      onExpire={onExpire}
      options={{ theme: "auto", size: "normal" }}
    />
  ),
);
TurnstileWidget.displayName = "TurnstileWidget";

export { TurnstileWidget };
export type { TurnstileInstance };
