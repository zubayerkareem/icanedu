-- Add manual display_order column to courses table.
-- Run once in Supabase SQL Editor.

ALTER TABLE courses ADD COLUMN IF NOT EXISTS display_order integer;

-- Safely create update policy only if it doesn't already exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'courses'
      AND policyname = 'Admin can update course order'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admin can update course order"
        ON courses FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true)
    $policy$;
  END IF;
END $$;
