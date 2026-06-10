import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { SuccessStory } from "./useSuccessStories";

export function useAdminSuccessStories() {
  return useQuery<SuccessStory[]>({
    queryKey: ["admin_success_stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertSuccessStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (story: Partial<SuccessStory> & { id?: string }) => {
      const payload = {
        name: story.name ?? "",
        category: story.category ?? "issb",
        image_url: story.image_url ?? null,
        description: story.description ?? null,
        show_on_homepage: story.show_on_homepage ?? false,
        is_published: story.is_published ?? true,
        order_index: story.order_index ?? 0,
      };
      if (story.id) {
        const { error } = await supabase.from("success_stories").update(payload).eq("id", story.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("success_stories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_success_stories"] });
      qc.invalidateQueries({ queryKey: ["success_stories"] });
      qc.invalidateQueries({ queryKey: ["success_stories_homepage"] });
    },
  });
}

export function useDeleteSuccessStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("success_stories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_success_stories"] });
      qc.invalidateQueries({ queryKey: ["success_stories"] });
      qc.invalidateQueries({ queryKey: ["success_stories_homepage"] });
    },
  });
}
