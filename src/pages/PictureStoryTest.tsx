import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Lightbulb, Lock, RotateCcw, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PICTURE_STORY_MOCK_SET, type PictureStoryPicture } from "@/lib/picture-story/mock";
import { saveSession, loadSession, type PictureStorySubmission, type PictureStorySession } from "@/lib/picture-story/storage";
import { useCountdown } from "@/hooks/useCountdown";
import { usePictureStorySets } from "@/hooks/useISSBContent";
import { useIsEnrolled } from "@/hooks/useEnrollment";
import { useCourse } from "@/hooks/useCourse";

// ─── Labels ───────────────────────────────────────────────────────────────────

const BN = {
  title: "পিকচার স্টোরি",
  startTest: "Start Test",
  upload: "Upload",
  showIdea: "Show Idea",
  hideIdea: "Hide Idea",
  phase1: "Phase 1: Observe the picture carefully.",
  phase2: "Phase 2: Write your full story on paper.",
  phaseUpload: "লেখার ছবি আপলোড করুন",
  testInProgress: "Test in Progress",
  reset: "Reset",
  submit: "জমা দিন",
  submitted: "জমা দেওয়া হয়েছে",
  viewDetails: "View Details",
  cameraBtn: "ক্যামেরা",
  galleryBtn: "গ্যালারি",
  uploadPrompt: "খাতায় লেখা গল্পের ছবি তুলে আপলোড করুন",
  viewSet: "দেখুন",
  back: "পেছনে",
  free: "ফ্রি",
  premium: "প্রিমিয়াম",
  pictures: "টি ছবি",
  set: "সেট",
  buyNow: "কোর্সটি কিনুন",
  premiumContent: "এই কন্টেন্টটি প্রিমিয়াম",
  premiumDesc: "এই সেটটি অ্যাক্সেস করতে কোর্সটি কিনুন।",
};

const EN: typeof BN = {
  title: "Picture Story",
  startTest: "Start Test",
  upload: "Upload",
  showIdea: "Show Idea",
  hideIdea: "Hide Idea",
  phase1: "Phase 1: Observe the picture carefully.",
  phase2: "Phase 2: Write your full story on paper.",
  phaseUpload: "Upload your handwritten story",
  testInProgress: "Test in Progress",
  reset: "Reset",
  submit: "Submit",
  submitted: "Submitted",
  viewDetails: "View Details",
  cameraBtn: "Camera",
  galleryBtn: "Gallery",
  uploadPrompt: "Take a photo of your handwritten story and upload it",
  viewSet: "View",
  back: "Back",
  free: "Free",
  premium: "Premium",
  pictures: " pictures",
  set: "Set",
  buyNow: "Buy Course",
  premiumContent: "Premium Content",
  premiumDesc: "Purchase the course to access this set.",
};

type Lang = "bn" | "en";
type ModalPhase = "observe" | "write" | "upload";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    // not available
  }
}

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

// ─── Modal ────────────────────────────────────────────────────────────────────

function PictureModal({
  picture,
  pictureNumber,
  courseId,
  L,
  onClose,
  onSubmitted,
}: {
  picture: PictureStoryPicture;
  pictureNumber: number;
  courseId: string;
  L: typeof BN;
  onClose: () => void;
  onSubmitted: (sub: PictureStorySubmission) => void;
}) {
  const OBSERVE_SECS = 30;
  const WRITE_SECS = 60;

  const [phase, setPhase] = useState<ModalPhase>("observe");
  const [showIdea, setShowIdea] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phaseKey, setPhaseKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const observeTimer = useCountdown(OBSERVE_SECS);
  const writeTimer = useCountdown(WRITE_SECS);

  // Start observe phase on mount
  useEffect(() => {
    playBeep();
    observeTimer.start(() => {
      playBeep();
      setPhase("write");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start write timer when phase transitions to write
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
    const sub: PictureStorySubmission = {
      picture_number: pictureNumber,
      image_data: preview,
      submitted_at: new Date().toISOString(),
    };
    onSubmitted(sub);
    onClose();
  };

  const activeTimer = phase === "observe" ? observeTimer : writeTimer;
  const activeTotal = phase === "observe" ? OBSERVE_SECS : WRITE_SECS;
  const phaseLabel = phase === "observe" ? L.phase1 : phase === "write" ? L.phase2 : L.phaseUpload;

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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur-sm p-1.5 border hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Picture */}
        <div className="relative">
          <img
            src={picture.image_url}
            alt={picture.title}
            className="w-full h-64 sm:h-80 object-cover transition-all duration-700"
            style={phase === "write" ? { filter: "blur(8px)" } : {}}
          />
          {/* Number badge */}
          <span className="absolute top-3 left-3 flex items-center justify-center rounded px-2 py-1 bg-foreground text-background text-xs font-bold font-heading">
            #{pictureNumber}
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Phase label */}
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 px-4 py-2 text-sm font-medium text-blue-800 dark:text-blue-300 text-center border border-blue-100 dark:border-blue-900/40">
            {phaseLabel}
          </div>

          {/* Timer (observe/write) or Upload UI */}
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
                  <p className="text-sm text-muted-foreground text-center">{L.uploadPrompt}</p>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => { inputRef.current?.removeAttribute("capture"); inputRef.current?.click(); }}>{L.galleryBtn}</Button>
                    <Button size="sm" onClick={() => { inputRef.current?.setAttribute("capture", "environment"); inputRef.current?.click(); }}>{L.cameraBtn}</Button>
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

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {phase !== "upload" ? (
              <>
                <Button size="sm" disabled className="gap-1.5 cursor-default">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  {L.testInProgress}
                </Button>
                <Button size="sm" variant="destructive" onClick={handleReset} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> {L.reset}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { observeTimer.pause(); writeTimer.pause(); setPhase("upload"); }}>
                  <ImagePlus className="mr-1.5 h-3.5 w-3.5" /> {L.upload}
                </Button>
              </>
            ) : (
              <Button size="sm" disabled={!preview} onClick={handleSubmit}>
                {L.submit}
              </Button>
            )}
            <button
              onClick={() => setShowIdea((v) => !v)}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {showIdea ? L.hideIdea : L.showIdea}
            </button>
          </div>

          {/* Show Idea */}
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
                {L.viewDetails}
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

function PictureCard({
  picture,
  index,
  courseId,
  isLocked,
  isSubmitted,
  L,
  onStartTest,
  onUpload,
}: {
  picture: PictureStoryPicture;
  index: number;
  courseId: string;
  isLocked: boolean;
  isSubmitted: boolean;
  L: typeof BN;
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
      {/* Picture thumbnail */}
      <div className="relative">
        <img
          src={picture.image_url}
          alt={picture.title}
          className="w-full h-44 object-cover"
          style={isLocked ? { filter: "grayscale(1) brightness(0.7) blur(1px)" } : { filter: "blur(1.5px)" }}
        />
        <span className="absolute top-2 left-2 flex items-center justify-center rounded px-2 py-0.5 bg-foreground text-background text-xs font-bold font-heading">
          #{index + 1}
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
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { inputRef.current?.removeAttribute("capture"); inputRef.current?.click(); }}>{L.galleryBtn}</Button>
              <Button size="sm" className="flex-1" onClick={() => { inputRef.current?.setAttribute("capture", "environment"); inputRef.current?.click(); }}>{L.cameraBtn}</Button>
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
                {L.submit}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-2 px-3 py-3 mt-auto">
        <Button
          size="sm"
          disabled={isLocked || isSubmitted}
          onClick={onStartTest}
          className="gap-1.5"
        >
          {isSubmitted ? L.submitted : <><span>▶</span> {L.startTest}</>}
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

// ─── Normalized set shape ─────────────────────────────────────────────────────

interface NormalizedSet {
  id: string;
  title: string;
  is_free: boolean;
  pictures: PictureStoryPicture[];
}

// ─── Set Card ─────────────────────────────────────────────────────────────────

function SetCard({
  set,
  index,
  enrolled,
  courseId,
  L,
  onSelect,
}: {
  set: NormalizedSet;
  index: number;
  enrolled: boolean;
  courseId: string;
  L: typeof BN;
  onSelect: () => void;
}) {
  const canAccess = set.is_free || enrolled;
  const firstPic = set.pictures[0];

  return (
    <div className={["rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col", !canAccess ? "opacity-70" : ""].join(" ")}>
      <div className="relative">
        {firstPic ? (
          <img
            src={firstPic.image_url}
            alt={set.title}
            className="w-full h-44 object-cover"
            style={{ filter: "blur(1.5px)" }}
          />
        ) : (
          <div className="w-full h-44 bg-muted flex items-center justify-center">
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <span className="absolute top-2 left-2 flex items-center justify-center rounded px-2 py-0.5 bg-foreground text-background text-xs font-bold font-heading">
          {L.set} {index + 1}
        </span>
        <span className={["absolute top-2 right-2 rounded px-2 py-0.5 text-xs font-semibold", set.is_free ? "bg-green-500 text-white" : "bg-amber-500 text-white"].join(" ")}>
          {set.is_free ? L.free : L.premium}
        </span>
        {!canAccess && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-heading font-semibold text-foreground text-sm">{set.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{set.pictures.length}{L.pictures}</p>
        </div>
        <div className="mt-auto">
          {canAccess ? (
            <Button size="sm" className="w-full" onClick={onSelect}>
              {L.viewSet}
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link to={`/courses/${courseId}`}>
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> {L.buyNow}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Picture Set View ─────────────────────────────────────────────────────────

function PictureSetView({
  set,
  courseId,
  L,
  onBack,
}: {
  set: NormalizedSet;
  courseId: string;
  L: typeof BN;
  onBack: () => void;
}) {
  const sessionKey = `${courseId}:${set.id}`;
  const [activePicture, setActivePicture] = useState<PictureStoryPicture | null>(null);
  const [session, setSession] = useState<PictureStorySession>(() => {
    return loadSession(sessionKey) ?? {
      set_id: set.id,
      started_at: new Date().toISOString(),
      submissions: [],
      completed: false,
    };
  });

  const isSubmitted = (picNum: number) =>
    session.submissions.some((s) => s.picture_number === picNum);

  const handleSubmitted = (sub: PictureStorySubmission) => {
    const newSubs = [...session.submissions.filter((s) => s.picture_number !== sub.picture_number), sub];
    const updated: PictureStorySession = {
      ...session,
      submissions: newSubs,
      completed: newSubs.length >= set.pictures.length,
    };
    setSession(updated);
    saveSession(sessionKey, updated);
  };

  const handleCardUpload = (picNum: number, imageData: string) => {
    handleSubmitted({ picture_number: picNum, image_data: imageData, submitted_at: new Date().toISOString() });
  };

  return (
    <>
      {activePicture && (
        <PictureModal
          picture={activePicture}
          pictureNumber={activePicture.picture_number}
          courseId={courseId}
          L={L}
          onClose={() => setActivePicture(null)}
          onSubmitted={handleSubmitted}
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> {L.back}
        </Button>
        <h2 className="font-heading font-semibold text-foreground">{set.title}</h2>
        <span className="text-sm text-muted-foreground">· {set.pictures.length}{L.pictures}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {set.pictures.map((pic, idx) => {
          const submitted = isSubmitted(pic.picture_number);
          const locked = idx > 0 && !isSubmitted(set.pictures[idx - 1].picture_number);
          return (
            <PictureCard
              key={pic.id}
              picture={pic}
              index={idx}
              courseId={courseId}
              isLocked={locked}
              isSubmitted={submitted}
              L={L}
              onStartTest={() => setActivePicture(pic)}
              onUpload={(img) => handleCardUpload(pic.picture_number, img)}
            />
          );
        })}
      </div>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PictureStoryTest() {
  const { id: courseId = "issb1" } = useParams<{ id: string }>();
  const { data: course } = useCourse(courseId);
  const { data: dbSets = [] } = usePictureStorySets(course?.id);
  const { enrolled } = useIsEnrolled(courseId, course?.id);

  const [lang, setLang] = useState<Lang>("bn");
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const L = lang === "bn" ? BN : EN;

  const allSets: NormalizedSet[] = dbSets.length > 0
    ? dbSets.map((s) => ({
        id: s.id,
        title: s.title,
        is_free: s.is_free ?? false,
        pictures: (s.picture_story_pictures ?? []).map((p): PictureStoryPicture => ({
          id: p.id,
          picture_number: p.picture_number,
          image_url: p.image_url,
          title: p.title,
          description: p.idea,
          idea: p.idea,
        })),
      }))
    : [{
        id: PICTURE_STORY_MOCK_SET.id,
        title: PICTURE_STORY_MOCK_SET.name,
        is_free: true,
        pictures: PICTURE_STORY_MOCK_SET.pictures,
      }];

  const selectedSet = selectedSetId ? (allSets.find((s) => s.id === selectedSetId) ?? null) : null;

  return (
    <div className="container py-10 sm:py-14">
      {/* Title + language toggle */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{L.title}</h1>
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

      {/* Pictures view when a set is selected */}
      {selectedSet && (
        <PictureSetView
          set={selectedSet}
          courseId={courseId}
          L={L}
          onBack={() => setSelectedSetId(null)}
        />
      )}

      {/* Sets grid when no set is selected */}
      {!selectedSet && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allSets.map((set, idx) => (
            <SetCard
              key={set.id}
              set={set}
              index={idx}
              enrolled={enrolled}
              courseId={courseId}
              L={L}
              onSelect={() => setSelectedSetId(set.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
