// Shared cadet-course "notifications + action buttons" content.
// Used by:
//  - src/pages/dashboard/CadetNotifications.tsx (multi-course tabs view, direct URL)
//  - src/pages/dashboard/CourseLearn.tsx (single-course view reached via "Start Course"
//    for course_type === "cadet")
import { CheckCircle2, BookOpen, Lock, ClipboardList, UserCheck, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichContent } from "@/components/RichEditor";
import { toast } from "sonner";
import { useMarkCadetNotificationRead } from "@/hooks/useCadetNotifications";
import type { CadetNotification } from "@/hooks/useCadetNotifications";

// ─── Unskippable payment-blocked overlay ─────────────────────────────────────
// Renders as a fixed full-screen layer — no close button, backdrop clicks do
// nothing. Admin lifting the block (setting access to "হ্যাঁ") removes it.
const CONTACT_NUMBER = "01642571744";

export function CadetPaymentBlockedOverlay({ courseTitle }: { courseTitle?: string }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      // swallow all pointer events so nothing behind the overlay is clickable
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-amber-300 bg-white dark:bg-zinc-900 p-8 text-center shadow-2xl">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 mx-auto">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="font-heading text-xl font-bold text-foreground mb-1">
          কোর্স অ্যাক্সেস বন্ধ
        </h2>
        {courseTitle && (
          <p className="text-sm font-medium text-muted-foreground mb-3">{courseTitle}</p>
        )}
        <p className="text-sm text-muted-foreground mb-6">
          ক্যাডেট কোর্সের ফি পরিশোধ করুন।<br />
          নিচের নম্বরে যোগাযোগ করুন:
        </p>
        <a
          href={`tel:${CONTACT_NUMBER}`}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-heading font-bold text-white text-xl tracking-widest hover:bg-amber-600 transition-colors"
        >
          📞 {CONTACT_NUMBER}
        </a>
        <p className="mt-5 text-xs text-muted-foreground">
          পেমেন্ট করার পর অ্যাডমিন আপনার অ্যাক্সেস চালু করবেন।
        </p>
      </div>
    </div>
  );
}

// Fields needed from either a `Course` or a `CadetCourseRow` — both satisfy this shape.
export interface CadetActionCourse {
  cadet_assignment_url?: string | null;
  cadet_homework_url?: string | null;
  cadet_attendance_url?: string | null;
}

// ─── Action buttons for a cadet course ───────────────────────────────────────

interface ButtonDef {
  label: string;
  url: string | null | undefined;
  Icon: LucideIcon;
  bg: string;        // solid background
  shadow: string;    // colored drop-shadow on hover
}

const BUTTON_DEFS: Omit<ButtonDef, "url">[] = [
  {
    label: "এসাইনমেন্ট",
    Icon: ClipboardList,
    bg: "bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700",
    shadow: "hover:shadow-violet-300 dark:hover:shadow-violet-900",
  },
  {
    label: "হোম ওয়ার্ক",
    Icon: BookOpen,
    bg: "bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600",
    shadow: "hover:shadow-amber-300 dark:hover:shadow-amber-900",
  },
  {
    label: "এটেন্ডেন্স",
    Icon: UserCheck,
    bg: "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700",
    shadow: "hover:shadow-emerald-300 dark:hover:shadow-emerald-900",
  },
];

export function CourseActionButtons({ course }: { course: CadetActionCourse }) {
  const buttons: ButtonDef[] = [
    { ...BUTTON_DEFS[0], url: course.cadet_assignment_url },
    { ...BUTTON_DEFS[1], url: course.cadet_homework_url },
    { ...BUTTON_DEFS[2], url: course.cadet_attendance_url },
  ].filter((b) => b.url);

  if (buttons.length === 0) return null;

  return (
    /* 2 cols on mobile → up to 6 on wide screens */
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pb-2">
      {buttons.map((b) => {
        const Icon = b.Icon;
        return (
          <a
            key={b.label}
            href={b.url!}
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "group relative flex aspect-square flex-col items-center justify-center gap-2",
              "rounded-2xl text-white transition-all duration-200",
              "shadow-md hover:shadow-xl hover:-translate-y-1",
              b.bg,
              b.shadow,
            ].join(" ")}
          >
            {/* External link badge */}
            <ArrowUpRight className="absolute top-2.5 right-2.5 h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />

            <Icon className="h-9 w-9 drop-shadow-sm" strokeWidth={1.75} />

            <span className="text-center text-xs font-bold leading-tight tracking-wide px-1">
              {b.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}

// ─── Single notification card ─────────────────────────────────────────────────

export function NotifCard({ notif }: { notif: CadetNotification }) {
  const markRead = useMarkCadetNotificationRead();
  const isUnread = !notif.is_read;

  async function handleMarkRead() {
    try {
      await markRead.mutateAsync(notif.id);
    } catch {
      toast.error("সমস্যা হয়েছে");
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      className={[
        "rounded-xl border p-4 space-y-3 transition-colors",
        isUnread
          ? "border-cyan-300 bg-cyan-50/60 dark:border-cyan-700 dark:bg-cyan-950/30"
          : "border-border bg-card",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isUnread && (
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-500 shrink-0" />
            )}
            <p className="font-semibold text-sm text-foreground">{notif.title}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(notif.created_at)}</p>
        </div>
        {isUnread && (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 text-xs"
            onClick={handleMarkRead}
            disabled={markRead.isPending}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            পড়েছি
          </Button>
        )}
      </div>

      {notif.class_link && (
        <a
          href={notif.class_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="h-3 w-3" /> ক্লাস লিংক খুলুন
        </a>
      )}

      {notif.body && (
        <div className="text-sm border-t border-border pt-3">
          <RichContent html={notif.body} />
        </div>
      )}
    </div>
  );
}

// ─── Full panel: action buttons + notification list for one course ───────────

export function CadetCoursePanel({
  course,
  notifications,
}: {
  course: CadetActionCourse;
  notifications: CadetNotification[];
}) {
  return (
    <div className="space-y-4">
      <CourseActionButtons course={course} />

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-20" />
          <p className="text-sm">এখনো কোনো নোটিফিকেশন নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotifCard key={n.id} notif={n} />
          ))}
        </div>
      )}
    </div>
  );
}
