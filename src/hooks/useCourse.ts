import { useQuery } from "@tanstack/react-query";
import { MOCK_COURSES } from "@/lib/courses/mock";
import { supabase } from "@/lib/supabase";
import type { Course } from "@/lib/courses/types";

export function useCourse(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ["course", idOrSlug],
    enabled: Boolean(idOrSlug),
    staleTime: 60 * 1000,
    queryFn: async (): Promise<Course | null> => {
      if (!idOrSlug) return null;

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      const query = isUuid
        ? supabase.from("courses").select("*").eq("id", idOrSlug)
        : supabase.from("courses").select("*").eq("slug", idOrSlug);

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        return {
          ...data,
          teacher: data.teacher_name
            ? { name: data.teacher_name, avatar: data.teacher_avatar, short_bio: data.teacher_short_bio, long_bio: data.teacher_long_bio }
            : undefined,
        };
      }

      return MOCK_COURSES.find((c) => c.slug === idOrSlug || c.id === idOrSlug) ?? null;
    },
  });
}

export function useRelatedCourses(course: Course | null | undefined, limit = 4) {
  return useQuery({
    queryKey: ["related_courses", course?.id, limit],
    enabled: Boolean(course),
    staleTime: 60 * 1000,
    queryFn: async (): Promise<Course[]> => {
      if (!course) return [];

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .neq("id", course.id)
        .limit(limit * 2);

      if (!error && data && data.length > 0) {
        const sameCat = data.filter((c) => c.category === course.category);
        const other = data.filter((c) => c.category !== course.category);
        return [...sameCat, ...other].slice(0, limit).map((row) => ({
          ...row,
          teacher: row.teacher_name
            ? { name: row.teacher_name, avatar: row.teacher_avatar }
            : undefined,
        }));
      }

      const sameCat = MOCK_COURSES.filter((c) => c.id !== course.id && c.category === course.category);
      const filler = MOCK_COURSES.filter((c) => c.id !== course.id && c.category !== course.category);
      return [...sameCat, ...filler].slice(0, limit);
    },
  });
}
