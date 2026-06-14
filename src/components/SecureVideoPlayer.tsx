import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getEmbedUrl } from "@/lib/video";

// Watermark cycles through 6 positions every 30s — covers more of the frame
// so a screen recording captures the user's identity no matter where they crop
const POSITIONS = [
  "top-3 left-3",
  "top-3 right-3",
  "bottom-10 left-3",
  "bottom-10 right-3",
  "top-[45%] left-3",
  "top-[45%] right-3",
] as const;

function hardenUrl(embed: string): string {
  try {
    const u = new URL(embed);
    if (u.hostname.includes("youtube.com")) {
      // Remove suggested videos, annotations, branding, keyboard shortcuts
      u.searchParams.set("modestbranding", "1");
      u.searchParams.set("rel", "0");
      u.searchParams.set("iv_load_policy", "3");
      u.searchParams.set("disablekb", "1");
    }
    if (u.hostname.includes("vimeo.com")) {
      u.searchParams.set("dnt", "1");
      u.searchParams.set("byline", "0");
      u.searchParams.set("portrait", "0");
      u.searchParams.set("title", "0");
    }
    return u.toString();
  } catch {
    return embed;
  }
}

export function SecureVideoPlayer({ url }: { url?: string }) {
  const { user, profile } = useAuth();
  const [posIndex, setPosIndex]   = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const embed        = url ? getEmbedUrl(url) : null;
  const secureEmbed  = embed ? hardenUrl(embed) : null;

  const watermark =
    profile?.full_name
      ? `${profile.full_name} · ${user?.email ?? ""}`
      : (user?.email ?? "");

  // Rotate watermark position every 30 seconds
  useEffect(() => {
    const t = setInterval(() => setPosIndex((i) => (i + 1) % POSITIONS.length), 30_000);
    return () => clearInterval(t);
  }, []);

  // Block keyboard shortcuts used for saving, devtools, screen capture
  useEffect(() => {
    function block(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const k = e.key.toLowerCase();

      const blocked =
        e.key === "F12" ||                              // DevTools
        e.key === "PrintScreen" ||                     // Screenshot (Windows)
        (ctrl && k === "s") ||                         // Save page
        (ctrl && k === "u") ||                         // View source
        (ctrl && k === "p") ||                         // Print
        (ctrl && shift && k === "i") ||                // DevTools
        (ctrl && shift && k === "j") ||                // Console
        (ctrl && shift && k === "c");                  // Inspect element

      if (blocked) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }

    document.addEventListener("keydown", block, { capture: true });
    return () => document.removeEventListener("keydown", block, { capture: true });
  }, []);

  // Show a brief overlay warning when the window loses focus
  // (often indicates Alt+Tab to a recording app or PrtScn)
  useEffect(() => {
    function onBlur() { setShowWarning(true); }
    function onFocus() { setTimeout(() => setShowWarning(false), 1500); }
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (!secureEmbed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black flex items-center justify-center text-sm text-white/60">
        ভিডিও পাওয়া যায়নি
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Video iframe */}
      <iframe
        key={secureEmbed}
        src={secureEmbed}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="lesson video"
      />

      {/* Transparent interaction blocker — pointer-events:none so iframe controls still work,
          but drag/copy on the container level is blocked */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden />

      {/* User identity watermark — semi-transparent, rotates position */}
      {watermark && (
        <div
          className={`absolute ${POSITIONS[posIndex]} pointer-events-none z-10 transition-all duration-[2000ms] ease-in-out`}
          aria-hidden
        >
          <span className="block rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight text-white/25 select-none">
            {watermark}
          </span>
        </div>
      )}

      {/* Focus-loss warning overlay */}
      {showWarning && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 pointer-events-none transition-opacity">
          <p className="text-sm font-semibold text-white/80">
            🔒 এই ভিডিও রেকর্ড বা ডাউনলোড করা অনুমতি ছাড়া নিষিদ্ধ
          </p>
        </div>
      )}
    </div>
  );
}
