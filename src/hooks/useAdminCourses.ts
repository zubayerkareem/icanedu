import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Course } from "@/lib/courses/types";

export function useAdminCourses() {
  return useQuery<Course[]>({
    queryKey: ["admin_courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type CourseUpsert = Omit<Course, "id" | "teacher"> & { id?: string };

export function useUpsertCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (course: CourseUpsert) => {
      const payload = {
        title: course.title,
        slug: course.slug || course.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
        category: course.category,
        thumbnail_url: course.thumbnail_url,
        duration: course.duration,
        price: course.price,
        discount_price: course.discount_price ?? null,
        discount_ends_at: course.discount_ends_at ?? null,
        short_description: course.short_description,
        long_description: course.long_description,
        total_lessons: course.total_lessons ?? 0,
        enrollment_count: course.enrollment_count ?? 0,
        teacher_name: course.teacher_name,
        teacher_avatar: course.teacher_avatar,
        teacher_short_bio: course.teacher_short_bio,
        teacher_long_bio: course.teacher_long_bio,
        includes: course.includes ?? {},
        modules: course.modules ?? [],
        reviews: course.reviews ?? [],
        highlights: course.highlights ?? [],
        highlight_items: course.highlight_items ?? [],
        feature_items: course.feature_items ?? [],
        coupons: course.coupons ?? [],
        videos: course.videos ?? [],
        resources: course.resources ?? [],
        rating_average: course.rating_average ?? 0,
        rating_count: course.rating_count ?? 0,
        is_published: course.is_published ?? true,
      };

      if (course.id) {
        const { error } = await supabase.from("courses").update(payload).eq("id", course.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_courses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_courses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
