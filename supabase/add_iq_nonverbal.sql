-- Add verbal/non-verbal type to IQ sets
ALTER TABLE iq_sets      ADD COLUMN IF NOT EXISTS type        text DEFAULT 'verbal';

-- Add explanation field to IQ questions (used for non-verbal sets)
ALTER TABLE iq_questions ADD COLUMN IF NOT EXISTS explanation text;
