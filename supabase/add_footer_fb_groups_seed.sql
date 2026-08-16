-- Seed default (empty) footer Facebook group settings — 2 admin-editable widgets.
-- Run in Supabase SQL Editor (safe to run multiple times — ON CONFLICT DO NOTHING).

INSERT INTO public.site_settings (key, value) VALUES
  ('fb_group_1_title', ''),
  ('fb_group_1_url',   ''),
  ('fb_group_2_title', ''),
  ('fb_group_2_url',   '')
ON CONFLICT (key) DO NOTHING;
