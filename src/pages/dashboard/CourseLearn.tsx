import { useState, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, BookOpen, ClipboardList,
  FileText, HelpCircle, Lock, PlayCircle,
  Brain, Download, CheckCircle2, Menu, X, ListVideo,
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
import { BunnyVideoPlayer } from "@/components/BunnyVideoPlayer";
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
  lesson, module: mod, courseId, active, onSelect,
}: {
  lesson: Lesson;
  module: Module;
  courseId: string;
  active: boolean;
  onSelect?: () => void;
}) {
  const Icon = LESSON_ICON[lesson.type] ?? PlayCircle;
  const free = isLessonFree(mod, lesson);

  return (
    <li>
      <Link
        to={`/dashboard/courses/${courseId}?lesson=${lesson.id}`}
        onClick={onSelect}
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
  module, index, courseId, activeLessonId, onLessonSelect,
}: {
  module: Module; index: number; courseId: string; activeLessonId: string | null;
  onLessonSelect?: () => void;
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
                  onClick={onLessonSelect}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left hover:bg-muted/60 transition-colors"
                >
                  <Brain className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="flex-1 text-xs text-foreground line-clamp-2 leading-snug">{el.label}</span>
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
                onSelect={onLessonSelect}
              />
            ))}
          </ul>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

// ─── Curriculum Panel (shared between sidebar and drawer) ─────────────────────

function CurriculumPanel({
  course, activeLessonId, onLessonSelect,
}: {
  course: Course; activeLessonId: string | null; onLessonSelect?: () => void;
}) {
  const modules = course.modules ?? [];
  const courseId = course.id;

  const defaultOpen = modules
    .filter((m) => m.type !== "issb" && m.lessons.some((l) => l.id === activeLessonId))
    .map((m) => m.id);
  const openModules = defaultOpen.length > 0 ? defaultOpen : modules[0] ? [modules[0].id] : [];

  return (
    <>
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
                  onLessonSelect={onLessonSelect}
                />
              ))}
            </Accordion>
          )}
        </div>
      </ScrollArea>
    </>
  );
}

// ─── Curriculum Sidebar (desktop static) ──────────────────────────────────────

function CurriculumSidebar({ course, activeLessonId }: { course: Course; activeLessonId: string | null }) {
  return (
    <aside className="hidden md:flex w-[280px] shrink-0 flex-col border-r border-border bg-card overflow-hidden">
      <CurriculumPanel course={course} activeLessonId={activeLessonId} />
    </aside>
  );
}

// ─── Curriculum Drawer (mobile slide-in) ──────────────────────────────────────

function CurriculumDrawer({
  course, activeLessonId, isOpen, onClose,
}: {
  course: Course; activeLessonId: string | null; isOpen: boolean; onClose: () => void;
}) {
  return (
    <div className="md:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* Drawer panel — slides in from left */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[300px] flex-col bg-card shadow-2xl",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Drawer close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <CurriculumPanel
          course={course}
          activeLessonId={activeLessonId}
          onLessonSelect={onClose}
        />
      </aside>
    </div>
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
  course, activeLessonId, enrolled, onOpenDrawer,
}: {
  course: Course; activeLessonId: string | null; enrolled: boolean; onOpenDrawer: () => void;
}) {
  const { user } = useAuth();
  const modules = course.modules ?? [];
  const issbModule = modules.find((m) => m.type === "issb");
  const issbElements = issbModule ? ISSB_ELEMENT_DEFS.filter((el) => issbModule.issb?.[el.key]) : [];

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

  // ── Top bar (shared between lesson view and welcome screen) ──
  const TopBar = ({ children }: { children: React.ReactNode }) => (
    <div className="border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
      {/* Mobile: drawer trigger */}
      <button
        onClick={onOpenDrawer}
        className="md:hidden flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
        aria-label="কারিকুলাম খুলুন"
      >
        <Menu className="h-5 w-5" />
      </button>
      {children}
    </div>
  );

  // ── Lesson view ──
  if (lesson) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar>
          <BookOpen className="h-4 w-4 text-accent shrink-0" />
          <span className="font-heading text-sm font-semibold text-foreground line-clamp-1 flex-1">{lesson.title}</span>
          {free && (
            <Badge className="ml-auto shrink-0 bg-success/10 text-success border-success/30 gap-1 text-[10px]">
              <CheckCircle2 className="h-3 w-3" /> ফ্রি
            </Badge>
          )}
        </TopBar>

        <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 max-w-4xl w-full">
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
            lesson.bunny_video_id ? (
              <BunnyVideoPlayer
                videoId={lesson.bunny_video_id}
                courseId={course.id}
                courseSlug={course.slug}
              />
            ) : (
              <VideoPlayer url={lesson.video_url} />
            )
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

  // ── Welcome screen ──
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar>
        <BookOpen className="h-4 w-4 text-accent shrink-0" />
        <span className="font-heading text-sm font-semibold text-foreground line-clamp-1 flex-1">{course.title}</span>
        {issbModule && <Badge variant="secondary" className="ml-auto shrink-0">ISSB</Badge>}
      </TopBar>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <PlayCircle className="h-9 w-9 text-accent" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">শুরু করতে একটি লেসন বেছে নিন</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground hidden md:block">
            বাম পাশের কারিকুলাম থেকে যেকোনো লেসনে ক্লিক করুন।
          </p>
        </div>

        {/* Mobile CTA — opens the curriculum drawer */}
        <Button onClick={onOpenDrawer} className="md:hidden gap-2">
          <ListVideo className="h-4 w-4" />
          কারিকুলাম দেখুন
        </Button>

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
                  <span className="text-sm font-semibold text-center px-2 leading-snug">{el.label}</span>
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
    <div className="flex h-screen">
      <div className="hidden md:block w-[280px] shrink-0 border-r border-border bg-card p-4 space-y-3">
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer  = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

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
    <div className="flex h-screen overflow-hidden">
      {/* Desktop: static sidebar */}
      <CurriculumSidebar course={course} activeLessonId={activeLessonId} />

      {/* Mobile: slide-in drawer */}
      <CurriculumDrawer
        course={course}
        activeLessonId={activeLessonId}
        isOpen={drawerOpen}
        onClose={closeDrawer}
      />

      {/* Main content — always full width on mobile */}
      <LearnContent
        course={course}
        activeLessonId={activeLessonId}
        enrolled={enrolled}
        onOpenDrawer={openDrawer}
      />
    </div>
  );
}
