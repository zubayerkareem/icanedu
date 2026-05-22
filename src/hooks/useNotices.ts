import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface Notice {
  id: string;
  title: string;
  content: string;
  badge: string;
  badge_variant: BadgeVariant;
  is_published: boolean;
  created_at: string;
}

// Public — only published notices, newest first
export function useNotices(limit?: number) {
  return useQuery<Notice[]>({
    queryKey: ["notices", limit],
    staleTime: 60 * 1000,
    queryFn: async () => {
      let q = supabase
        .from("notices")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Admin — all notices including unpublished
export function useAdminNotices() {
  return useQuery<Notice[]>({
    queryKey: ["admin_notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type NoticeUpsert = Omit<Notice, "id" | "created_at"> & { id?: string };

export function useUpsertNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notice: NoticeUpsert) => {
      const payload = {
        title: notice.title,
        content: notice.content,
        badge: notice.badge,
        badge_variant: notice.badge_variant,
        is_published: notice.is_published,
      };
      if (notice.id) {
        const { error } = await supabase.from("notices").update(payload).eq("id", notice.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("notices").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notices"] });
      qc.invalidateQueries({ queryKey: ["admin_notices"] });
    },
  });
}

export function useDeleteNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notices"] });
      qc.invalidateQueries({ queryKey: ["admin_notices"] });
    },
  });
}
