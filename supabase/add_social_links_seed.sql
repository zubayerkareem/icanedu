-- Seed default (empty) social link settings.
-- Run in Supabase SQL Editor (safe to run multiple times — ON CONFLICT DO NOTHING).

INSERT INTO public.site_settings (key, value) VALUES
  ('whatsapp_number',    ''),
  ('facebook_group_url', ''),
  ('playstore_url',      ''),
  ('appstore_url',       '')
ON CONFLICT (key) DO NOTHING;
