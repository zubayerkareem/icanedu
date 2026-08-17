-- Seed the ISSB device-block toggle in site_settings.
-- '1' = blocking ON (default — preserves current behaviour).
-- '0' = blocking OFF — ISSB-enrolled students bypass single-device enforcement.
-- Admin controls this via Admin → Settings → "ISSB ডিভাইস ব্লকিং".
INSERT INTO public.site_settings (key, value)
VALUES ('issb_device_block_enabled', '1')
ON CONFLICT (key) DO NOTHING;
