-- Add language field to incomplete story sets (bn = Bangla, en = English)
ALTER TABLE incomplete_story_sets ADD COLUMN IF NOT EXISTS lang text DEFAULT 'bn';
