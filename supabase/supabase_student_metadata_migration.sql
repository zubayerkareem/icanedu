-- Run in Supabase SQL Editor after phase-1-schema.sql
-- Stores one-time student identifiers that cannot be changed once set.
-- No UPDATE policy is intentional — immutability enforced at the DB level.

CREATE TABLE IF NOT EXISTS public.student_metadata (
  user_id         uuid    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  issb_id         text,
  service_branch  text    CHECK (service_branch IN ('army', 'navy', 'others')),
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.student_metadata ENABLE ROW LEVEL SECURITY;

-- Student reads own row
DROP POLICY IF EXISTS "student_metadata own read" ON public.student_metadata;
CREATE POLICY "student_metadata own read" ON public.student_metadata
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Student inserts own row exactly once (PRIMARY KEY prevents duplicates)
DROP POLICY IF EXISTS "student_metadata own insert" ON public.student_metadata;
CREATE POLICY "student_metadata own insert" ON public.student_metadata
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE policy for students — row is immutable after insert.

-- Admins can read all rows (for student management panel)
DROP POLICY IF EXISTS "student_metadata admin read" ON public.student_metadata;
CREATE POLICY "student_metadata admin read" ON public.student_metadata
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
