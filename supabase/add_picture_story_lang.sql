-- Add lang column to picture_story_sets
-- Values: 'bn' (Bangla) or 'en' (English), default Bangla
ALTER TABLE picture_story_sets
  ADD COLUMN IF NOT EXISTS lang text NOT NULL DEFAULT 'bn'
  CHECK (lang IN ('bn', 'en'));
