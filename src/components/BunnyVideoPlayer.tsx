import { useState, useEffect, useCallback, useRef } from "react";
import { Maximize, Minimize } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  videoId: string;
  courseId: string;
  courseSlug?: string;
}

// 9 positions in a 3×3 offset grid — survives any crop region
const POSITIONS: React.CSSProperties[] = [
  { top:  "8%", left:  "4%" },
  { top:  "8%", left: "38%" },
  { top:  "8%", right: "4%" },
  { top: "44%", left: "18%" },
  { top: "44%", right: "18%" },
  { top: "78%", left:  "4%" },
  { top: "78%", left: "38%" },
  { top: "78%", right: "4%" },
  { top: "26%", left: "62%" },
];

const MARK_STYLE: React.CSSProperties = {
  position: "absolute",
  color: "white",
  opacity: 0.28,
  fontSize: "12px",
  fontWeight: 700,
  transform: "rotate(-18deg)",
  whiteSpace: "nowrap",
  textShadow: "0 0 6px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9)",
  letterSpacing: "0.04em",
  pointerEvents: "none",
  userSelect: "none",
};

export function BunnyVideoPlayer({ videoId, courseId, courseSlug }: Props) {
  const { profile, user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [embedUrl, setEmbedUrl]       = useState<string | null>(null);
  const [error, setError]             = useState(false);
  const [retryCount, setRetryCount]   = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Session date stamped at load time — helps trace when a pirated recording was made
  const sessionDate = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
  const watermarkText = profile?.full_name
    ? `${profile.full_name} · ${user?.email ?? ""} · ${sessionDate}`
    : `${user?.email ?? ""} · ${sessionDate}`;

  // ── Signed URL fetch ─────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    setError(false);
    setEmbedUrl(null);
    setRetryCount((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setEmbedUrl(null);
    setError(false);

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (!cancelled) setError(true); return; }

      const params = new URLSearchParams({ videoId, courseId });
      if (courseSlug) params.set("courseSlug", courseSlug);

      try {
        const res = await fetch(`/api/bunny-video-token?${params}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) { if (!cancelled) setError(true); return; }
        const { url } = await res.json() as { url: string };
        if (!cancelled) setEmbedUrl(url);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [videoId, courseId, courseSlug, retryCount]);

  // ── Custom fullscreen (container div, not iframe) ─────────────────────────
  // We do NOT use allowFullScreen on the iframe. If the browser fullscreens only
  // the iframe, our watermark overlay stays behind in the parent DOM and disappears.
  // By fullscreening the container div ourselves, the watermark travels with it.
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      // Browser denied fullscreen (e.g. not triggered by user gesture) — ignore
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Loading spinner */}
      {!embedUrl && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
        </div>
      )}

      {/* Error state with retry */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-white/50">ভিডিও লোড করা যায়নি</p>
          <button
            onClick={retry}
            className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      )}

      {/* Player + watermark + fullscreen button */}
      {embedUrl && (
        <>
          {/*
            Iframe does NOT have allowFullScreen / fullscreen in allow.
            This prevents the browser from fullscreening only the iframe
            (which would leave our watermark overlay behind).
            Our custom button fullscreens the container div instead,
            so the watermark is always included.
          */}
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="lesson video"
          />

          {/* Identity watermark — present in fullscreen because the container goes fullscreen */}
          {watermarkText && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 10,
                overflow: "hidden",
              }}
            >
              {POSITIONS.map((pos, i) => (
                <span key={i} style={{ ...MARK_STYLE, ...pos }}>
                  {watermarkText}
                </span>
              ))}
            </div>
          )}

          {/* Custom fullscreen button — visible on hover or when already fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "ছোট করুন" : "ফুলস্ক্রিন"}
            style={{ zIndex: 20, opacity: isFullscreen ? 1 : undefined }}
            className="absolute bottom-3 right-3 flex items-center justify-center rounded-md bg-black/60 p-1.5 text-white/80 opacity-0 transition-all hover:opacity-100 hover:bg-black/80 hover:text-white focus:opacity-100"
          >
            {isFullscreen
              ? <Minimize className="h-4 w-4" />
              : <Maximize className="h-4 w-4" />
            }
          </button>
        </>
      )}
    </div>
  );
}
