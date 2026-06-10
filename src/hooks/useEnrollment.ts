import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const ACTIVE_STATUSES = ["confirmed", "shipped", "delivered"];

/**
 * Whether the current user has an active enrollment (paid course order) for a course.
 * Matches against the course id OR slug stored in orders.product_id.
 */
export function useIsEnrolled(courseId?: string, slug?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["enrollment", courseId, slug],
    enabled: Boolean(courseId || slug),
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const ids = [courseId, slug].filter(Boolean) as string[];
      const { data, error } = await supabase
        .from("orders")
        .select("product_id, status, valid_until")
        .eq("user_id", user.id)
        .eq("order_type", "course")
        .in("product_id", ids);
      if (error) throw error;

      return (data ?? []).some(
        (o) =>
          ACTIVE_STATUSES.includes(o.status) &&
          (!o.valid_until || new Date(o.valid_until) > new Date())
      );
    },
  });

  return { enrolled: !!data, isLoading };
}
