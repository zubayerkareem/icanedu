import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SuccessStory {
  id: string;
  name: string;
  category: "issb" | "cadet";
  image_url?: string;
  description?: string;
  show_on_homepage: boolean;
  is_published: boolean;
  order_index: number;
  created_at?: string;
}

export function useSuccessStories(category?: "issb" | "cadet") {
  return useQuery<SuccessStory[]>({
    queryKey: ["success_stories", category],
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase
        .from("success_stories")
        .select("*")
        .eq("is_published", true)
        .order("order_index");
      if (category) q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useHomepageSuccessStories() {
  return useQuery<SuccessStory[]>({
    queryKey: ["success_stories_homepage"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .eq("is_published", true)
        .eq("show_on_homepage", true)
        .order("order_index");
      if (error) throw error;
      return data ?? [];
    },
  });
}
