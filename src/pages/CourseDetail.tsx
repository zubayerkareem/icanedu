import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Eye,
  FileText,
  HelpCircle,
  Infinity as InfinityIcon,
  Lock,
  PlayCircle,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "@/components/courses/CourseCard";
import { useCourse, useRelatedCourses } from "@/hooks/useCourse";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/lib/strings";
import type { Course, CourseVideo, LessonType, Module } from "@/lib/courses/types";
import { IQ_COURSE_ID } from "@/lib/iq-practice/mock";
import { STORY_COURSE_ID } from "@/lib/incomplete-story/mock";
import { PPDT_COURSE_ID } from "@/lib/ppdt/mock";
import { PICTURE_STORY_COURSE_ID } from "@/lib/picture-story/mock";
import { WAT_COURSE_ID } from "@/lib/wat/mock";
import { IST_COURSE_ID } from "@/lib/ist/mock";

const LESSON_ICON: Record<LessonType, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
};

function bnNum(n: number): string {
  try {
    return new Intl.NumberFormat("bn-BD").format(n);
  } catch {
    return String(n);
  }
}

function discountPercent(course: Course): number | null {
  if (
    typeof course.discount_price === "number" &&
    typeof course.price === "number" &&
    course.price > 0 &&
    course.discount_price < course.price
  ) {
    return Math.round(((course.price - course.discount_price) / course.price) * 100);
  }
  return null;
}

function useCountdown(targetIso?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!targetIso) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [targetIso]);
  if (!targetIso) return null;
  const ms = Math.max(0, new Date(targetIso).getTime() - now);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds, finished: ms === 0 };
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-md bg-muted px-2 py-1.5">
      <span className="font-heading text-lg font-bold tabular-nums text-foreground">
        {bnNum(value).padStart(2, "০")}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function CourseHeroSkeleton() {
  return (
    <section className="border-b border-border bg-background">
      <div className="container grid gap-10 py-12 lg:grid-cols-[1fr_420px] lg:py-16">
        <div className="space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </section>
  );
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading } = useCourse(id);
  const { data: related = [] } = useRelatedCourses(course);

  if (isLoading) return <CourseHeroSkeleton />;

  if (!course) {
    return (
      <section className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t.courseDetail.notFoundTitle}
        </h1>
        <p className="mt-2 text-muted-foreground">{t.courseDetail.notFoundDesc}</p>
        <Button asChild className="mt-6">
          <Link to="/courses">{t.courseDetail.backToCourses}</Link>
        </Button>
      </section>
    );
  }

  return (
    <>
      <CourseHero course={course} />
      <CurriculumSection modules={course.modules ?? []} />
      <VideosSection videos={course.videos ?? []} />
      <ResourcesSection resources={course.resources ?? []} />
      <TeacherSection course={course} />
      <ReviewsSection course={course} />
      {related.length > 0 && <RelatedCourses related={related} />}
    </>
  );
}

// ============ Hero ============

function CourseHero({ course }: { course: Course }) {
  const pct = discountPercent(course);
  const countdown = useCountdown(pct ? course.discount_ends_at : undefined);
  const inc = course.includes ?? {};
  const { user } = useAuth();
  const checkoutUrl = `/checkout?type=course&courseId=${course.id}&courseName=${encodeURIComponent(course.title)}&price=${course.discount_price ?? course.price ?? 0}`;
  const buyHref = user ? checkoutUrl : `/login?redirect=${encodeURIComponent(checkoutUrl)}`;

  return (
    <section className="border-b border-border bg-background">
      <div className="container grid items-start gap-10 py-12 lg:grid-cols-[1fr_420px] lg:py-16">
        {/* Left: title + meta */}
        <div>
          <nav aria-label="breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="hover:text-foreground">
                  {t.courses.breadcrumbHome}
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li>
                <Link to="/courses" className="hover:text-foreground">
                  {t.courses.breadcrumbCourses}
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="line-clamp-1 text-foreground">{course.title}</li>
            </ol>
          </nav>

          {course.category && (
            <Badge variant="secondary" className="mt-4">
              {course.category}
            </Badge>
          )}

          <h1 className="mt-3 font-heading text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {course.title}
          </h1>

          {course.short_description && (
            <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
              {course.short_description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {course.duration && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">
                <Clock className="h-3.5 w-3.5" />
                {course.duration}
              </span>
            )}
            {typeof course.total_lessons === "number" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                {bnNum(course.total_lessons)}
                {t.courseDetail.lessonsUnit}
              </span>
            )}
            {typeof course.enrollment_count === "number" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">
                <Users className="h-3.5 w-3.5" />
                {bnNum(course.enrollment_count)} {t.courseDetail.enrolledStudents}
              </span>
            )}
            {typeof course.rating_average === "number" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">
                <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                {course.rating_average.toFixed(1)}
              </span>
            )}
          </div>

          {course.teacher && (
            <div className="mt-8 flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-border">
                {course.teacher.avatar && <AvatarImage src={course.teacher.avatar} />}
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {course.teacher.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {course.teacher.name}
                </div>
                {course.teacher.short_bio && (
                  <div className="text-xs text-muted-foreground">{course.teacher.short_bio}</div>
                )}
              </div>
            </div>
          )}

          {/* Course highlights block */}
          {(course.long_description || (course.highlights && course.highlights.length > 0)) && (
            <div className="mt-8 rounded-lg border border-border bg-muted/40 p-5">
              <h2 className="font-heading text-base font-bold text-foreground">
                কোর্স সম্পর্কে বিস্তারিত
              </h2>
              {course.long_description && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {course.long_description.split("\n")[0]}
                </p>
              )}
              {course.highlights && course.highlights.length > 0 && (
                <>
                  <p className="mt-4 text-sm font-semibold text-foreground">
                    কোর্সটি যে কারণে আলাদা:
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {course.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: sticky purchase card — first on mobile, right column on desktop */}
        <div className="order-first lg:order-none">
          <div className="lg:sticky lg:top-20">
            <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-muted to-secondary" />
                )}
              </div>

              <div className="space-y-4 p-5">
                {/* Price */}
                <div>
                  {pct ? (
                    <>
                      <div className="flex items-baseline gap-3">
                        <span className="font-heading text-3xl font-bold text-accent">
                          ৳{bnNum(course.discount_price!)}
                        </span>
                        <span className="text-base text-muted-foreground line-through">
                          ৳{bnNum(course.price!)}
                        </span>
                        <Badge className="bg-destructive text-destructive-foreground">
                          {bnNum(pct)}% {t.courseDetail.discountBadge}
                        </Badge>
                      </div>
                      {countdown && !countdown.finished && (
                        <div className="mt-3 rounded-md border border-border bg-muted/40 p-3">
                          <div className="text-xs text-muted-foreground">
                            {t.courseDetail.offerEndsIn}:
                          </div>
                          <div className="mt-2 grid grid-cols-4 gap-2">
                            <CountdownBox value={countdown.days} label={t.courseDetail.days} />
                            <CountdownBox value={countdown.hours} label={t.courseDetail.hours} />
                            <CountdownBox value={countdown.minutes} label={t.courseDetail.minutes} />
                            <CountdownBox value={countdown.seconds} label={t.courseDetail.seconds} />
                          </div>
                        </div>
                      )}
                    </>
                  ) : course.price && course.price > 0 ? (
                    <span className="font-heading text-3xl font-bold text-foreground">
                      ৳{bnNum(course.price)}
                    </span>
                  ) : (
                    <span className="font-heading text-2xl font-bold text-success">
                      {t.home.free}
                    </span>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  asChild
                >
                  <Link to={buyHref}>
                    {course.price && course.price > 0
                      ? t.courseDetail.buyNow
                      : t.courseDetail.enroll}
                  </Link>
                </Button>

                {course.id === IQ_COURSE_ID && (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link to={`/courses/${course.id}/iq-practice`}>
                      🧠 IQ Practice
                    </Link>
                  </Button>
                )}

                {course.id === STORY_COURSE_ID && (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link to={`/courses/${course.id}/incomplete-story`}>
                      ✍️ Incomplete Story
                    </Link>
                  </Button>
                )}

                {course.id === PPDT_COURSE_ID && (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link to={`/courses/${course.id}/ppdt`}>
                      🔍 PPDT Practice
                    </Link>
                  </Button>
                )}

                {course.id === PICTURE_STORY_COURSE_ID && (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link to={`/courses/${course.id}/picture-story`}>
                      🖼️ পিকচার স্টোরি
                    </Link>
                  </Button>
                )}

                {course.id === WAT_COURSE_ID && (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link to={`/courses/${course.id}/wat`}>
                      🧠 WAT Practice
                    </Link>
                  </Button>
                )}

                {course.id === IST_COURSE_ID && (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link to={`/courses/${course.id}/ist`}>
                      📝 IST Practice
                    </Link>
                  </Button>
                )}
                {!user && (
                  <p className="text-center text-xs text-muted-foreground">
                    কোর্স কিনতে{" "}
                    <Link to={`/login?redirect=${encodeURIComponent(checkoutUrl)}`} className="text-accent hover:underline">
                      লগইন করুন
                    </Link>
                  </p>
                )}

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  {t.courseDetail.moneyBack}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="text-sm font-semibold text-foreground">
                    {t.courseDetail.youGet}
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {typeof inc.videos === "number" && (
                      <IncludeRow
                        icon={<PlayCircle className="h-4 w-4 text-accent" />}
                        text={`${bnNum(inc.videos)} ${t.courseDetail.videos}`}
                      />
                    )}
                    {typeof inc.pdfs === "number" && (
                      <IncludeRow
                        icon={<FileText className="h-4 w-4 text-accent" />}
                        text={`${bnNum(inc.pdfs)} ${t.courseDetail.pdfs}`}
                      />
                    )}
                    {typeof inc.quizzes === "number" && (
                      <IncludeRow
                        icon={<HelpCircle className="h-4 w-4 text-accent" />}
                        text={`${bnNum(inc.quizzes)} ${t.courseDetail.quizzes}`}
                      />
                    )}
                    {typeof inc.assignments === "number" && (
                      <IncludeRow
                        icon={<ClipboardList className="h-4 w-4 text-accent" />}
                        text={`${bnNum(inc.assignments)} ${t.courseDetail.assignments}`}
                      />
                    )}
                    {inc.lifetime_access && (
                      <IncludeRow
                        icon={<InfinityIcon className="h-4 w-4 text-accent" />}
                        text={t.courseDetail.lifetimeAccess}
                      />
                    )}
                    {inc.certificate && (
                      <IncludeRow
                        icon={<CheckCircle2 className="h-4 w-4 text-accent" />}
                        text={t.courseDetail.certificate}
                      />
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IncludeRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="text-foreground">{text}</span>
    </li>
  );
}

// ============ Curriculum ============

function CurriculumSection({ modules }: { modules: Module[] }) {
  if (modules.length === 0) return null;
  // Track which lessons should be marked as preview (first 2 of first module).
  const previewIds = new Set<string>(
    modules[0]?.lessons.slice(0, 2).map((l) => l.id) ?? [],
  );

  return (
    <section className="py-12 sm:py-16">
      <div className="container max-w-4xl">
        <h2 className="mb-6 font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {t.courseDetail.curriculumTitle}
        </h2>
        <Accordion
          type="multiple"
          defaultValue={[modules[0].id]}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          {modules.map((m, i) => (
            <AccordionItem
              key={m.id}
              value={m.id}
              className="border-b border-border last:border-b-0"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex w-full items-center gap-4 text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 font-heading text-sm font-bold text-accent">
                    {bnNum(i + 1)}
                  </div>
                  <div className="flex-1">
                    <div className="font-heading text-base font-semibold text-foreground">
                      {m.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {bnNum(m.lessons.length)}
                      {t.courseDetail.lessonsUnit}
                      {m.total_duration ? ` • ${m.total_duration}` : ""}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                <ul className="divide-y divide-border">
                  {m.lessons.map((l) => {
                    const Icon = LESSON_ICON[l.type];
                    const isPreview = l.isPreview ?? previewIds.has(l.id);
                    return (
                      <li
                        key={l.id}
                        className="flex items-center gap-3 py-3 text-sm"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 text-foreground">{l.title}</span>
                        {l.duration && l.duration !== "—" && (
                          <span className="text-xs text-muted-foreground">
                            {l.duration}
                          </span>
                        )}
                        {isPreview ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                            <Eye className="h-3 w-3" />
                            {t.courseDetail.preview}
                          </span>
                        ) : (
                          <Lock
                            className="h-3.5 w-3.5 text-muted-foreground"
                            aria-label={t.courseDetail.locked}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// ============ Videos ============

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube: youtube.com/watch?v=ID or youtu.be/ID
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    // Vimeo: vimeo.com/ID
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    // invalid URL
  }
  return null;
}

function VideosSection({ videos }: { videos: CourseVideo[] }) {
  const [active, setActive] = useState(0);
  if (videos.length === 0) return null;

  const current = videos[active];
  const embedUrl = getEmbedUrl(current.url);

  return (
    <section className="py-12 sm:py-16">
      <div className="container max-w-4xl">
        <h2 className="mb-6 font-heading text-2xl font-bold text-foreground sm:text-3xl">
          ভিডিও লেসন
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Player */}
          <div className="aspect-video w-full bg-black">
            {embedUrl ? (
              <iframe
                key={embedUrl}
                src={embedUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={current.title}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/60">
                ভিডিও লোড করা যাচ্ছে না
              </div>
            )}
          </div>
          {/* Title + description */}
          <div className="border-b border-border px-5 py-4">
            <p className="font-heading text-base font-semibold text-foreground">{current.title}</p>
            {current.description && (
              <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
            )}
          </div>
          {/* Playlist */}
          {videos.length > 1 && (
            <ul className="divide-y divide-border">
              {videos.map((v, i) => (
                <li key={v.id}>
                  <button
                    onClick={() => setActive(i)}
                    className={[
                      "flex w-full items-center gap-3 px-5 py-3 text-left text-sm transition-colors hover:bg-muted/50",
                      i === active ? "bg-accent/10 text-accent" : "text-foreground",
                    ].join(" ")}
                  >
                    <PlayCircle className={`h-4 w-4 shrink-0 ${i === active ? "text-accent" : "text-muted-foreground"}`} />
                    <span className="flex-1 line-clamp-1">{v.title}</span>
                    {i === active && (
                      <span className="text-[10px] font-medium text-accent">চলছে</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

// ============ Resources ============

function ResourcesSection({ resources }: { resources: Course["resources"] }) {
  if (!resources || resources.length === 0) return null;

  const typeLabel: Record<string, string> = {
    pdf: "PDF",
    doc: "Word",
    sheet: "Sheet",
    ppt: "Slide",
  };

  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container max-w-4xl">
        <h2 className="mb-6 font-heading text-2xl font-bold text-foreground sm:text-3xl">
          রিসোর্স শিট
        </h2>
        <ul className="space-y-3">
          {resources.map((r) => (
            <li key={r.id}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/10">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{r.title}</p>
                  {r.type && (
                    <p className="text-xs text-muted-foreground">
                      {typeLabel[r.type.toLowerCase()] ?? r.type.toUpperCase()}
                    </p>
                  )}
                </div>
                <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ============ Description ============

function DescriptionSection({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setOverflowing(el.scrollHeight > 320);
  }, [content]);

  if (!content.trim()) return null;

  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container max-w-4xl">
        <h2 className="mb-6 font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {t.courseDetail.detailsTitle}
        </h2>
        <div className="relative">
          <div
            ref={ref}
            className="overflow-hidden whitespace-pre-wrap font-body text-base leading-relaxed text-foreground transition-[max-height] duration-300"
            style={{ maxHeight: expanded ? "9999px" : "300px" }}
          >
            {content}
          </div>
          {!expanded && overflowing && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-muted/30 to-transparent"
            />
          )}
        </div>
        {overflowing && (
          <div className="mt-4">
            <Button variant="outline" onClick={() => setExpanded((v) => !v)}>
              {expanded ? t.courseDetail.showLess : t.courseDetail.showMore}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

// ============ Teacher ============

function TeacherSection({ course }: { course: Course }) {
  const teacher = course.teacher;
  if (!teacher) return null;
  return (
    <section className="py-12 sm:py-16">
      <div className="container max-w-4xl">
        <h2 className="mb-6 font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {t.courseDetail.teacherTitle}
        </h2>
        <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24 shrink-0">
            {teacher.avatar && <AvatarImage src={teacher.avatar} />}
            <AvatarFallback className="bg-accent text-2xl text-accent-foreground">
              {teacher.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-heading text-xl font-bold text-foreground">
              {teacher.name}
            </div>
            {teacher.short_bio && (
              <div className="mt-1 text-sm font-medium text-accent">
                {teacher.short_bio}
              </div>
            )}
            {teacher.long_bio && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {teacher.long_bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ Reviews ============

function ReviewsSection({ course }: { course: Course }) {
  const avg = course.rating_average ?? 0;
  const count = course.rating_count ?? 0;
  const reviews = course.reviews ?? [];
  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container max-w-4xl">
        <h2 className="mb-6 font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {t.courseDetail.reviewsTitle}
        </h2>
        <div className="mb-8 flex flex-wrap items-center gap-6 rounded-lg border border-border bg-card p-6">
          <div className="text-center">
            <div className="font-heading text-5xl font-bold text-foreground">
              {avg.toFixed(1)}
            </div>
            <div className="mt-1 flex justify-center gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(avg) ? "fill-current" : "opacity-30"}`}
                />
              ))}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {bnNum(count)}
              {t.courseDetail.ratingsUnit}
            </div>
          </div>
          <div className="hidden h-16 w-px bg-border sm:block" />
          <div className="text-sm text-muted-foreground">
            {t.courseDetail.averageRating}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="flex flex-col rounded-lg border border-border bg-card p-5"
            >
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${j < r.rating ? "fill-current" : "opacity-30"}`}
                  />
                ))}
              </div>
              <p className="mt-3 flex-1 text-sm italic text-foreground">“{r.comment}”</p>
              <div className="mt-4 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {r.avatar && <AvatarImage src={r.avatar} />}
                  <AvatarFallback className="text-xs">{r.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium text-foreground">{r.name}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ Related ============

function RelatedCourses({ related }: { related: Course[] }) {
  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <h2 className="mb-6 font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {t.courseDetail.relatedTitle}
        </h2>
        {/* Horizontal scroll on mobile, grid on lg+ */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          {related.map((c) => (
            <div
              key={c.id}
              className="w-[280px] shrink-0 snap-start sm:w-[320px] lg:w-auto"
            >
              <CourseCard course={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
