-- Cadet courses: separate one-time fee (always required) from optional monthly
-- fee (admin-controlled toggle).  Run once in Supabase SQL Editor.
--
-- Before: payment_type = 'one_time' | 'monthly'  (mutually exclusive)
-- After:  main_fee is always the one-time enrollment fee;
--         has_monthly_fee = true means a recurring monthly fee also applies.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS has_monthly_fee boolean NOT NULL DEFAULT false;

-- Migrate existing courses: any course that was 'monthly' already has a
-- monthly fee, so flag it.
UPDATE public.courses
  SET has_monthly_fee = true
  WHERE course_type = 'cadet'
    AND payment_type = 'monthly'
    AND monthly_fee IS NOT NULL;
