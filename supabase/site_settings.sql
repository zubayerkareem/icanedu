CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Default rows
INSERT INTO public.site_settings (key, value) VALUES
  ('ga_measurement_id', '')
ON CONFLICT (key) DO NOTHING;
