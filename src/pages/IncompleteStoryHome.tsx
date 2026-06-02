import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ImagePlus, Lightbulb, Lock, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INCOMPLETE_STORIES, type IncompleteStory } from "@/lib/incomplete-story/mock";
import { loadSubmission, saveSubmission } from "@/hooks/useStorySubmission";
import { useCountdown } from "@/hooks/useCountdown";
import { useIncompleteStorySets } from "@/hooks/useISSBContent";

// ─── Labels ───────────────────────────────────────────────────────────────────

const BN = {
  title: "Incomplete Story",
  toggle: ["বাংলা", "English"] as const,
  startTest: "Start Test",
  upload: "Upload",
  showIdea: "Show Idea",
  hideIdea: "Hide Idea",
  phase1: "ধাপ ১: গল্পটি মনোযোগ দিয়ে পড়ুন",
  phase2: "Phase 2: Write your full story on paper.",
  phaseUpload: "লেখার ছবি আপলোড করুন",
  testInProgress: "Test in Progress",
  reset: "Reset",
  submit: "জমা দিন",
  submitted: "জমা দেওয়া হয়েছে",
  locked: "Locked",
  uploadPrompt: "খাতায় লেখা গল্পের ছবি তুলে আপলোড করুন",
  cameraBtn: "ক্যামেরা",
  galleryBtn: "গ্যালারি",
  replaceBtn: "পরিবর্তন করুন",
  done: "সম্পন্ন",
};

const EN: typeof BN = {
  title: "Incomplete Story",
  toggle: ["বাংলা", "English"] as const,
  startTest: "Start Test",
  upload: "Upload",
  showIdea: "Show Idea",
  hideIdea: "Hide Idea",
  phase1: "Phase 1: Read the story carefully",
  phase2: "Phase 2: Write your full story on paper.",
  phaseUpload: "Upload your handwritten story",
  testInProgress: "Test in Progress",
  reset: "Reset",
  submit: "Submit",
  submitted: "Submitted",
  locked: "Locked",
  uploadPrompt: "Take a photo of your handwritten story and upload it",
  cameraBtn: "Camera",
  galleryBtn: "Gallery",
  replaceBtn: "Replace",
  done: "Done",
};

type Lang = "bn" | "en";

// ─── Timer display ─────────────────────────────────────────────────────────────

function TimerBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const label = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const urgent = remaining <= 10;

  return (
    <div className="space-y-1.5">
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={["h-full rounded-full transition-all duration-1000 ease-linear", urgent ? "bg-destructive" : "bg-[hsl(var(--accent))]"].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={["flex items-center gap-2 text-lg font-bold tabular-nums font-heading", urgent ? "text-destructive" : "text-foreground"].join(" ")}>
        <span className="text-base">🕐</span>
        {label}
      </div>
    </div>
  );
}

// ─── Modal phases ──────────────────────────────────────────────────────────────

type ModalPhase = "read" | "write" | "upload";

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
  } catch {
    // AudioContext not available (e.g. in tests)
  }
}

function ModalContent({
  story,
  storyIndex,
  courseId,
  lang,
  L,
  onClose,
  onDone,
}: {
  story: IncompleteStory;
  storyIndex: number;
  courseId: string;
  lang: Lang;
  L: typeof BN;
  onClose: () => void;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<ModalPhase>("read");
  const [showIdea, setShowIdea] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phaseKey, setPhaseKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const READ_SECS = 30;
  const WRITE_SECS = 600; // 10 min

  const readTimer = useCountdown(READ_SECS);
  const writeTimer = useCountdown(WRITE_SECS);

  useEffect(() => {
    playBeep();
    readTimer.start(() => {
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
    readTimer.reset(READ_SECS);
    writeTimer.reset(WRITE_SECS);
    setPhase("read");
    setShowIdea(false);
    setPhaseKey((k) => k + 1);
    setTimeout(() => {
      playBeep();
      readTimer.start(() => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!preview) return;
    try {
      saveSubmission(courseId, story.id, preview);
      onDone();
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "জমা দিতে ব্যর্থ হয়েছে।");
    }
  };

  const phaseLabel = phase === "read" ? L.phase1 : phase === "write" ? L.phase2 : L.phaseUpload;
  const activeTimer = phase === "read" ? readTimer : writeTimer;

  return (
    <div key={phaseKey} className="flex flex-col gap-4">
      {/* Story number + text */}
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded bg-foreground text-background text-xs font-bold font-heading">
          #{storyIndex + 1}
        </span>
        <p
          className="text-sm leading-relaxed text-foreground font-medium whitespace-pre-line transition-all duration-500 select-none"
          style={phase === "write" ? { filter: "blur(6px)", userSelect: "none" } : {}}
        >
          {story.body}
        </p>
      </div>

      {/* Idea box */}
      {showIdea && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-400">
          💡 {story.idea}
        </div>
      )}

      {/* Phase label */}
      <div className="rounded-md bg-muted px-4 py-2 text-sm font-medium text-foreground text-center">
        {phaseLabel}
      </div>

      {/* Timer (read/write phases) or Upload UI */}
      {phase !== "upload" ? (
        <TimerBar
          remaining={activeTimer.remaining}
          total={phase === "read" ? READ_SECS : WRITE_SECS}
        />
      ) : (
        <div className="space-y-3">
          {!preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={[
                "rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors",
                dragging ? "border-accent bg-accent/10" : "border-border hover:border-accent/60 hover:bg-muted/40",
              ].join(" ")}
            >
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">{L.uploadPrompt}</p>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button variant="outline" size="sm" onClick={() => { inputRef.current?.removeAttribute("capture"); inputRef.current?.click(); }}>
                  {L.galleryBtn}
                </Button>
                <Button size="sm" onClick={() => { inputRef.current?.setAttribute("capture", "environment"); inputRef.current?.click(); }}>
                  {L.cameraBtn}
                </Button>
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border">
              <img src={preview} alt="preview" className="w-full max-h-52 object-contain bg-muted" />
              <button
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm p-1.5 border hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {phase !== "upload" ? (
          <>
            <Button size="sm" disabled className="gap-1.5 cursor-default">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              {L.testInProgress}
            </Button>
            <Button size="sm" variant="destructive" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> {L.reset}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { readTimer.pause(); writeTimer.pause(); setPhase("upload"); }}>
              {L.upload}
            </Button>
          </>
        ) : (
          <Button size="sm" disabled={!preview} onClick={handleSubmit}>
            {L.submit}
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowIdea((v) => !v)}
          className="ml-auto gap-1.5 text-muted-foreground"
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {showIdea ? L.hideIdea : L.showIdea}
        </Button>
      </div>
    </div>
  );
}

// ─── Modal wrapper ─────────────────────────────────────────────────────────────

function StoryModal({
  story,
  storyIndex,
  courseId,
  lang,
  L,
  onClose,
  onDone,
}: {
  story: IncompleteStory;
  storyIndex: number;
  courseId: string;
  lang: Lang;
  L: typeof BN;
  onClose: () => void;
  onDone: () => void;
}) {
  // Close on backdrop click
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-background shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <ModalContent
          story={story}
          storyIndex={storyIndex}
          courseId={courseId}
          lang={lang}
          L={L}
          onClose={onClose}
          onDone={onDone}
        />
      </div>
    </div>
  );
}

// ─── Story Card ────────────────────────────────────────────────────────────────

function StoryCard({
  story,
  index,
  courseId,
  isLocked,
  isSubmitted,
  lang,
  L,
  onTestStart,
}: {
  story: IncompleteStory;
  index: number;
  courseId: string;
  isLocked: boolean;
  isSubmitted: boolean;
  lang: Lang;
  L: typeof BN;
  onTestStart: () => void;
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
    <div className={["rounded-xl border bg-card shadow-sm flex flex-col overflow-hidden", isLocked ? "opacity-60" : ""].join(" ")}>
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50 backdrop-blur-[1px]">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
      )}

      <div className="relative flex flex-col flex-1 p-4 gap-3">
        {/* Number badge */}
        <span className="self-start rounded px-2 py-0.5 bg-foreground text-background text-xs font-bold font-heading">
          #{index + 1}
        </span>

        {/* Story text preview */}
        <p className="text-sm text-foreground leading-relaxed line-clamp-4">
          {story.body}
        </p>

        {/* Idea box */}
        {showIdea && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-800 dark:text-amber-400">
            💡 {story.idea}
          </div>
        )}

        {/* Inline upload (from card Upload button) */}
        {showUpload && !isLocked && (
          <div className="space-y-2">
            {!preview ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { inputRef.current?.removeAttribute("capture"); inputRef.current?.click(); }}>
                  {L.galleryBtn}
                </Button>
                <Button size="sm" className="flex-1" onClick={() => { inputRef.current?.setAttribute("capture", "environment"); inputRef.current?.click(); }}>
                  {L.cameraBtn}
                </Button>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative rounded-lg overflow-hidden border">
                  <img src={preview} alt="preview" className="w-full h-24 object-cover bg-muted" />
                  <button onClick={() => setPreview(null)} className="absolute top-1 right-1 rounded-full bg-background/80 p-1 border">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    try {
                      saveSubmission(courseId, story.id, preview);
                      setShowUpload(false);
                      setPreview(null);
                      window.location.reload();
                    } catch (err: unknown) {
                      alert(err instanceof Error ? err.message : "জমা দিতে ব্যর্থ হয়েছে।");
                    }
                  }}
                >
                  {L.submit}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-auto">
          <div
            className={["h-full rounded-full transition-all", isSubmitted ? "bg-green-500" : "bg-accent/40"].join(" ")}
            style={{ width: isSubmitted ? "100%" : "12%" }}
          />
        </div>
      </div>

      {/* Buttons row */}
      <div className="flex items-center gap-2 border-t px-4 py-3">
        <Button
          size="sm"
          disabled={isLocked || isSubmitted}
          onClick={onTestStart}
          className="gap-1.5"
        >
          {isSubmitted ? (
            <>{L.submitted}</>
          ) : (
            <><span>▶</span> {L.startTest}</>
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={isLocked}
          onClick={() => setShowUpload((v) => !v)}
          className="gap-1.5"
        >
          <ImagePlus className="h-3.5 w-3.5" /> {L.upload}
        </Button>

        <button
          disabled={isLocked}
          onClick={() => setShowIdea((v) => !v)}
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:pointer-events-none transition-colors"
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {showIdea ? L.hideIdea : L.showIdea}
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function IncompleteStoryHome() {
  const { id: courseId = "" } = useParams<{ id: string }>();
  const [lang, setLang] = useState<Lang>("bn");
  const [activeStory, setActiveStory] = useState<IncompleteStory | null>(null);
  const [, forceUpdate] = useState(0);

  const L = lang === "bn" ? BN : EN;

  const { data: dbSets = [] } = useIncompleteStorySets(courseId);
  const stories: IncompleteStory[] = dbSets.length > 0
    ? dbSets.flatMap((set) =>
        (set.incomplete_stories ?? []).map((s) => ({
          id: s.id,
          title: s.title,
          instruction: s.instruction ?? "",
          body: s.body,
          wordLimit: String(s.word_limit),
          timeGuide: `${s.time_guide_minutes} minutes`,
          idea: s.idea ?? "",
        }))
      )
    : INCOMPLETE_STORIES;

  const submissions = stories.map((s) => loadSubmission(courseId, s.id));

  return (
    <>
      {/* Modal */}
      {activeStory && (
        <StoryModal
          story={activeStory}
          storyIndex={stories.findIndex((s) => s.id === activeStory.id)}
          courseId={courseId}
          lang={lang}
          L={L}
          onClose={() => setActiveStory(null)}
          onDone={() => { setActiveStory(null); forceUpdate((n) => n + 1); }}
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
            <li className="text-foreground">Incomplete Story</li>
          </ol>
        </nav>

        {/* Title + language toggle */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {L.title}
          </h1>
          <div className="flex rounded-full border border-border overflow-hidden text-sm font-medium">
            <button
              onClick={() => setLang("bn")}
              className={["px-6 py-2 transition-colors", lang === "bn" ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-muted"].join(" ")}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLang("en")}
              className={["px-6 py-2 transition-colors", lang === "en" ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-muted"].join(" ")}
            >
              English
            </button>
          </div>
        </div>

        {/* 3-column grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, idx) => {
            const isSubmitted = !!submissions[idx];
            const isLocked = idx > 0 && !submissions[idx - 1];

            return (
              <div key={story.id} className="relative">
                <StoryCard
                  story={story}
                  index={idx}
                  courseId={courseId}
                  isLocked={isLocked}
                  isSubmitted={isSubmitted}
                  lang={lang}
                  L={L}
                  onTestStart={() => setActiveStory(story)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
