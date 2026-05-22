import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  ImagePlus,
  PenLine,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { INCOMPLETE_STORIES } from "@/lib/incomplete-story/mock";
import {
  clearSubmission,
  loadSubmission,
  saveSubmission,
} from "@/hooks/useStorySubmission";
import { toast } from "sonner";

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({
  onFile,
  uploading,
}: {
  onFile: (file: File) => void;
  uploading: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex flex-col items-center gap-5 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-accent/50 hover:bg-accent/5"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <ImagePlus className="h-8 w-8 text-accent" />
      </div>

      <div>
        <p className="font-heading text-base font-semibold text-foreground">
          খাতার ছবি আপলোড করুন
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          ড্র্যাগ করুন অথবা নিচের বাটন চাপুন
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {/* Camera capture — works on mobile */}
        <Button
          type="button"
          variant="default"
          disabled={uploading}
          onClick={() => cameraRef.current?.click()}
        >
          <Camera className="mr-2 h-4 w-4" />
          ক্যামেরা দিয়ে তুলুন
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          গ্যালারি থেকে বেছে নিন
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP সমর্থিত · সর্বোচ্চ ৫ MB</p>

      {/* Hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

// ─── Submission preview ───────────────────────────────────────────────────────

function SubmissionPreview({
  imageBase64,
  submittedAt,
  onReplace,
  onDelete,
}: {
  imageBase64: string;
  submittedAt: string;
  onReplace: () => void;
  onDelete: () => void;
}) {
  const date = new Date(submittedAt).toLocaleString("bn-BD", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="overflow-hidden rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
      <div className="flex items-center justify-between gap-3 border-b border-green-200 px-4 py-3 dark:border-green-800">
        <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          জমা দেওয়া হয়েছে · {date}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onReplace}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> পরিবর্তন করুন
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> মুছুন
          </Button>
        </div>
      </div>
      <div className="p-4">
        <img
          src={imageBase64}
          alt="জমা দেওয়া উত্তর"
          className="mx-auto max-h-[600px] w-full rounded-lg object-contain shadow-sm"
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function IncompleteStoryDetail() {
  const { id: courseId = "", storyId = "" } = useParams<{ id: string; storyId: string }>();

  const story = INCOMPLETE_STORIES.find((s) => s.id === storyId);
  const [submission, setSubmission] = useState(() => loadSubmission(courseId, storyId));
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);

  if (!story) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">গল্পটি পাওয়া যায়নি</h1>
        <Button asChild variant="outline">
          <Link to={`/courses/${courseId}/incomplete-story`}>ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("শুধুমাত্র ছবি ফাইল আপলোড করা যাবে।");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ছবির সাইজ ৫ MB-এর বেশি হওয়া যাবে না।");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const base64 = reader.result as string;
        const saved = saveSubmission(courseId, storyId, base64);
        setSubmission(saved);
        setReplacing(false);
        toast.success("ছবি সফলভাবে সংরক্ষিত হয়েছে।");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "ছবি সংরক্ষণ করা যায়নি।";
        toast.error(msg);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      toast.error("ছবি পড়তে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    clearSubmission(courseId, storyId);
    setSubmission(null);
    toast.success("ছবি মুছে ফেলা হয়েছে।");
  };

  const showUpload = !submission || replacing;

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-3 py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/courses/${courseId}/incomplete-story`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="font-heading text-sm font-semibold text-foreground">{story.title}</p>
            <p className="text-xs text-muted-foreground">Incomplete Story</p>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl py-8">

        {/* Instruction banner */}
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-accent/5 p-4">
          <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div className="text-sm text-foreground">
            <p className="font-semibold">নির্দেশনা</p>
            <p className="mt-0.5 text-muted-foreground">{story.instruction}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> আনুমানিক সময়: {story.timeGuide}</span>
              <span className="flex items-center gap-1"><PenLine className="h-3.5 w-3.5" /> শব্দসীমা: {story.wordLimit}</span>
            </div>
          </div>
        </div>

        {/* Story body */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-heading text-lg font-bold text-foreground">{story.title}</h2>
          <div className="space-y-4 text-sm leading-relaxed text-foreground">
            {story.body.split("\n\n").map((para, i) => (
              <p key={i} className={para.trim().endsWith("...") ? "italic text-muted-foreground" : ""}>
                {para.trim()}
              </p>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-4">
            <PenLine className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm italic text-muted-foreground">
              এখান থেকে আপনার খাতায় গল্পটি সম্পূর্ণ করুন...
            </p>
          </div>
        </div>

        {/* Upload / Preview */}
        <div className="space-y-4">
          <h3 className="font-heading text-base font-semibold text-foreground">
            আপনার লেখার ছবি আপলোড করুন
          </h3>

          {submission && !replacing ? (
            <SubmissionPreview
              imageBase64={submission.imageBase64}
              submittedAt={submission.submittedAt}
              onReplace={() => setReplacing(true)}
              onDelete={handleDelete}
            />
          ) : (
            <>
              <UploadZone onFile={handleFile} uploading={uploading} />
              {replacing && (
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setReplacing(false)}>
                  বাতিল করুন
                </Button>
              )}
            </>
          )}
        </div>

        {/* Nav */}
        <div className="mt-8 flex justify-between">
          <Button variant="outline" asChild>
            <Link to={`/courses/${courseId}/incomplete-story`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> সব গল্প দেখুন
            </Link>
          </Button>
          {submission && !replacing && (
            <Button asChild>
              <Link to={`/courses/${courseId}/incomplete-story`}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> সম্পন্ন
              </Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
