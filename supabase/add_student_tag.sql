-- Add tag column to profiles for student classification
-- Run this in Supabase SQL Editor
-- Valid values: NULL (no tag), 'offline', 'paid'

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT NULL;
