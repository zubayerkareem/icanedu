import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type SiteSettings = {
  heading_font: string;
  body_font: string;
  primary_color: string; // hex
  accent_color: string; // hex
  logo_url?: string;
  tagline?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  facebook_url?: string;
  youtube_url?: string;
  telegram_url?: string;
  [key: string]: unknown;
};

const DEFAULTS: SiteSettings = {
  heading_font: "Hind Siliguri",
  body_font: "Hind Siliguri",
  primary_color: "#1a2332",
  accent_color: "#2563eb",
  tagline: "আপনার শিক্ষার সঙ্গী",
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (error) {
        // Table may not exist yet — fall back gracefully.
        return DEFAULTS;
      }

      const map: Record<string, unknown> = {};
      for (const row of data ?? []) {
        // value is jsonb — could be a primitive or object
        map[row.key as string] = (row as { value: unknown }).value;
      }
      return { ...DEFAULTS, ...map } as SiteSettings;
    },
  });
}
