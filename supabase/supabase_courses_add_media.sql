-- Run in Supabase SQL Editor → New Query
-- Adds videos and resources columns to the courses table

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS videos   jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS resources jsonb DEFAULT '[]';
