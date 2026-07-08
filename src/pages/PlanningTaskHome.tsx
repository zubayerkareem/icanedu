import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, ImagePlus, Lightbulb, Lock, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlanningTaskSets } from "@/hooks/useISSBContent";
import { useIsEnrolled } from "@/hooks/useEnrollment";
import { useCourse } from "@/hooks/useCourse";
import { loadSubmission, saveSubmission } from "@/hooks/useStorySubmission";

// ─── Labels ───────────────────────────────────────────────────

const BN = {
  title: "Planning Exercise",
  upload: "Upload",
  seeMore: "See More",
  showIdea: "Show Idea",
  hideIdea: "Hide Idea",
  unlockPremium: "Unlock Premium",
  close: "বন্ধ করুন",
  uploadPrompt: "খাতায় লেখা পরিকল্পনার ছবি তুলে আপলোড করুন",
  cameraBtn: "ক্যামেরা",
  galleryBtn: "গ্যালারি",
  replaceBtn: "পরিবর্তন করুন",
  submit: "জমা দিন",
  submitted: "জমা দেওয়া হয়েছে",
  idea: "Idea",
  scenario: "Scenario",
};

// ─── Upload panel (reuses the same pattern as IncompleteStoryHome) ──────────

function UploadPanel({
  taskId,
  courseId,
  onDone,
}: {
  taskId: string;
  courseId: string;
  onDone: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(() => loadSubmission(courseId, taskId));
  const [busy, setBusy] = useState(false);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!preview) return;
    setBusy(true);
    try {
      saveSubmission(courseId, taskId, preview);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
      <p className="text-xs text-muted-foreground text-center">{BN.uploadPrompt}</p>
      {preview ? (
        <div className="space-y-2">
          <img src={preview} alt="submission" className="w-full rounded-md object-cover max-h-40" />
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <span className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                <ImagePlus className="h-3.5 w-3.5" /> {BN.replaceBtn}
              </span>
            </label>
            <Button size="sm" className="flex-1" onClick={submit} disabled={busy}>
              {BN.submit}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <label className="flex-1 cursor-pointer">
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <span className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
              📷 {BN.cameraBtn}
            </span>
          </label>
          <label className="flex-1 cursor-pointer">
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <span className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
              🖼️ {BN.galleryBtn}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

// ─── See More modal ───────────────────────────────────────────

function SeeMoreModal({
  heading,
  body,
  idea,
  imageUrl,
  onClose,
}: {
  heading: string;
  body: string;
  idea: string;
  imageUrl: string;
  onClose: () => void;
}) {
  const [showIdea, setShowIdea] = useState(false);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black" onClick={onClose}>
      {/* Close button — always visible */}
      <button
        onClick={onClose}
        className="fixed right-4 top-4 z-50 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
      >
        <X className="h-5 w-5" />
      </button>

      {/* ── SECTION 1: Full-screen image ── */}
      {imageUrl && (
        <div
          className="relative flex items-center justify-center bg-black"
          style={{ minHeight: "100dvh" }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={heading}
            className="w-full h-full object-contain"
            style={{ maxHeight: "100dvh" }}
          />

          {/* Bottom gradient overlay with title + scroll hint */}
          <div
            className="absolute bottom-0 left-0 right-0 px-6 pt-16 pb-6 flex flex-col items-center gap-2"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
          >
            <h2 className="font-heading text-xl font-bold text-white text-center drop-shadow">
              {heading}
            </h2>
            <div className="flex flex-col items-center gap-1 text-white/70 text-xs animate-bounce">
              <ChevronDown className="h-5 w-5" />
              <span>নিচে স্ক্রোল করুন</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 2: Text content ── */}
      <div
        className="relative bg-background rounded-t-3xl -mt-6 px-5 py-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {!imageUrl && (
          <h2 className="font-heading text-xl font-bold text-foreground">{heading}</h2>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">{BN.scenario}</p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{body}</p>
        </div>

        {idea && (
          <div>
            <button
              onClick={() => setShowIdea((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-amber-600 font-medium hover:text-amber-700 transition-colors"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {showIdea ? BN.hideIdea : BN.showIdea}
            </button>
            {showIdea && (
              <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
                {idea}
              </div>
            )}
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={onClose}>{BN.close}</Button>
      </div>
    </div>
  );
}

// ─── Task card ────────────────────────────────────────────────

function TaskCard({
  task,
  index,
  courseId,
  isLocked,
  isSubmitted,
}: {
  task: { id: string; heading: string; body: string; image_url: string; idea: string };
  index: number;
  courseId: string;
  isLocked: boolean;
  isSubmitted: boolean;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(isSubmitted);

  return (
    <>
      {showModal && (
        <SeeMoreModal
          heading={task.heading}
          body={task.body}
          idea={task.idea}
          imageUrl={task.image_url}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Image with number badge */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {task.image_url ? (
            <img
              src={task.image_url}
              alt={task.heading}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-md bg-[hsl(var(--sidebar-primary,142_76%_36%))] px-2 py-0.5 text-xs font-bold text-white shadow">
            #{index + 1}
          </span>
        </div>

        <div className="flex flex-col flex-1 p-4 gap-3">
          {/* Heading */}
          <h3 className="font-heading font-semibold text-foreground leading-snug">{task.heading}</h3>

          {/* Body preview (4-line clamp) */}
          <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">{task.body}</p>

          {/* Submitted indicator */}
          {submitted && (
            <div className="h-1.5 w-full rounded-full bg-success/20 overflow-hidden">
              <div className="h-full w-full rounded-full bg-success" />
            </div>
          )}

          {/* Upload panel */}
          {showUpload && !isLocked && (
            <UploadPanel
              taskId={task.id}
              courseId={courseId}
              onDone={() => { setSubmitted(true); setShowUpload(false); }}
            />
          )}

          {/* Buttons */}
          <div className="flex gap-2 mt-auto pt-1">
            <Button
              size="sm"
              variant="outline"
              disabled={isLocked}
              className="flex-1 gap-1.5"
              onClick={() => !isLocked && setShowUpload((v) => !v)}
            >
              <ImagePlus className="h-3.5 w-3.5" /> {BN.upload}
            </Button>
            <Button
              size="sm"
              disabled={isLocked}
              className="flex-1 bg-[hsl(var(--sidebar-primary,142_76%_36%))] hover:bg-[hsl(var(--sidebar-primary,142_76%_36%))]/90 text-white"
              onClick={() => !isLocked && setShowModal(true)}
            >
              {BN.seeMore}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function PlanningTaskHome() {
  const { id: courseId = "" } = useParams<{ id: string }>();

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: dbSets = [], isLoading: setsLoading } = usePlanningTaskSets(course?.id);
  const { enrolled } = useIsEnrolled(courseId, course?.id);

  const isLoading = courseLoading || setsLoading;

  const tasks = dbSets.flatMap((set) =>
    (set.planning_tasks ?? []).map((t) => ({
      ...t,
      is_free: set.is_free ?? false,
    }))
  );

  return (
    <div className="container py-10 sm:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Planning Exercise</h1>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm animate-pulse">
              <div className="w-full h-40 bg-muted/40" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted/40 rounded w-3/4" />
                <div className="h-3 bg-muted/40 rounded" />
                <div className="h-3 bg-muted/40 rounded w-5/6" />
                <div className="flex gap-2 mt-2">
                  <div className="h-8 bg-muted/40 rounded flex-1" />
                  <div className="h-8 bg-muted/40 rounded flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">কোনো প্ল্যানিং টাস্ক পাওয়া যায়নি।</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task, idx) => {
            const canAccess = task.is_free || enrolled;
            const isSubmitted = canAccess ? !!loadSubmission(courseId, task.id) : false;

            return (
              <div key={task.id} className="relative">
                {!canAccess && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/80 backdrop-blur-sm">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <Button size="sm" variant="outline" className="border-amber-400 text-amber-600 hover:bg-amber-50" asChild>
                      <Link to={`/courses/${courseId}`}>
                        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> {BN.unlockPremium}
                      </Link>
                    </Button>
                  </div>
                )}
                <TaskCard
                  task={task}
                  index={idx}
                  courseId={courseId}
                  isLocked={!canAccess}
                  isSubmitted={isSubmitted}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
