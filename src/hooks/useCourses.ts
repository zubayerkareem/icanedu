import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Course, CourseSort } from "@/lib/courses/types";

export interface UseCoursesParams {
  search?: string;
  category?: string;
  sort?: CourseSort;
  page?: number;
  pageSize?: number;
}

export interface UseCoursesResult {
  items: Course[];
  total: number;
  totalPages: number;
  categories: string[];
}

function priceOf(c: Course): number {
  return c.discount_price ?? c.price ?? 0;
}

export function useCourses(params: UseCoursesParams = {}) {
  const {
    search = "",
    category = "all",
    sort = "newest",
    page = 1,
    pageSize = 9,
  } = params;

  return useQuery({
    queryKey: ["courses", { search, category, sort, page, pageSize }],
    staleTime: 60 * 1000,
    queryFn: async (): Promise<UseCoursesResult> => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true);

      if (error) throw error;

      const all: Course[] = (data ?? []).map((row) => ({
        ...row,
        teacher: row.teacher_name
          ? { name: row.teacher_name, avatar: row.teacher_avatar, short_bio: row.teacher_short_bio, long_bio: row.teacher_long_bio }
          : undefined,
      }));

      const categories = Array.from(
        new Set(all.map((c) => c.category).filter((x): x is string => Boolean(x))),
      ).sort();

      let list = all.slice();

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            (c.teacher_name?.toLowerCase().includes(q) ?? false) ||
            (c.category?.toLowerCase().includes(q) ?? false),
        );
      }

      if (category && category !== "all") {
        list = list.filter((c) => c.category === category);
      }

      switch (sort) {
        case "price_asc":
          list.sort((a, b) => priceOf(a) - priceOf(b));
          break;
        case "price_desc":
          list.sort((a, b) => priceOf(b) - priceOf(a));
          break;
        case "newest":
        default:
          list.sort(
            (a, b) =>
              new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
          );
      }

      const total = list.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(Math.max(1, page), totalPages);
      const start = (safePage - 1) * pageSize;
      const items = list.slice(start, start + pageSize);

      return { items, total, totalPages, categories };
    },
  });
}
