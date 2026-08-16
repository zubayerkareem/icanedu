import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Branch {
  id: string;
  name_en: string;
  name_bn: string;
  address_en: string | null;
  address_bn: string | null;
  phone: string | null;
  email: string | null;
  map_url: string | null;
  order_index: number;
  is_published: boolean;
  created_at?: string;
}

// Public: published branches, for the footer & contact page.
export function useBranches() {
  return useQuery<Branch[]>({
    queryKey: ["branches"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("is_published", true)
        .order("order_index");
      if (error) throw error;
      return data ?? [];
    },
  });
}
