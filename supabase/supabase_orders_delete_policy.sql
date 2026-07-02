-- Run in Supabase SQL Editor → New Query
-- Adds DELETE permission on the orders table for authenticated (admin) users.
-- Without this, RLS silently ignores delete calls and the row stays in the DB.

CREATE POLICY "Authenticated users can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);
