-- Run in Supabase SQL Editor after supabase_issb_migration.sql
-- Adds is_free column to all ISSB set tables so admin can mark sets as
-- free preview (accessible without course purchase).

ALTER TABLE public.iq_sets            ADD COLUMN IF NOT EXISTS is_free bool DEFAULT false;
ALTER TABLE public.wat_sets           ADD COLUMN IF NOT EXISTS is_free bool DEFAULT false;
ALTER TABLE public.ist_sets           ADD COLUMN IF NOT EXISTS is_free bool DEFAULT false;
ALTER TABLE public.extempore_sets     ADD COLUMN IF NOT EXISTS is_free bool DEFAULT false;
ALTER TABLE public.ppdt_sets          ADD COLUMN IF NOT EXISTS is_free bool DEFAULT false;
ALTER TABLE public.picture_story_sets ADD COLUMN IF NOT EXISTS is_free bool DEFAULT false;
ALTER TABLE public.incomplete_story_sets ADD COLUMN IF NOT EXISTS is_free bool DEFAULT false;
