import { useState, useEffect, useCallback, useRef } from "react";
import { Maximize, Minimize } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  videoId: string;
  courseId: string;
  courseSlug?: string;
}

// ── Layer A: iCAN Academy legal warning ──────────────────────────────────────
// 4 positions spread so at least one survives any crop
const WARN_POSITIONS: { style: React.CSSProperties }[] = [
  { style: { top: "12%",  left: "50%",  transform: "translateX(-50%) rotate(-12deg)" } },
  { style: { top: "40%",  left:  "6%",  transform: "rotate(-12deg)" } },
  { style: { top: "40%",  right: "6%",  transform: "rotate(-12deg)" } },
  { style: { top: "68%",  left: "50%",  transform: "translateX(-50%) rotate(-12deg)" } },
];

const WARN_BASE: React.CSSProperties = {
  position: "absolute",
  pointerEvents: "none",
  userSelect: "none",
  textAlign: "center",
  color: "white",
  textShadow: "0 0 8px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.95)",
};

// ── Layer B: user identity grid ───────────────────────────────────────────────
// 9-position 3×3 offset grid — survives any crop region
const ID_POSITIONS: React.CSSProperties[] = [
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

const ID_MARK: React.CSSProperties = {
  position: "absolute",
  color: "white",
  opacity: 0.30,
  fontSize: "12px",
  fontWeight: 700,
  transform: "rotate(-18deg)",
  whiteSpace: "nowrap",
  textShadow: "0 0 6px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9)",
  letterSpacing: "0.04em",
  pointerEvents: "none",
  userSelect: "none",
};

// Shared overlay wrapper style
const OVERLAY: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  userSelect: "none",
  zIndex: 10,
  overflow: "hidden",
  transition: "opacity 0.7s ease",
};

export function BunnyVideoPlayer({ videoId, courseId, courseSlug }: Props) {
  const { profile, user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [embedUrl, setEmbedUrl]         = useState<string | null>(null);
  const [error, setError]               = useState(false);
  const [retryCount, setRetryCount]     = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // 0 = warning layer, 1 = identity layer — alternates every 3 s
  const [activeLayer, setActiveLayer]   = useState<0 | 1>(0);

  const sessionDate = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
  const idText = profile?.full_name
    ? `${profile.full_name} · ${user?.email ?? ""} · ${sessionDate}`
    : `${user?.email ?? ""} · ${sessionDate}`;

  // ── Watermark layer alternation ───────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setActiveLayer((l) => (l === 0 ? 1 : 0)), 3000);
    return () => clearInterval(id);
  }, []);

  // ── Signed URL fetch ──────────────────────────────────────────────────────
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

  // ── Container-level fullscreen (keeps watermark in fullscreen) ────────────
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await containerRef.current.requestFullscreen();
    } catch { /* user gesture required — ignore */ }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Loading */}
      {!embedUrl && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
        </div>
      )}

      {/* Error + retry */}
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

      {embedUrl && (
        <>
          {/* iframe — no allowFullScreen so browser can't fullscreen it alone */}
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="lesson video"
          />

          {/* ── Layer A: iCAN Academy legal warning ── */}
          <div style={{ ...OVERLAY, opacity: activeLayer === 0 ? 1 : 0 }}>
            {WARN_POSITIONS.map(({ style }, i) => (
              <div key={i} style={{ ...WARN_BASE, ...style }}>
                <p style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  opacity: 0.55,
                  marginBottom: "3px",
                  lineHeight: 1.2,
                }}>
                  iCAN Academy
                </p>
                <p style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  opacity: 0.45,
                  maxWidth: "210px",
                  lineHeight: 1.4,
                }}>
                  ভিডিও রেকর্ড/ ডাউনলোড করা নিষিদ্ধ
                </p>
                <p style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  opacity: 0.45,
                  maxWidth: "210px",
                  lineHeight: 1.4,
                }}>
                  করলে আইনানুগ ব্যবস্থা নেয়া হবে।
                </p>
              </div>
            ))}
          </div>

          {/* ── Layer B: user identity grid ── */}
          <div style={{ ...OVERLAY, opacity: activeLayer === 1 ? 1 : 0 }}>
            {ID_POSITIONS.map((pos, i) => (
              <span key={i} style={{ ...ID_MARK, ...pos }}>
                {idText}
              </span>
            ))}
          </div>

          {/* Fullscreen toggle — hover to reveal */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "ছোট করুন" : "ফুলস্ক্রিন"}
            style={{ zIndex: 20, opacity: isFullscreen ? 1 : undefined }}
            className="absolute bottom-3 right-3 flex items-center justify-center rounded-md bg-black/60 p-1.5 text-white/80 opacity-0 transition-all hover:opacity-100 hover:bg-black/80 hover:text-white focus:opacity-100"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </>
      )}
    </div>
  );
}
