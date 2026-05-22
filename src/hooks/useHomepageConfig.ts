import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { AnySection } from "@/lib/page-builder/types";

export function useHomepageConfig() {
  return useQuery({
    queryKey: ["homepage_config", "published"],
    staleTime: 60 * 1000,
    queryFn: async (): Promise<AnySection[]> => {
      const { data, error } = await supabase
        .from("homepage_config")
        .select("sections_json")
        .eq("status", "published")
        .maybeSingle();

      if (error || !data) return [];
      const sections = (data.sections_json ?? []) as AnySection[];
      return sections
        .filter((s) => s && s.visible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  });
}
