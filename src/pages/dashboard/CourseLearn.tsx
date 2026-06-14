import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, BookOpen, ClipboardList,
  FileText, HelpCircle, Lock, PlayCircle,
  Brain, Download, CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { RichContent } from "@/components/RichEditor";
import { useCourse } from "@/hooks/useCourse";
import { useIsEnrolled } from "@/hooks/useEnrollment";
import { useAuth } from "@/hooks/useAuth";
import { getEmbedUrl } from "@/lib/video";
import { isLessonFree } from "@/lib/courses/types";
import type { Course, LessonType, Lesson, Module } from "@/lib/courses/types";
import { ISSB_ELEMENT_DEFS } from "@/lib/courses/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const LESSON_ICON: Record<LessonType, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
  text: FileText,
};

// ─── Lesson Row ───────────────────────────────────────────────────────────────

function LessonRow({
  lesson, module: mod, courseId, active,
}: {
  lesson: Lesson;
  module: Module;
  courseId: string;
  active: boolean;
}) {
  const Icon = LESSON_ICON[lesson.type] ?? PlayCircle;
  const free = isLessonFree(mod, lesson);

  return (
    <li>
      <Link
        to={`/dashboard/courses/${courseId}?lesson=${lesson.id}`}
        className={[
          "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition-colors",
          active
            ? "bg-accent/15 text-accent font-medium"
            : "hover:bg-muted/60 text-foreground",
        ].join(" ")}
      >
        <Icon className={["h-3.5 w-3.5 shrink-0", active ? "text-accent" : "text-muted-foreground"].join(" ")} />
        <span className="flex-1 text-xs line-clamp-2 leading-snug">{lesson.title}</span>
        {lesson.duration && lesson.duration !== "—" && (
          <span className="text-[10px] text-muted-foreground shrink-0">{lesson.duration}</span>
        )}
        {free
          ? <span className="text-[9px] font-medium text-success shrink-0">ফ্রি</span>
          : <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        }
      </Link>
    </li>
  );
}

// ─── Module Accordion Item ────────────────────────────────────────────────────

function ModuleAccordionItem({
  module, index, courseId, activeLessonId,
}: {
  module: Module; index: number; courseId: string; activeLessonId: string | null;
}) {
  const isISSB = module.type === "issb";
  const enabledElements = isISSB
    ? ISSB_ELEMENT_DEFS.filter((el) => module.issb?.[el.key])
    : [];

  return (
    <AccordionItem value={module.id} className="border-b border-border/60 last:border-b-0">
      <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-muted/50 rounded-md [&>svg]:shrink-0">
        <div className="flex items-center gap-3 text-left w-full mr-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-xs font-bold text-accent font-heading">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
              {module.title}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {isISSB
                ? `${enabledElements.length}টি প্র্যাকটিস`
                : `${module.lessons.length}টি লেসন${module.total_duration ? ` • ${module.total_duration}` : ""}`}
            </p>
          </div>
          {isISSB && (
            <span className="shrink-0 rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-medium text-accent">ISSB</span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-1 px-0">
        {isISSB ? (
          <ul>
            {enabledElements.map((el) => (
              <li key={el.key}>
                <Link
                  to={`/courses/${courseId}/${el.path}`}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left hover:bg-muted/60 transition-colors"
                >
                  <Brain className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="flex-1 text-xs text-foreground line-clamp-2 leading-snug">{el.labelBn}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : module.lessons.length === 0 ? (
          <p className="px-4 py-2 text-xs text-muted-foreground">কোনো লেসন নেই।</p>
        ) : (
          <ul>
            {module.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                module={module}
                courseId={courseId}
                active={lesson.id === activeLessonId}
              />
            ))}
          </ul>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

// ─── Curriculum Sidebar ───────────────────────────────────────────────────────

function CurriculumSidebar({
  course, activeLessonId,
}: {
  course: Course; activeLessonId: string | null;
}) {
  const modules = course.modules ?? [];
  const courseId = course.id;

  // open module that contains the active lesson by default
  const defaultOpen = modules
    .filter((m) => m.type !== "issb" && m.lessons.some((l) => l.id === activeLessonId))
    .map((m) => m.id);
  const openModules = defaultOpen.length > 0 ? defaultOpen : modules[0] ? [modules[0].id] : [];

  return (
    <aside className="w-full md:w-[280px] shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-border bg-card overflow-hidden">
      <div className="border-b border-border px-4 py-3 space-y-1">
        <Link
          to="/dashboard/courses"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          আমার কোর্স
        </Link>
        <h2 className="font-heading text-sm font-bold text-foreground line-clamp-2">
          {course.title}
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {modules.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-4">কোনো মডিউল পাওয়া যায়নি।</p>
          ) : (
            <Accordion type="multiple" defaultValue={openModules}>
              {modules.map((mod, i) => (
                <ModuleAccordionItem
                  key={mod.id}
                  module={mod}
                  index={i}
                  courseId={courseId}
                  activeLessonId={activeLessonId}
                />
              ))}
            </Accordion>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

// ─── Lesson content viewers ───────────────────────────────────────────────────

function VideoPlayer({ url }: { url?: string }) {
  const embed = url ? getEmbedUrl(url) : null;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
      {embed ? (
        <iframe
          key={embed}
          src={embed}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="lesson video"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-white/60">ভিডিও URL অবৈধ</div>
      )}
    </div>
  );
}

function PdfViewer({ url }: { url?: string }) {
  if (!url) return <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">PDF পাওয়া যায়নি</div>;
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

// ─── Main content area ────────────────────────────────────────────────────────

function LearnContent({
  course, activeLessonId, enrolled,
}: {
  course: Course; activeLessonId: string | null; enrolled: boolean;
}) {
  const { user } = useAuth();
  const modules = course.modules ?? [];
  const issbModule = modules.find((m) => m.type === "issb");
  const issbElements = issbModule ? ISSB_ELEMENT_DEFS.filter((el) => issbModule.issb?.[el.key]) : [];

  // Find the selected lesson
  let lesson: Lesson | undefined;
  let lessonModule: Module | undefined;
  if (activeLessonId) {
    for (const m of modules) {
      const found = m.lessons?.find((l) => l.id === activeLessonId);
      if (found) { lesson = found; lessonModule = m; break; }
    }
  }

  const free = lesson && lessonModule ? isLessonFree(lessonModule, lesson) : false;
  const canView = free || enrolled;

  // ── Lesson view ──
  if (lesson) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="border-b border-border px-5 py-3 flex items-center gap-3">
          <BookOpen className="h-4 w-4 text-accent shrink-0" />
          <span className="font-heading text-sm font-semibold text-foreground line-clamp-1">{lesson.title}</span>
          {free && (
            <Badge className="ml-auto shrink-0 bg-success/10 text-success border-success/30 gap-1 text-[10px]">
              <CheckCircle2 className="h-3 w-3" /> ফ্রি লেসন
            </Badge>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 max-w-4xl">
          {!canView ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">এই লেসনটি লক করা</h2>
                <p className="mt-1 text-sm text-muted-foreground">কোর্সটি কিনুন সম্পূর্ণ অ্যাক্সেস পেতে।</p>
              </div>
              <div className="flex gap-2">
                {!user && (
                  <Button asChild variant="outline">
                    <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}>লগইন করুন</Link>
                  </Button>
                )}
                <Button asChild>
                  <Link to={`/courses/${course.slug ?? course.id}`}>কোর্স দেখুন</Link>
                </Button>
              </div>
            </div>
          ) : lesson.type === "video" ? (
            <VideoPlayer url={lesson.video_url} />
          ) : lesson.type === "pdf" ? (
            <PdfViewer url={lesson.pdf_url} />
          ) : (
            <article className="rounded-xl border border-border bg-card p-6">
              {lesson.content ? (
                <RichContent html={lesson.content} className="text-sm leading-relaxed text-foreground" />
              ) : (
                <p className="text-sm text-muted-foreground">এই লেসনের কন্টেন্ট শীঘ্রই যোগ করা হবে।</p>
              )}
            </article>
          )}
        </div>
      </div>
    );
  }

  // ── Welcome screen (no lesson selected yet) ──
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="border-b border-border px-6 py-3 flex items-center gap-3">
        <BookOpen className="h-4 w-4 text-accent shrink-0" />
        <span className="font-heading text-sm font-semibold text-foreground line-clamp-1">{course.title}</span>
        {issbModule && <Badge variant="secondary" className="ml-auto shrink-0">ISSB</Badge>}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <PlayCircle className="h-9 w-9 text-accent" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">শুরু করতে একটি লেসন বেছে নিন</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            বাম পাশের কারিকুলাম থেকে যেকোনো লেসনে ক্লিক করুন।
          </p>
        </div>

        {issbElements.length > 0 && (
          <div className="w-full max-w-2xl space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              ISSB প্র্যাকটিস — এখনই শুরু করুন
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {issbElements.map((el) => (
                <Link
                  key={el.path}
                  to={`/courses/${course.id}/${el.path}`}
                  className="aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl
                             border-2 border-border bg-muted/40 text-foreground
                             hover:bg-accent/10 hover:border-accent/50 hover:shadow-md
                             transition-all duration-200"
                >
                  <Brain className="h-10 w-10 text-accent" />
                  <span className="text-sm font-semibold text-center px-2 leading-snug">{el.labelBn}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CourseLearnSkeleton() {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-[280px] shrink-0 border-b md:border-b-0 md:border-r border-border bg-card p-4 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-md bg-muted/60" />
        ))}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseLearn() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const activeLessonId = searchParams.get("lesson");

  const { data: course, isLoading } = useCourse(id);
  const { enrolled } = useIsEnrolled(course?.id, course?.slug);

  if (isLoading) return <CourseLearnSkeleton />;

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <h2 className="font-heading text-2xl font-bold text-foreground">কোর্সটি পাওয়া যায়নি</h2>
        <p className="text-sm text-muted-foreground">এই কোর্সটি আর উপলব্ধ নেই।</p>
        <Button asChild variant="outline">
          <Link to="/dashboard/courses">← আমার কোর্সে ফিরুন</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <CurriculumSidebar course={course} activeLessonId={activeLessonId} />
      <LearnContent course={course} activeLessonId={activeLessonId} enrolled={enrolled} />
    </div>
  );
}
