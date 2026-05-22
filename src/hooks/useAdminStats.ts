import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mockProducts } from "@/lib/products/mock";

export interface AdminStats {
  totalCourses: number;
  totalProducts: number;
  totalStudents: number;
  activeOrders: number;
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin_stats"],
    staleTime: 30 * 1000,
    queryFn: async () => {
      const [coursesRes, studentsRes, ordersRes] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .not("status", "in", '("delivered","cancelled")'),
      ]);

      return {
        totalCourses: coursesRes.count ?? 0,
        totalProducts: mockProducts.length,
        totalStudents: studentsRes.count ?? 0,
        activeOrders: ordersRes.count ?? 0,
      };
    },
  });
}
