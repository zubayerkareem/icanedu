import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Branch } from "./useBranches";

export function useAdminBranches() {
  return useQuery<Branch[]>({
    queryKey: ["admin_branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (branch: Partial<Branch> & { id?: string }) => {
      const payload = {
        name_en: branch.name_en ?? "",
        name_bn: branch.name_bn ?? "",
        address_en: branch.address_en ?? null,
        address_bn: branch.address_bn ?? null,
        phone: branch.phone ?? null,
        email: branch.email ?? null,
        map_url: branch.map_url ?? null,
        order_index: branch.order_index ?? 0,
        is_published: branch.is_published ?? true,
      };
      if (branch.id) {
        const { error } = await supabase.from("branches").update(payload).eq("id", branch.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("branches").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_branches"] });
      qc.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_branches"] });
      qc.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}
