import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, BookOpen, ClipboardList, Construction,
  FileText, HelpCircle, Lock, PlayCircle,
  Brain, PenLine, FileEdit, MessageSquare,
  Image, Layers, FileQuestion,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useCourse } from "@/hooks/useCourse";
import { ComingSoon } from "@/components/ComingSoon";
import type { Course, LessonType, Lesson, Module } from "@/lib/courses/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const LESSON_ICON: Record<LessonType, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
};

const ISSB_MODULES = [
  { label: "IQ Practice",      icon: Brain,         path: "iq-practice" },
  { label: "WAT Practice",     icon: PenLine,       path: "wat" },
  { label: "IST Practice",     icon: FileEdit,      path: "ist" },
  { label: "Extempore Essay",  icon: MessageSquare, path: "extempore" },
  { label: "Picture Story",    icon: Image,         path: "picture-story" },
  { label: "Incomplete Story", icon: Layers,        path: "incomplete-story" },
  { label: "PPDT Practice",    icon: FileQuestion,  path: "ppdt" },
];

// ─── Lesson Row ───────────────────────────────────────────────────────────────

function LessonRow({ lesson }: { lesson: Lesson }) {
  const Icon = LESSON_ICON[lesson.type] ?? PlayCircle;
  return (
    <li>
      <button
        onClick={() =>
          toast.info("শীঘ্রই আসছে", { description: "এই লেসনটি শীঘ্রই চালু হবে।" })
        }
        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left
                   hover:bg-muted/60 transition-colors cursor-pointer"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-xs text-foreground line-clamp-2 leading-snug">
          {lesson.title}
        </span>
        {lesson.duration && lesson.duration !== "—" && (
          <span className="text-[10px] text-muted-foreground shrink-0">{lesson.duration}</span>
        )}
        <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
      </button>
    </li>
  );
}

// ─── Module Accordion Item ────────────────────────────────────────────────────

function ModuleAccordionItem({ module, index }: { module: Module; index: number }) {
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
              {module.lessons.length}টি লেসন
              {module.total_duration ? ` • ${module.total_duration}` : ""}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-1 px-0">
        {module.lessons.length === 0 ? (
          <p className="px-4 py-2 text-xs text-muted-foreground">কোনো লেসন নেই।</p>
        ) : (
          <ul>
            {module.lessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} />
            ))}
          </ul>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

// ─── Curriculum Sidebar ───────────────────────────────────────────────────────

function CurriculumSidebar({ course }: { course: Course }) {
  const modules = course.modules ?? [];

  return (
    <aside className="w-full md:w-[280px] shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-border bg-card overflow-hidden">
      {/* Header */}
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

      {/* Modules */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {modules.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-4">
              কোনো মডিউল পাওয়া যায়নি।
            </p>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={modules[0] ? [modules[0].id] : []}
            >
              {modules.map((mod, i) => (
                <ModuleAccordionItem key={mod.id} module={mod} index={i} />
              ))}
            </Accordion>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

// ─── Learn Content ────────────────────────────────────────────────────────────

function LearnContent({ course }: { course: Course }) {
  const courseId = course.id;
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Top bar */}
      <div className="border-b border-border px-6 py-3 flex items-center gap-3">
        <BookOpen className="h-4 w-4 text-accent shrink-0" />
        <span className="font-heading text-sm font-semibold text-foreground line-clamp-1">
          {course.title}
        </span>
        <Badge variant="secondary" className="ml-auto shrink-0">ISSB</Badge>
      </div>

      {/* Welcome / Coming Soon body */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <Construction className="h-9 w-9 text-accent" />
        </div>

        <div>
          <Badge className="mb-3 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
            শীঘ্রই আসছে
          </Badge>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            কোর্স কন্টেন্ট প্রস্তুত হচ্ছে
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {course.title} কোর্সের ভিডিও লেসন, PDF রিসোর্স ও কুইজ শীঘ্রই আপলোড করা হবে।
            বাম পাশের কারিকুলাম থেকে আগামী লেসনগুলো দেখুন।
          </p>
        </div>

        {/* ISSB module quick links */}
        <div className="w-full max-w-sm space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            এখনই অ্যাক্সেস করুন
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ISSB_MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.path}
                  to={`/courses/${courseId}/${mod.path}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/40
                             px-3 py-2.5 text-xs font-medium text-foreground
                             hover:bg-accent/10 hover:border-accent/40 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-accent" />
                  {mod.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CourseLearnSkeleton() {
  return (
    <div className="-m-6 flex flex-col md:flex-row h-[calc(100vh-3.5rem)]">
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
  const { data: course, isLoading } = useCourse(id);

  if (isLoading) return <CourseLearnSkeleton />;

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          কোর্সটি পাওয়া যায়নি
        </h2>
        <p className="text-sm text-muted-foreground">
          এই কোর্সটি আর উপলব্ধ নেই।
        </p>
        <Button asChild variant="outline">
          <Link to="/dashboard/courses">← আমার কোর্সে ফিরুন</Link>
        </Button>
      </div>
    );
  }

  if (course.category !== "ISSB") {
    return <ComingSoon />;
  }

  return (
    <div className="-m-6 flex flex-col md:flex-row h-[calc(100vh-3.5rem)]">
      <CurriculumSidebar course={course} />
      <LearnContent course={course} />
    </div>
  );
}
