-- Add Steadfast Courier tracking fields to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS courier_consignment_id text,
  ADD COLUMN IF NOT EXISTS courier_tracking_code  text,
  ADD COLUMN IF NOT EXISTS courier_status         text;

-- Seed Steadfast API key placeholders in site_settings (admin fills these in the Settings page)
INSERT INTO public.site_settings (key, value)
VALUES ('steadfast_api_key',    '')
     , ('steadfast_secret_key', '')
ON CONFLICT (key) DO NOTHING;
