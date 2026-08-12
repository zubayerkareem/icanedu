import { useState } from "react";
import { GraduationCap, ExternalLink, CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RichContent } from "@/components/RichEditor";
import { toast } from "sonner";
import {
  useMyCadetCourses,
  useMyCadetNotifications,
  useMarkCadetNotificationRead,
} from "@/hooks/useCadetNotifications";
import type { CadetCourseRow, CadetNotification } from "@/hooks/useCadetNotifications";

// ─── Action buttons for a cadet course ───────────────────────────────────────

function CourseActionButtons({ course }: { course: CadetCourseRow }) {
  const buttons = [
    { label: "এসাইনমেন্ট", url: course.cadet_assignment_url },
    { label: "হোম ওয়ার্ক",  url: course.cadet_homework_url },
    { label: "এটেন্ডেন্স",  url: course.cadet_attendance_url },
  ].filter((b) => b.url);

  if (buttons.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pb-2">
      {buttons.map((b) => (
        <a
          key={b.label}
          href={b.url!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-900/40"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {b.label}
        </a>
      ))}
    </div>
  );
}

// ─── Single notification card ─────────────────────────────────────────────────

function NotifCard({
  notif,
  courseId,
}: {
  notif: CadetNotification;
  courseId: string;
}) {
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

// ─── Course tab content ───────────────────────────────────────────────────────

function CoursePanelContent({
  course,
  allNotifications,
}: {
  course: CadetCourseRow;
  allNotifications: CadetNotification[];
}) {
  const notifs = allNotifications.filter((n) => n.course_id === course.id);

  return (
    <div className="space-y-4">
      <CourseActionButtons course={course} />

      {notifs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-20" />
          <p className="text-sm">এখনো কোনো নোটিফিকেশন নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => (
            <NotifCard key={n.id} notif={n} courseId={course.id} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CadetNotifications() {
  const { data: myCadetCourses = [], isLoading: loadingCourses } = useMyCadetCourses();
  const { data: notifications = [], isLoading: loadingNotifs } = useMyCadetNotifications();
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  const currentTab = activeTab ?? myCadetCourses[0]?.id;

  const isLoading = loadingCourses || loadingNotifs;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        লোড হচ্ছে...
      </div>
    );
  }

  if (myCadetCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-3">
        <GraduationCap className="h-12 w-12 opacity-20" />
        <p className="text-sm">আপনি কোনো ক্যাডেট কোর্সে ভর্তি নন।</p>
      </div>
    );
  }

  const unreadTotal = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-cyan-600" />
          ক্যাডেট নোটিফিকেশন
          {unreadTotal > 0 && (
            <span className="ml-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-cyan-600 px-2 text-xs font-bold text-white">
              {unreadTotal}
            </span>
          )}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          আপনার ক্যাডেট কোর্সের নোটিশ ও বাটন
        </p>
      </div>

      {/* Single course — no tabs */}
      {myCadetCourses.length === 1 ? (
        <CoursePanelContent
          course={myCadetCourses[0]}
          allNotifications={notifications}
        />
      ) : (
        /* Multiple courses — tabs */
        <Tabs value={currentTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full flex-wrap justify-start mb-4">
            {myCadetCourses.map((course) => {
              const courseUnread = notifications.filter(
                (n) => n.course_id === course.id && !n.is_read,
              ).length;
              return (
                <TabsTrigger key={course.id} value={course.id} className="gap-1.5">
                  {course.title}
                  {courseUnread > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-600 px-1 text-[10px] font-bold text-white">
                      {courseUnread}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {myCadetCourses.map((course) => (
            <TabsContent key={course.id} value={course.id}>
              <CoursePanelContent course={course} allNotifications={notifications} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
