import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { addOneMonth } from "@/lib/payments";

export interface CadetEnrollmentRow {
  id: string;              // order id
  user_id: string | null;
  name: string;
  email: string | null;
  status: string;
  payment_status: "due" | "complete" | null;
  payment_due_date: string | null;
  created_at: string;
  total_price: number;
}

// Admin: all (non-cancelled) enrollments for a single cadet course, joined
// with student name/email — the data source for the bulk "Confirm Payment"
// table. Mirrors the admin_list_users email-join pattern from useStudents.ts.
export function useAdminCadetCourseEnrollments(courseId: string | null) {
  return useQuery<CadetEnrollmentRow[]>({
    queryKey: ["admin_cadet_course_enrollments", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const [{ data: orders, error: oErr }, { data: users, error: uErr }] = await Promise.all([
        supabase
          .from("orders")
          .select("id, user_id, customer_name, status, payment_status, payment_due_date, created_at, total_price")
          .eq("product_id", courseId!)
          .eq("order_type", "course")
          .neq("status", "cancelled")
          .order("created_at", { ascending: false }),
        supabase.rpc("admin_list_users"),
      ]);
      if (oErr) throw oErr;

      const emailMap: Record<string, string> = {};
      if (!uErr) for (const u of (users as { id: string; email: string }[] | null) ?? []) emailMap[u.id] = u.email;

      return (orders ?? []).map((o) => ({
        id: o.id,
        user_id: o.user_id,
        name: o.customer_name || (o.user_id ? emailMap[o.user_id] : "") || "—",
        email: o.user_id ? emailMap[o.user_id] ?? null : null,
        status: o.status,
        payment_status: o.payment_status ?? "complete",
        payment_due_date: o.payment_due_date,
        created_at: o.created_at,
        total_price: o.total_price,
      }));
    },
  });
}

// Admin: bulk-confirm payment for selected enrollments. Marks them complete
// and — only for monthly-subscription courses — pushes payment_due_date
// forward one billing cycle from today.
export function useBulkConfirmCadetPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderIds, monthly }: { orderIds: string[]; monthly: boolean }) => {
      const payload: { payment_status: "complete"; payment_due_date?: string } = { payment_status: "complete" };
      if (monthly) payload.payment_due_date = addOneMonth();
      const { error } = await supabase.from("orders").update(payload).in("id", orderIds);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_cadet_course_enrollments"] });
      qc.invalidateQueries({ queryKey: ["my_orders"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
