import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ImagePlus, Lightbulb, Lock, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PPDT_MOCK_SET, type PPDTPicture } from "@/lib/ppdt/mock";
import { saveSession, loadSession, type PPDTSubmission, type PPDTSessionData } from "@/lib/ppdt/storage";
import { useCountdown } from "@/hooks/useCountdown";
import { usePPDTSets } from "@/hooks/useISSBContent";

// ─── Timer ────────────────────────────────────────────────────────────────────

function TimerBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const label = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const urgent = remaining <= 10;
  return (
    <div className="space-y-2">
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={["h-full rounded-full transition-all duration-1000 ease-linear", urgent ? "bg-destructive" : "bg-accent"].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={["flex items-center justify-center gap-2 text-2xl font-bold tabular-nums font-heading", urgent ? "text-destructive" : "text-foreground"].join(" ")}>
        🕐 {label}
      </div>
    </div>
  );
}

// ─── Beep ─────────────────────────────────────────────────────────────────────

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* not available */ }
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type ModalPhase = "observe" | "write" | "upload";

function PPDTModal({
  picture,
  onClose,
  onSubmitted,
}: {
  picture: PPDTPicture;
  onClose: () => void;
  onSubmitted: (sub: PPDTSubmission) => void;
}) {
  const OBSERVE_SECS = 30;
  const WRITE_SECS = 270; // 4 min 30 sec

  const [phase, setPhase] = useState<ModalPhase>("observe");
  const [showIdea, setShowIdea] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phaseKey, setPhaseKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const observeTimer = useCountdown(OBSERVE_SECS);
  const writeTimer = useCountdown(WRITE_SECS);

  useEffect(() => {
    playBeep();
    observeTimer.start(() => {
      playBeep();
      setPhase("write");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "write") {
      writeTimer.reset(WRITE_SECS);
      setTimeout(() => writeTimer.start(() => setPhase("upload")), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleReset = () => {
    observeTimer.reset(OBSERVE_SECS);
    writeTimer.reset(WRITE_SECS);
    setPhase("observe");
    setShowIdea(false);
    setShowDetails(false);
    setPhaseKey((k) => k + 1);
    setTimeout(() => {
      playBeep();
      observeTimer.start(() => {
        playBeep();
        setPhase("write");
      });
    }, 50);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) { alert("ফাইলের আকার ১০ MB-র বেশি হওয়া যাবে না।"); return; }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!preview) return;
    onSubmitted({
      picture_number: picture.picture_number,
      story_text: "",
      word_count: 0,
      time_taken: WRITE_SECS - writeTimer.remaining,
      auto_submitted: false,
      submitted_at: new Date().toISOString(),
    });
    onClose();
  };

  const activeTimer = phase === "observe" ? observeTimer : writeTimer;
  const activeTotal = phase === "observe" ? OBSERVE_SECS : WRITE_SECS;

  const phaseLabel =
    phase === "observe"
      ? "Phase 1: Observe the picture carefully."
      : phase === "write"
      ? "Phase 2: Write your full story on paper."
      : "লেখার ছবি আপলোড করুন";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        key={phaseKey}
        className="relative w-full max-w-2xl rounded-2xl bg-background shadow-2xl overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur-sm p-1.5 border hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Picture — always blurred in observe, clear in write/upload */}
        <div className="relative">
          <img
            src={picture.image_url}
            alt={picture.title}
            className="w-full h-64 sm:h-80 object-cover transition-all duration-700"
            style={phase === "observe" ? { filter: "blur(8px)" } : {}}
          />
          <span className="absolute top-3 left-3 flex items-center justify-center rounded px-2 py-1 bg-foreground text-background text-xs font-bold font-heading">
            #{picture.picture_number}
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Phase label */}
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 px-4 py-2 text-sm font-medium text-blue-800 dark:text-blue-300 text-center border border-blue-100 dark:border-blue-900/40">
            {phaseLabel}
          </div>

          {/* Timer or Upload UI */}
          {phase !== "upload" ? (
            <TimerBar remaining={activeTimer.remaining} total={activeTotal} />
          ) : (
            <div className="space-y-3">
              {!preview ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); }}
                  onClick={() => inputRef.current?.click()}
                  className={["rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors", dragging ? "border-accent bg-accent/10" : "border-border hover:border-accent/60 hover:bg-muted/40"].join(" ")}
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">খাতায় লেখা গল্পের ছবি তুলে আপলোড করুন</p>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => { inputRef.current?.removeAttribute("capture"); inputRef.current?.click(); }}>গ্যালারি</Button>
                    <Button size="sm" onClick={() => { inputRef.current?.setAttribute("capture", "environment"); inputRef.current?.click(); }}>ক্যামেরা</Button>
                  </div>
                  <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border">
                  <img src={preview} alt="preview" className="w-full max-h-48 object-contain bg-muted" />
                  <button onClick={() => setPreview(null)} className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm p-1.5 border hover:bg-destructive hover:text-destructive-foreground transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {phase !== "upload" ? (
              <>
                <Button size="sm" disabled className="gap-1.5 cursor-default">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  Test in Progress
                </Button>
                <Button size="sm" variant="destructive" onClick={handleReset} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
                <Button size="sm" variant="outline" onClick={() => { observeTimer.pause(); writeTimer.pause(); setPhase("upload"); }}>
                  <ImagePlus className="mr-1.5 h-3.5 w-3.5" /> Upload
                </Button>
              </>
            ) : (
              <Button size="sm" disabled={!preview} onClick={handleSubmit}>
                জমা দিন
              </Button>
            )}
            <button
              onClick={() => setShowIdea((v) => !v)}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {showIdea ? "Hide Idea" : "Show Idea"}
            </button>
          </div>

          {/* Idea */}
          {showIdea && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-400">
              💡 {picture.idea}
            </div>
          )}

          {/* Phase 2: View Details */}
          {phase === "write" && (
            <div className="border-t pt-3 space-y-2">
              <p className="text-sm text-muted-foreground">{picture.title}</p>
              <button
                onClick={() => setShowDetails((v) => !v)}
                className="text-sm font-semibold text-foreground hover:text-accent transition-colors"
              >
                View Details
              </button>
              {showDetails && (
                <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-foreground leading-relaxed">
                  {picture.description}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function PPDTCard({
  picture,
  isLocked,
  isSubmitted,
  onStartTest,
  onUpload,
}: {
  picture: PPDTPicture;
  isLocked: boolean;
  isSubmitted: boolean;
  onStartTest: () => void;
  onUpload: (imageData: string) => void;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [showIdea, setShowIdea] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className={["rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col", isLocked ? "opacity-60" : ""].join(" ")}>
      {/* Image — always blurred on card */}
      <div className="relative">
        <img
          src={picture.image_url}
          alt={picture.title}
          className="w-full h-44 object-cover"
          style={isLocked
            ? { filter: "grayscale(1) brightness(0.7) blur(4px)" }
            : { filter: "blur(4px)" }}
        />
        <span className="absolute top-2 left-2 flex items-center justify-center rounded px-2 py-0.5 bg-foreground text-background text-xs font-bold font-heading">
          #{picture.picture_number}
        </span>
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-muted">
        <div
          className={["h-full transition-all", isSubmitted ? "bg-green-500" : "bg-accent/40"].join(" ")}
          style={{ width: isSubmitted ? "100%" : "10%" }}
        />
      </div>

      {/* Idea box */}
      {showIdea && !isLocked && (
        <div className="mx-3 mt-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-800 dark:text-amber-400">
          💡 {picture.idea}
        </div>
      )}

      {/* Inline upload */}
      {showUpload && !isLocked && (
        <div className="px-3 pt-3 space-y-2">
          {!preview ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { inputRef.current?.removeAttribute("capture"); inputRef.current?.click(); }}>গ্যালারি</Button>
              <Button size="sm" className="flex-1" onClick={() => { inputRef.current?.setAttribute("capture", "environment"); inputRef.current?.click(); }}>ক্যামেরা</Button>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="relative rounded-lg overflow-hidden border">
                <img src={preview} alt="preview" className="w-full h-20 object-cover bg-muted" />
                <button onClick={() => setPreview(null)} className="absolute top-1 right-1 rounded-full bg-background/80 p-1 border">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <Button size="sm" className="w-full" onClick={() => { onUpload(preview); setShowUpload(false); setPreview(null); }}>
                জমা দিন
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2 px-3 py-3 mt-auto">
        <Button size="sm" disabled={isLocked || isSubmitted} onClick={onStartTest} className="gap-1.5">
          {isSubmitted ? "জমা দেওয়া হয়েছে" : <><span>▶</span> Start Test</>}
        </Button>
        <Button size="sm" variant="outline" disabled={isLocked} onClick={() => setShowUpload((v) => !v)} className="gap-1.5">
          <ImagePlus className="h-3.5 w-3.5" /> Upload
        </Button>
        <button
          disabled={isLocked}
          onClick={() => setShowIdea((v) => !v)}
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:pointer-events-none transition-colors"
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {showIdea ? "Hide Idea" : "Show Idea"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PPDTTest() {
  const { id: courseId = "issb1" } = useParams<{ id: string }>();
  const { data: dbSets = [] } = usePPDTSets(courseId);
  const setData = dbSets.length > 0
    ? {
        id: dbSets[0].id,
        name: dbSets[0].title,
        is_active: dbSets[0].is_published,
        pictures: (dbSets[0].ppdt_pictures ?? []).map((p): PPDTPicture => ({
          id: p.id,
          picture_number: p.picture_number,
          image_url: p.image_url,
          title: p.title,
          description: p.idea,
          idea: p.idea,
        })),
      }
    : PPDT_MOCK_SET;

  const [activePicture, setActivePicture] = useState<PPDTPicture | null>(null);
  const [session, setSession] = useState<PPDTSessionData>(() => {
    return loadSession(courseId) ?? {
      set_id: setData.id,
      set_name: setData.name,
      started_at: new Date().toISOString(),
      submissions: [],
      completed: false,
    };
  });

  const isSubmitted = (picNum: number) =>
    session.submissions.some((s) => s.picture_number === picNum);

  const handleSubmitted = (sub: PPDTSubmission) => {
    const newSubs = [
      ...session.submissions.filter((s) => s.picture_number !== sub.picture_number),
      sub,
    ];
    const updated: PPDTSessionData = {
      ...session,
      submissions: newSubs,
      completed: newSubs.length >= setData.pictures.length,
    };
    setSession(updated);
    saveSession(courseId, updated);
  };

  const handleCardUpload = (picNum: number, imageData: string) => {
    handleSubmitted({
      picture_number: picNum,
      story_text: imageData,
      word_count: 0,
      time_taken: 0,
      auto_submitted: false,
      submitted_at: new Date().toISOString(),
    });
  };

  return (
    <>
      {activePicture && (
        <PPDTModal
          picture={activePicture}
          onClose={() => setActivePicture(null)}
          onSubmitted={(sub) => { handleSubmitted(sub); setActivePicture(null); }}
        />
      )}

      <div className="container py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/" className="hover:text-foreground">হোম</Link></li>
            <li aria-hidden>›</li>
            <li><Link to="/courses" className="hover:text-foreground">কোর্সসমূহ</Link></li>
            <li aria-hidden>›</li>
            <li><Link to={`/courses/${courseId}`} className="hover:text-foreground">কোর্স</Link></li>
            <li aria-hidden>›</li>
            <li className="text-foreground">PPDT</li>
          </ol>
        </nav>

        {/* Title */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">PPDT</h1>
          <p className="text-sm text-muted-foreground mt-1">Picture Perception & Description Test</p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {setData.pictures.map((pic, idx) => {
            const submitted = isSubmitted(pic.picture_number);
            const locked = idx > 0 && !isSubmitted(setData.pictures[idx - 1].picture_number);
            return (
              <PPDTCard
                key={pic.id}
                picture={pic}
                isLocked={locked}
                isSubmitted={submitted}
                onStartTest={() => setActivePicture(pic)}
                onUpload={(img) => handleCardUpload(pic.picture_number, img)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
