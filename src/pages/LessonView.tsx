import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Lock, PlayCircle, FileText, HelpCircle, ClipboardList,
  Download, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RichContent } from "@/components/RichEditor";
import { useCourse } from "@/hooks/useCourse";
import { useIsEnrolled } from "@/hooks/useEnrollment";
import { useAuth } from "@/hooks/useAuth";
import { SecureVideoPlayer } from "@/components/SecureVideoPlayer";
import { isLessonFree, type Lesson, type Module } from "@/lib/courses/types";

const TYPE_ICON = {
  video: PlayCircle,
  pdf: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
  text: FileText,
} as const;

export default function LessonView() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
  const { data: course, isLoading } = useCourse(id);
  const { user } = useAuth();
  const { enrolled } = useIsEnrolled(course?.id, course?.slug);

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-10">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-4 aspect-video w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">কোর্স পাওয়া যায়নি</h1>
        <Button asChild className="mt-6"><Link to="/courses">সব কোর্স</Link></Button>
      </div>
    );
  }

  const courseHref = `/courses/${course.slug ?? course.id}`;
  const modules = course.modules ?? [];
  let current: Lesson | undefined;
  let currentModule: Module | undefined;
  for (const m of modules) {
    const found = m.lessons.find((l) => l.id === lessonId);
    if (found) { current = found; currentModule = m; break; }
  }

  if (!current || !currentModule) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">লেসন পাওয়া যায়নি</h1>
        <Button asChild className="mt-6"><Link to={courseHref}>কোর্সে ফিরে যান</Link></Button>
      </div>
    );
  }

  const free = isLessonFree(currentModule, current);
  const canView = free || enrolled;

  return (
    <div className="container max-w-6xl py-6 sm:py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to={courseHref}><ArrowLeft className="mr-1 h-4 w-4" /> {course.title}</Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main */}
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">{current.title}</h1>
          {free && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              <CheckCircle2 className="h-3 w-3" /> ফ্রি লেসন
            </span>
          )}

          <div className="mt-4">
            {!canView ? (
              <LockedCard loggedIn={!!user} courseHref={courseHref} />
            ) : current.type === "video" ? (
              <VideoPlayer url={current.video_url} />
            ) : current.type === "pdf" ? (
              <PdfViewer url={current.pdf_url} />
            ) : (
              <article className="rounded-xl border border-border bg-card p-6">
                {current.content ? (
                  <RichContent html={current.content} className="text-sm leading-relaxed text-foreground" />
                ) : (
                  <p className="text-sm text-muted-foreground">এই লেসনের কন্টেন্ট শীঘ্রই যোগ করা হবে।</p>
                )}
              </article>
            )}
          </div>
        </div>

        {/* Curriculum sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3 font-heading text-sm font-semibold text-foreground">
              কোর্স কন্টেন্ট
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {modules.map((m) => (
                <div key={m.id} className="mb-2">
                  <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">{m.title}</p>
                  <ul>
                    {m.lessons.map((l) => {
                      const Icon = TYPE_ICON[l.type] ?? FileText;
                      const lFree = isLessonFree(m, l);
                      const active = l.id === lessonId;
                      return (
                        <li key={l.id}>
                          <Link
                            to={`/courses/${course.slug ?? course.id}/lessons/${l.id}`}
                            className={[
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                              active ? "bg-accent/10 text-accent" : "text-foreground hover:bg-muted",
                            ].join(" ")}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="line-clamp-1 flex-1">{l.title}</span>
                            {lFree ? (
                              <span className="text-[10px] font-medium text-success">ফ্রি</span>
                            ) : (
                              <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function VideoPlayer({ url }: { url?: string }) {
  return <SecureVideoPlayer url={url} />;
}

function PdfViewer({ url }: { url?: string }) {
  if (!url) {
    return <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">PDF পাওয়া যায়নি</div>;
  }
  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted sm:aspect-video">
        <iframe src={url} className="h-full w-full" title="lesson pdf" />
      </div>
      <Button asChild variant="outline" size="sm">
        <a href={url} target="_blank" rel="noreferrer"><Download className="mr-2 h-4 w-4" /> ডাউনলোড করুন</a>
      </Button>
    </div>
  );
}

function LockedCard({ loggedIn, courseHref }: { loggedIn: boolean; courseHref: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <h2 className="font-heading text-lg font-bold text-foreground">এই লেসনটি লক করা</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          সম্পূর্ণ কোর্সটিতে অ্যাক্সেস পেতে এনরোল করুন।
        </p>
      </div>
      <div className="flex gap-2">
        {!loggedIn && (
          <Button asChild variant="outline">
            <Link to={`/login?redirect=${encodeURIComponent(courseHref)}`}>লগইন করুন</Link>
          </Button>
        )}
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link to={courseHref}>কোর্স দেখুন</Link>
        </Button>
      </div>
    </div>
  );
}
