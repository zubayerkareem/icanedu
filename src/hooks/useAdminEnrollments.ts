import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Order } from "./useOrders";

export function useStudentCourseOrders(userId: string | null) {
  return useQuery<Order[]>({
    queryKey: ["student_orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId!)
        .eq("order_type", "course")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAllCoursesForSelect() {
  return useQuery<{ id: string; title: string }[]>({
    queryKey: ["courses_for_select"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminEnrollStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      email: string;
      courseId: string;
      courseName: string;
      validUntil: string | null;
    }) => {
      const { data, error } = await supabase.rpc("admin_enroll_student", {
        p_email: params.email.trim().toLowerCase(),
        p_course_id: params.courseId,
        p_course_name: params.courseName,
        p_valid_until: params.validUntil || null,
      });
      if (error) throw error;
      if (data?.error === "user_not_found")
        throw new Error("এই ইমেইলে কোনো অ্যাকাউন্ট নেই। শিক্ষার্থীকে আগে রেজিস্ট্রেশন করতে বলুন।");
      if (data?.error === "already_enrolled")
        throw new Error("শিক্ষার্থী এই কোর্সে ইতিমধ্যে ভর্তি আছেন।");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student_orders"] });
      qc.invalidateQueries({ queryKey: ["admin_students"] });
    },
  });
}

export function useAdminRevokeEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student_orders"] }),
  });
}

export function useAdminUpdateValidity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, validUntil }: { orderId: string; validUntil: string | null }) => {
      const { error } = await supabase
        .from("orders")
        .update({ valid_until: validUntil || null })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student_orders"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useAdminDirectEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      courseId: string;
      courseName: string;
      validUntil: string | null;
    }) => {
      const already = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", params.userId)
        .eq("product_id", params.courseId)
        .eq("order_type", "course")
        .in("status", ["confirmed", "shipped", "delivered"])
        .maybeSingle();
      if (already.data) throw new Error("শিক্ষার্থী এই কোর্সে ইতিমধ্যে ভর্তি আছেন।");

      const { error } = await supabase.from("orders").insert({
        user_id: params.userId,
        product_id: params.courseId,
        product_name: params.courseName,
        product_price: 0,
        customer_name: params.courseName,
        phone: "",
        shipping_cost: 0,
        total_price: 0,
        order_type: "course",
        status: "confirmed",
        valid_until: params.validUntil || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student_orders"] });
      qc.invalidateQueries({ queryKey: ["admin_students"] });
    },
  });
}

export function useAdminCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.rpc("admin_create_student", {
        p_email: email.trim().toLowerCase(),
        p_password: password,
      });
      if (error) throw error;
      if (data?.error === "email_exists")
        throw new Error("এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_students"] }),
  });
}
