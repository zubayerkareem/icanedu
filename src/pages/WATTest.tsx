import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Maximize2, Minimize2, Pause, Play, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WAT_SETS } from "@/lib/wat/mock";
import { useWATSets } from "@/hooks/useISSBContent";

const WORD_SECONDS = 10;

// ─── Audio ────────────────────────────────────────────────────────────────────

function playExpiry() {
  try {
    const ctx = new AudioContext();
    // Two short beeps
    [0, 0.18].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.5, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.15);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.15);
    });
  } catch { /* not available */ }
}

// ─── Instructions ─────────────────────────────────────────────────────────────

function Instructions({ title, wordCount, onStart }: { title: string; wordCount: number; onStart: () => void }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)", backgroundSize: "24px 24px" }}
    >
      <div className="w-full max-w-lg rounded-2xl border bg-background shadow-lg p-8 sm:p-10 text-center space-y-5">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background font-heading font-bold text-lg">
            WAT
          </div>
        </div>

        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Word Association Test</h1>
          <p className="mt-1 text-sm text-accent font-medium">{title}</p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          A word will appear for <strong>{WORD_SECONDS} seconds</strong>. Write a meaningful sentence instantly.
          The next word appears automatically. Stay focused and be spontaneous.
        </p>

        <p className="text-xs text-muted-foreground">
          {wordCount} words · {WORD_SECONDS}s each · write on paper
        </p>

        <Button size="lg" className="w-full gap-2" onClick={onStart}>
          Start Test <span>→</span>
        </Button>
      </div>
    </div>
  );
}

// ─── Test screen ──────────────────────────────────────────────────────────────

function TestScreen({
  title,
  words,
  onFinish,
}: {
  title: string;
  words: string[];
  onFinish: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WORD_SECONDS);
  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRef = useRef(0);
  const wordEndTimeRef = useRef<number>(Date.now() + WORD_SECONDS * 1000);
  const pausedRemainingRef = useRef<number>(WORD_SECONDS);

  const advance = useCallback(() => {
    if (currentRef.current >= words.length - 1) { onFinish(); return; }
    currentRef.current += 1;
    setCurrent(currentRef.current);
  }, [words.length, onFinish]);

  const runInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((wordEndTimeRef.current - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) { playExpiry(); advance(); }
    }, 200);
  }, [advance]);

  // Reset word clock and start interval whenever the word changes
  useEffect(() => {
    wordEndTimeRef.current = Date.now() + WORD_SECONDS * 1000;
    setTimeLeft(WORD_SECONDS);
    if (!paused) runInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Force-recalculate timer the instant the tab becomes visible
  useEffect(() => {
    const handle = () => {
      if (!document.hidden && !paused) {
        const left = Math.max(0, Math.ceil((wordEndTimeRef.current - Date.now()) / 1000));
        setTimeLeft(left);
        if (left <= 0) { playExpiry(); advance(); }
      }
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [paused, advance]);

  // Fullscreen change listener
  useEffect(() => {
    const handle = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handle);
    return () => document.removeEventListener("fullscreenchange", handle);
  }, []);

  const togglePause = () => {
    if (!paused) {
      pausedRemainingRef.current = Math.max(0, Math.ceil((wordEndTimeRef.current - Date.now()) / 1000));
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      setPaused(true);
    } else {
      wordEndTimeRef.current = Date.now() + pausedRemainingRef.current * 1000;
      setPaused(false);
      runInterval();
    }
  };

  const handleNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    advance();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const pct = (timeLeft / WORD_SECONDS) * 100;
  const word = words[current];

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center p-4 bg-background"
      style={{ backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)", backgroundSize: "24px 24px" }}
    >
      <div className="w-full max-w-2xl rounded-2xl border bg-background shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <span className="font-heading font-bold text-foreground text-base">{title}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background font-heading font-bold text-xs">
            WAT
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span>{current + 1} / {words.length}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${((current + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Word display */}
        <div className="flex items-center justify-center px-6 py-14">
          <span
            key={word}
            className="font-heading font-black text-foreground tracking-wider select-none"
            style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}
          >
            {word}
          </span>
        </div>

        {/* Timer */}
        <div className="px-6 pb-2 space-y-2">
          <div className={["flex items-center justify-center gap-2 font-heading text-2xl font-bold tabular-nums", timeLeft <= 3 ? "text-destructive" : "text-foreground"].join(" ")}>
            🕐 {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={["h-full rounded-full transition-all duration-1000 ease-linear", timeLeft <= 3 ? "bg-destructive" : "bg-foreground"].join(" ")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 border-t my-3" />

        {/* Controls */}
        <div className="flex items-center justify-between px-6 pb-5">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={togglePause} className="gap-1.5">
              {paused ? <><Play className="h-3.5 w-3.5" /> Resume</> : <><Pause className="h-3.5 w-3.5" /> Pause</>}
            </Button>
            <Button size="sm" onClick={handleNext} className="gap-1.5">
              Next <SkipForward className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onFinish}>
              Finish
            </Button>
          </div>
          <button
            onClick={toggleFullscreen}
            className="rounded-lg border p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Paused overlay */}
        {paused && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm">
            <div className="text-center space-y-3">
              <p className="font-heading text-2xl font-bold text-foreground">বিরতি</p>
              <Button onClick={togglePause} className="gap-2">
                <Play className="h-4 w-4" /> চালিয়ে যান
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Complete ─────────────────────────────────────────────────────────────────

function CompleteScreen({ title, wordCount, courseId }: { title: string; wordCount: number; courseId: string }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)", backgroundSize: "24px 24px" }}
    >
      <div className="w-full max-w-lg rounded-2xl border bg-background shadow-lg p-8 text-center space-y-5">
        <div className="text-5xl">🎉</div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Test Complete!</h1>
          <p className="mt-1 text-sm text-muted-foreground">{title}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          আপনি সফলভাবে <strong>{wordCount}</strong>টি শব্দের WAT সম্পন্ন করেছেন।
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <Link to={`/courses/${courseId}/wat`}>সব সেট দেখুন</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to={`/courses/${courseId}`}>কোর্সে ফিরুন</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Phase = "instructions" | "test" | "complete";

export default function WATTest() {
  const { id: courseId = "", setId = "" } = useParams<{ id: string; setId: string }>();
  const [phase, setPhase] = useState<Phase>("instructions");
  const { data: dbSets = [], isLoading } = useWATSets(courseId);

  const dbSet = dbSets.find((s) => s.id === setId);
  const mockSet = !dbSet ? WAT_SETS.find((s) => s.id === setId) : undefined;
  const set = dbSet ?? mockSet ?? null;

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!set) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">সেটটি পাওয়া যায়নি</h1>
        <Button asChild variant="outline">
          <Link to={`/courses/${courseId}/wat`}>ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  if (phase === "instructions") {
    return (
      <Instructions
        title={set.title}
        wordCount={set.words.length}
        onStart={() => setPhase("test")}
      />
    );
  }

  if (phase === "test") {
    return (
      <TestScreen
        title={set.title}
        words={set.words}
        onFinish={() => setPhase("complete")}
      />
    );
  }

  return (
    <CompleteScreen
      title={set.title}
      wordCount={set.words.length}
      courseId={courseId}
    />
  );
}
