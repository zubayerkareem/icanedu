-- Cadet Course System — run once in Supabase SQL Editor.
-- Safe to run on a live DB; uses IF NOT EXISTS / IF EXISTS guards.

-- ── 1. Add cadet columns to courses ──────────────────────────────────────────
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS course_type            text    DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS cadet_assignment_url   text,
  ADD COLUMN IF NOT EXISTS cadet_homework_url     text,
  ADD COLUMN IF NOT EXISTS cadet_attendance_url   text;

-- ── 2. Cadet notifications (admin → enrolled students of a cadet course) ──────
CREATE TABLE IF NOT EXISTS public.cadet_notifications (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id   uuid        REFERENCES public.courses(id) ON DELETE CASCADE,
  title       text        NOT NULL DEFAULT '',
  body        text,              -- TipTap HTML
  class_link  text,
  created_by  uuid,
  created_at  timestamptz DEFAULT now()
);

-- ── 3. Read receipts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cadet_notification_reads (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id uuid        REFERENCES public.cadet_notifications(id) ON DELETE CASCADE,
  user_id         uuid,
  read_at         timestamptz DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- ── 4. RLS — cadet_notifications ─────────────────────────────────────────────
ALTER TABLE public.cadet_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_cadet_notifs"  ON public.cadet_notifications;
DROP POLICY IF EXISTS "admin_cadet_notifs" ON public.cadet_notifications;

-- Everyone can read (enrolled status enforced in app layer)
CREATE POLICY "read_cadet_notifs" ON public.cadet_notifications
  FOR SELECT USING (true);

-- Only admins can insert / update / delete
CREATE POLICY "admin_cadet_notifs" ON public.cadet_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ── 5. RLS — cadet_notification_reads ────────────────────────────────────────
ALTER TABLE public.cadet_notification_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_reads"   ON public.cadet_notification_reads;
DROP POLICY IF EXISTS "admin_reads" ON public.cadet_notification_reads;

-- Students can read/write only their own rows
CREATE POLICY "own_reads" ON public.cadet_notification_reads
  FOR ALL USING (user_id = auth.uid());

-- Admins can see all reads (for analytics)
CREATE POLICY "admin_reads" ON public.cadet_notification_reads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
