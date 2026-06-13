import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ImagePlus, Lightbulb, Lock, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroupDiscussionSets } from "@/hooks/useISSBContent";
import { useIsEnrolled } from "@/hooks/useEnrollment";
import { useCourse } from "@/hooks/useCourse";
import { loadSubmission, saveSubmission } from "@/hooks/useStorySubmission";

// ─── Labels ───────────────────────────────────────────────────

const BN = {
  title: "Group Discussion",
  upload: "Upload",
  seeMore: "See More",
  showIdea: "Show Idea",
  hideIdea: "Hide Idea",
  unlockPremium: "Unlock Premium",
  close: "বন্ধ করুন",
  uploadPrompt: "খাতায় লেখা নোটের ছবি তুলে আপলোড করুন",
  cameraBtn: "ক্যামেরা",
  galleryBtn: "গ্যালারি",
  replaceBtn: "পরিবর্তন করুন",
  submit: "জমা দিন",
  idea: "Idea",
  description: "Description",
};

// ─── Upload panel ─────────────────────────────────────────────

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-muted p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {imageUrl && (
          <img src={imageUrl} alt={heading} className="w-full rounded-t-2xl object-contain max-h-56 bg-muted" />
        )}

        <div className="p-5 space-y-4">
          <h2 className="font-heading text-xl font-bold text-foreground">{heading}</h2>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">{BN.description}</p>
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
        <div className="relative">
          {task.image_url ? (
            <img
              src={task.image_url}
              alt={task.heading}
              className="w-full object-contain bg-muted"
              style={{ maxHeight: "180px" }}
            />
          ) : (
            <div className="w-full h-36 bg-muted flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          <span className="absolute left-2 top-2 rounded-md bg-[hsl(var(--sidebar-primary,142_76%_36%))] px-2 py-0.5 text-xs font-bold text-white shadow">
            #{index + 1}
          </span>
        </div>

        <div className="flex flex-col flex-1 p-4 gap-3">
          <h3 className="font-heading font-semibold text-foreground leading-snug">{task.heading}</h3>
          <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">{task.body}</p>

          {submitted && (
            <div className="h-1.5 w-full rounded-full bg-success/20 overflow-hidden">
              <div className="h-full w-full rounded-full bg-success" />
            </div>
          )}

          {showUpload && !isLocked && (
            <UploadPanel
              taskId={task.id}
              courseId={courseId}
              onDone={() => { setSubmitted(true); setShowUpload(false); }}
            />
          )}

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

export default function GroupDiscussionHome() {
  const { id: courseId = "" } = useParams<{ id: string }>();

  const { data: course } = useCourse(courseId);
  const { data: dbSets = [] } = useGroupDiscussionSets(course?.id);
  const { enrolled } = useIsEnrolled(courseId, course?.id);

  const tasks = dbSets.flatMap((set) =>
    (set.group_discussion_tasks ?? []).map((t) => ({
      ...t,
      is_free: set.is_free ?? false,
    }))
  );

  return (
    <div className="container py-10 sm:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Group Discussion</h1>
      </div>

      {tasks.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">কোনো টপিক পাওয়া যায়নি।</p>
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
