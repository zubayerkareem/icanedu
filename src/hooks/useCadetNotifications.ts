import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CadetNotification = {
  id: string;
  course_id: string;
  title: string;
  body: string | null;
  class_link: string | null;
  created_by: string | null;
  created_at: string;
  is_read?: boolean;
};

export type CadetCourseRow = {
  id: string;
  title: string;
  cadet_assignment_url: string | null;
  cadet_homework_url: string | null;
  cadet_attendance_url: string | null;
  payment_type?: "one_time" | "monthly";
};

// ─── Admin: all cadet courses ─────────────────────────────────────────────────

export function useAdminCadetCourses() {
  return useQuery<CadetCourseRow[]>({
    queryKey: ["admin_cadet_courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, cadet_assignment_url, cadet_homework_url, cadet_attendance_url, payment_type")
        .eq("course_type", "cadet")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CadetCourseRow[];
    },
  });
}

// ─── Admin: notifications for a course ───────────────────────────────────────

export function useCadetNotifications(courseId: string | null) {
  return useQuery<CadetNotification[]>({
    queryKey: ["cadet_notifications", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cadet_notifications")
        .select("*")
        .eq("course_id", courseId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CadetNotification[];
    },
  });
}

// ─── Admin: send notification ─────────────────────────────────────────────────

export function useSendCadetNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      course_id: string;
      title: string;
      body?: string;
      class_link?: string;
    }) => {
      const { error } = await supabase.from("cadet_notifications").insert({
        course_id: payload.course_id,
        title: payload.title,
        body: payload.body ?? null,
        class_link: payload.class_link ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ["cadet_notifications", v.course_id] });
    },
  });
}

// ─── Admin: delete notification ───────────────────────────────────────────────

export function useDeleteCadetNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase.from("cadet_notifications").delete().eq("id", id);
      if (error) throw error;
      return courseId;
    },
    onSuccess: (courseId) => {
      void qc.invalidateQueries({ queryKey: ["cadet_notifications", courseId] });
    },
  });
}

// ─── Admin: set of user IDs enrolled in any cadet course ─────────────────────

export function useAdminCadetStudentIds() {
  return useQuery<Set<string>>({
    queryKey: ["admin_cadet_student_ids"],
    staleTime: 60_000,
    queryFn: async () => {
      // 1. find cadet course IDs
      const { data: cadetCourses, error: ce } = await supabase
        .from("courses")
        .select("id")
        .eq("course_type", "cadet");
      if (ce) throw ce;

      const courseIds = (cadetCourses ?? []).map((c: { id: string }) => c.id);
      if (courseIds.length === 0) return new Set<string>();

      // 2. find enrolled user IDs
      const { data: orders, error: oe } = await supabase
        .from("orders")
        .select("user_id")
        .in("product_id", courseIds)
        .eq("order_type", "course")
        .neq("status", "cancelled");
      if (oe) throw oe;

      return new Set<string>((orders ?? []).map((o: { user_id: string }) => o.user_id));
    },
  });
}

// ─── Student: my enrolled cadet courses ──────────────────────────────────────

export function useMyCadetCourses() {
  const { user } = useAuth();
  return useQuery<CadetCourseRow[]>({
    queryKey: ["my_cadet_courses", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: orders, error: oe } = await supabase
        .from("orders")
        .select("product_id")
        .eq("user_id", user!.id)
        .eq("order_type", "course")
        .in("status", ["confirmed", "shipped", "delivered"]);
      if (oe) throw oe;

      const courseIds = (orders ?? []).map((o: { product_id: string }) => o.product_id);
      if (courseIds.length === 0) return [];

      const { data: courses, error: ce } = await supabase
        .from("courses")
        .select("id, title, cadet_assignment_url, cadet_homework_url, cadet_attendance_url")
        .in("id", courseIds)
        .eq("course_type", "cadet");
      if (ce) throw ce;

      return (courses ?? []) as CadetCourseRow[];
    },
  });
}

// ─── Student: my cadet notifications (with read status) ──────────────────────

export function useMyCadetNotifications() {
  const { user } = useAuth();
  const { data: myCadetCourses = [] } = useMyCadetCourses();
  const courseIds = myCadetCourses.map((c) => c.id);

  return useQuery<CadetNotification[]>({
    queryKey: ["my_cadet_notifications", user?.id, courseIds.join(",")],
    enabled: !!user?.id && courseIds.length > 0,
    queryFn: async () => {
      const [{ data: notifs, error: ne }, { data: reads, error: re }] = await Promise.all([
        supabase
          .from("cadet_notifications")
          .select("*")
          .in("course_id", courseIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("cadet_notification_reads")
          .select("notification_id")
          .eq("user_id", user!.id),
      ]);
      if (ne) throw ne;
      if (re) throw re;

      const readSet = new Set((reads ?? []).map((r: { notification_id: string }) => r.notification_id));

      return (notifs ?? []).map((n) => ({
        ...(n as CadetNotification),
        is_read: readSet.has(n.id),
      }));
    },
  });
}

// ─── Student: mark one notification as read ───────────────────────────────────

export function useMarkCadetNotificationRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) throw new Error("Not signed in");
      const { error } = await supabase.from("cadet_notification_reads").upsert(
        { notification_id: notificationId, user_id: user.id },
        { onConflict: "notification_id,user_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["my_cadet_notifications"] });
    },
  });
}
