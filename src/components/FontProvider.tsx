import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const LINK_ID = "icanbd-google-fonts";

function hexToHsl(hex: string): string | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const light = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hue = (b - r) / d + 2; break;
      case b: hue = (r - g) / d + 4; break;
    }
    hue *= 60;
  }
  return `${Math.round(hue)} ${Math.round(sat * 100)}% ${Math.round(light * 100)}%`;
}

export function FontProvider({ children }: { children: React.ReactNode }) {
  const { data } = useSiteSettings();
  const headingFont = data?.heading_font || "Hind Siliguri";
  const bodyFont = data?.body_font || "Hind Siliguri";
  const primary = data?.primary_color || "#1a2332";
  const accent = data?.accent_color || "#2563eb";

  useEffect(() => {
    // Inject / replace Google Fonts link
    const families = new Set([headingFont, bodyFont]);
    const familyParam = Array.from(families)
      .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800`)
      .join("&");
    const href = `https://fonts.googleapis.com/css2?${familyParam}&display=swap`;

    let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty(
      "--font-heading",
      `'${headingFont}', 'Hind Siliguri', system-ui, sans-serif`,
    );
    root.style.setProperty(
      "--font-body",
      `'${bodyFont}', 'Hind Siliguri', system-ui, sans-serif`,
    );

    const primaryHsl = hexToHsl(primary);
    const accentHsl = hexToHsl(accent);
    if (primaryHsl) root.style.setProperty("--primary", primaryHsl);
    if (accentHsl) {
      root.style.setProperty("--accent", accentHsl);
      root.style.setProperty("--ring", accentHsl);
    }
  }, [headingFont, bodyFont, primary, accent]);

  return <>{children}</>;
}
