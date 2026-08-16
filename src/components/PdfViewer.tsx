// Shared PDF lesson viewer — used by LessonView (standalone lesson page) and
// CourseLearn (in-page dashboard learn view). Download is opt-in per lesson
// via `allowDownload` (Lesson.allow_download); when off, the inline viewer's
// own toolbar is hidden and no download link is rendered.
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PdfViewer({ url, allowDownload }: { url?: string; allowDownload?: boolean }) {
  if (!url) {
    return <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">PDF পাওয়া যায়নি</div>;
  }
  const src = allowDownload ? url : `${url}#toolbar=0&navpanes=0&scrollbar=1`;
  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted sm:aspect-video">
        <iframe src={src} className="h-full w-full" title="lesson pdf" />
      </div>
      {allowDownload && (
        <Button asChild variant="outline" size="sm">
          <a href={url} target="_blank" rel="noreferrer"><Download className="mr-2 h-4 w-4" /> ডাউনলোড করুন</a>
        </Button>
      )}
    </div>
  );
}
