import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  videoId: string;
  courseId: string;
  courseSlug?: string;
}

// 9 positions in a 3×3 grid, odd rows offset right — survives any crop region
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
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Session date stamped at load time — helps identify when a pirated recording was made
  const sessionDate = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
  const watermarkText =
    profile?.full_name
      ? `${profile.full_name} · ${user?.email ?? ""} · ${sessionDate}`
      : `${user?.email ?? ""} · ${sessionDate}`;

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

  return (
    <div
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

      {/* Player + watermark */}
      {embedUrl && (
        <>
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title="lesson video"
          />

          {/* Tiled identity watermark — persists in screen recordings for piracy tracing */}
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
        </>
      )}
    </div>
  );
}
