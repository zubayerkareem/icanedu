-- Add course_ids array column to all 9 ISSB set tables.
-- Run this in Supabase SQL Editor before deploying the frontend changes.

ALTER TABLE public.iq_sets               ADD COLUMN IF NOT EXISTS course_ids uuid[] DEFAULT '{}';
ALTER TABLE public.wat_sets              ADD COLUMN IF NOT EXISTS course_ids uuid[] DEFAULT '{}';
ALTER TABLE public.ist_sets              ADD COLUMN IF NOT EXISTS course_ids uuid[] DEFAULT '{}';
ALTER TABLE public.extempore_sets        ADD COLUMN IF NOT EXISTS course_ids uuid[] DEFAULT '{}';
ALTER TABLE public.ppdt_sets             ADD COLUMN IF NOT EXISTS course_ids uuid[] DEFAULT '{}';
ALTER TABLE public.picture_story_sets    ADD COLUMN IF NOT EXISTS course_ids uuid[] DEFAULT '{}';
ALTER TABLE public.incomplete_story_sets ADD COLUMN IF NOT EXISTS course_ids uuid[] DEFAULT '{}';
ALTER TABLE public.planning_sets         ADD COLUMN IF NOT EXISTS course_ids uuid[] DEFAULT '{}';
ALTER TABLE public.group_discussion_sets ADD COLUMN IF NOT EXISTS course_ids uuid[] DEFAULT '{}';

-- Migrate existing single course_id values into the new array column.
UPDATE public.iq_sets               SET course_ids = ARRAY[course_id] WHERE course_id IS NOT NULL;
UPDATE public.wat_sets              SET course_ids = ARRAY[course_id] WHERE course_id IS NOT NULL;
UPDATE public.ist_sets              SET course_ids = ARRAY[course_id] WHERE course_id IS NOT NULL;
UPDATE public.extempore_sets        SET course_ids = ARRAY[course_id] WHERE course_id IS NOT NULL;
UPDATE public.ppdt_sets             SET course_ids = ARRAY[course_id] WHERE course_id IS NOT NULL;
UPDATE public.picture_story_sets    SET course_ids = ARRAY[course_id] WHERE course_id IS NOT NULL;
UPDATE public.incomplete_story_sets SET course_ids = ARRAY[course_id] WHERE course_id IS NOT NULL;
UPDATE public.planning_sets         SET course_ids = ARRAY[course_id] WHERE course_id IS NOT NULL;
UPDATE public.group_discussion_sets SET course_ids = ARRAY[course_id] WHERE course_id IS NOT NULL;

-- The original course_id column is kept for backward compatibility.
