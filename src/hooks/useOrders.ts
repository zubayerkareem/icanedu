import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  user_id: string | null;
  order_type: "product" | "course";
  product_id: string | null;
  product_name: string;
  product_price: number;
  customer_name: string;
  phone: string;
  address: string | null;
  shipping_type: "inside" | "outside" | null;
  shipping_cost: number;
  total_price: number;
  status: OrderStatus;
  bkash_txn_id: string | null;
  bkash_number: string | null;
  coupon_code: string | null;
  valid_until: string | null;
  created_at: string;
  courier_consignment_id?: string | null;
  courier_tracking_code?:  string | null;
  courier_status?:         string | null;
  payment_status?:    "due" | "complete" | null;
  payment_due_date?:  string | null;
}

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyOrders() {
  return useQuery<Order[]>({
    queryKey: ["my_orders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useBulkUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from("orders").delete().eq("id", id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("মুছতে ব্যর্থ — অনুমতি নেই বা রেকর্ড পাওয়া যায়নি");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useBulkDeleteOrders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error } = await supabase.from("orders").delete().in("id", ids).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("মুছতে ব্যর্থ — অনুমতি নেই বা রেকর্ড পাওয়া যায়নি");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
