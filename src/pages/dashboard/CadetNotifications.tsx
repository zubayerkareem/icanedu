import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useMyCadetCourses,
  useMyCadetNotifications,
} from "@/hooks/useCadetNotifications";
import type { CadetCourseRow, CadetNotification } from "@/hooks/useCadetNotifications";
import { CadetCoursePanel, CadetPaymentBlockedOverlay } from "@/components/CadetCoursePanel";
import { useMyCadetPaymentBlocked } from "@/hooks/useCadetPayments";

// ─── Course tab content (with payment gate) ───────────────────────────────────

function CoursePanelContent({
  course,
  allNotifications,
}: {
  course: CadetCourseRow;
  allNotifications: CadetNotification[];
}) {
  const notifs = allNotifications.filter((n) => n.course_id === course.id);
  const { data: isBlocked } = useMyCadetPaymentBlocked(course.id);
  return (
    <>
      {isBlocked && <CadetPaymentBlockedOverlay courseTitle={course.title} />}
      <CadetCoursePanel course={course} notifications={notifs} />
    </>
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
