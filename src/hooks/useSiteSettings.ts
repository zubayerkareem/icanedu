import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SiteSetting {
  key: string;
  value: string | null;
}

export function useSiteSettings() {
  return useQuery<SiteSetting[]>({
    queryKey: ["site_settings"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSetting(key: string) {
  const { data = [] } = useSiteSettings();
  return data.find((s) => s.key === key)?.value ?? null;
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_settings"] }),
  });
}
