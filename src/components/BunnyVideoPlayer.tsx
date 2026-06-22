import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  videoId: string;
  courseId: string;
  courseSlug?: string;
}

// 5 positions scattered across the video frame so no crop hides all marks
const POSITIONS: React.CSSProperties[] = [
  { top: "12%",  left: "8%" },
  { top: "12%",  right: "8%" },
  { top: "47%",  left: "28%" },
  { top: "73%",  left: "8%" },
  { top: "73%",  right: "8%" },
];

const MARK_STYLE: React.CSSProperties = {
  position: "absolute",
  color: "white",
  opacity: 0.22,
  fontSize: "13px",
  fontWeight: 700,
  transform: "rotate(-18deg)",
  whiteSpace: "nowrap",
  textShadow: "0 1px 4px rgba(0,0,0,0.95)",
  letterSpacing: "0.03em",
  pointerEvents: "none",
  userSelect: "none",
};

export function BunnyVideoPlayer({ videoId, courseId, courseSlug }: Props) {
  const { profile, user } = useAuth();
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const watermarkText =
    profile?.full_name
      ? `${profile.full_name} · ${user?.email ?? ""}`
      : (user?.email ?? "");

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
  }, [videoId, courseId, courseSlug]);

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

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/50">
          ভিডিও লোড করা যায়নি
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

          {/* Tiled watermark — visible on screen recordings */}
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
