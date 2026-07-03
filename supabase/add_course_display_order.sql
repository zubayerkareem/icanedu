-- Add manual display_order column to courses table.
-- Run once in Supabase SQL Editor.

ALTER TABLE courses ADD COLUMN IF NOT EXISTS display_order integer;

-- Allow authenticated (admin) users to update display_order.
-- If you already have an update policy for courses, this may already be covered.
CREATE POLICY IF NOT EXISTS "Admin can update course order"
  ON courses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
