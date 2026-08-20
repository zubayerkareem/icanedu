-- ══════════════════════════════════════════════════════════════════════════════
-- Fix RLS performance warnings (single run — no enum changes, safe in one tx)
--
-- Fixes two Supabase Linter warning types:
--   1. auth_rls_initplan  — wraps auth.uid() in (select auth.uid()) so
--                           PostgreSQL evaluates it once per query, not per row
--   2. multiple_permissive_policies — collapses overlapping policies on
--                           admin_message_recipients into one per action
--
-- Bonus: replaces inline EXISTS admin checks with has_role() so superadmin
--        access works correctly on admin_messages and cadet_* tables.
-- ══════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- user_roles
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own roles"  ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles"   ON public.user_roles;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));


-- ─────────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Profiles are viewable by owner"   ON public.profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owner"  ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles"     ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles"   ON public.profiles;

CREATE POLICY "Profiles are viewable by owner" ON public.profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Profiles are updatable by owner" ON public.profiles
  FOR UPDATE TO authenticated
  USING      ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));


-- ─────────────────────────────────────────────────────────────────────────────
-- site_settings  (multiple policy names in DB from different migrations)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "site_settings are admin-writable" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage settings"       ON public.site_settings;
DROP POLICY IF EXISTS "admin_read_all_settings"          ON public.site_settings;
DROP POLICY IF EXISTS "admin_write_settings"             ON public.site_settings;

CREATE POLICY "site_settings are admin-writable" ON public.site_settings
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));


-- ─────────────────────────────────────────────────────────────────────────────
-- homepage_config
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admins read all homepage configs" ON public.homepage_config;
DROP POLICY IF EXISTS "admins manage homepage"           ON public.homepage_config;

CREATE POLICY "admins read all homepage configs" ON public.homepage_config
  FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "admins manage homepage" ON public.homepage_config
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));


-- ─────────────────────────────────────────────────────────────────────────────
-- ISSB content tables (all follow the same pattern)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "iq_sets admin write"               ON public.iq_sets;
DROP POLICY IF EXISTS "iq_questions admin write"          ON public.iq_questions;
DROP POLICY IF EXISTS "wat_sets admin write"              ON public.wat_sets;
DROP POLICY IF EXISTS "ist_sets admin write"              ON public.ist_sets;
DROP POLICY IF EXISTS "ist_sentences admin write"         ON public.ist_sentences;
DROP POLICY IF EXISTS "extempore_sets admin write"        ON public.extempore_sets;
DROP POLICY IF EXISTS "extempore_topics admin write"      ON public.extempore_topics;
DROP POLICY IF EXISTS "ppdt_sets admin write"             ON public.ppdt_sets;
DROP POLICY IF EXISTS "ppdt_pictures admin write"         ON public.ppdt_pictures;
DROP POLICY IF EXISTS "picture_story_sets admin write"    ON public.picture_story_sets;
DROP POLICY IF EXISTS "picture_story_pictures admin write" ON public.picture_story_pictures;
DROP POLICY IF EXISTS "incomplete_story_sets admin write" ON public.incomplete_story_sets;
DROP POLICY IF EXISTS "incomplete_stories admin write"    ON public.incomplete_stories;
DROP POLICY IF EXISTS "planning_sets admin write"         ON public.planning_sets;
DROP POLICY IF EXISTS "planning_tasks admin write"        ON public.planning_tasks;
DROP POLICY IF EXISTS "group_discussion_sets admin write"  ON public.group_discussion_sets;
DROP POLICY IF EXISTS "group_discussion_tasks admin write" ON public.group_discussion_tasks;

CREATE POLICY "iq_sets admin write" ON public.iq_sets
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "iq_questions admin write" ON public.iq_questions
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "wat_sets admin write" ON public.wat_sets
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "ist_sets admin write" ON public.ist_sets
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "ist_sentences admin write" ON public.ist_sentences
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "extempore_sets admin write" ON public.extempore_sets
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "extempore_topics admin write" ON public.extempore_topics
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "ppdt_sets admin write" ON public.ppdt_sets
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "ppdt_pictures admin write" ON public.ppdt_pictures
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "picture_story_sets admin write" ON public.picture_story_sets
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "picture_story_pictures admin write" ON public.picture_story_pictures
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "incomplete_story_sets admin write" ON public.incomplete_story_sets
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "incomplete_stories admin write" ON public.incomplete_stories
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "planning_sets admin write" ON public.planning_sets
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "planning_tasks admin write" ON public.planning_tasks
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "group_discussion_sets admin write" ON public.group_discussion_sets
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "group_discussion_tasks admin write" ON public.group_discussion_tasks
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));


-- ─────────────────────────────────────────────────────────────────────────────
-- iq_results
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "iq_results user insert"   ON public.iq_results;
DROP POLICY IF EXISTS "iq_results user read own" ON public.iq_results;

CREATE POLICY "iq_results user insert" ON public.iq_results
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "iq_results user read own" ON public.iq_results
  FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    OR public.has_role((select auth.uid()), 'admin')
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- success_stories
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin full access" ON public.success_stories;

CREATE POLICY "admin full access" ON public.success_stories
  FOR ALL
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));


-- ─────────────────────────────────────────────────────────────────────────────
-- branches
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin full access" ON public.branches;

CREATE POLICY "admin full access" ON public.branches
  FOR ALL
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));


-- ─────────────────────────────────────────────────────────────────────────────
-- student_metadata  (same pattern, not flagged yet but consistent fix)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "student_metadata own read"   ON public.student_metadata;
DROP POLICY IF EXISTS "student_metadata own insert" ON public.student_metadata;
DROP POLICY IF EXISTS "student_metadata admin read" ON public.student_metadata;

CREATE POLICY "student_metadata own read" ON public.student_metadata
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "student_metadata own insert" ON public.student_metadata
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "student_metadata admin read" ON public.student_metadata
  FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'));


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_messages  (replace inline EXISTS with has_role for superadmin compat)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_all_messages"                    ON public.admin_messages;
DROP POLICY IF EXISTS "students_read_messages_via_recipients" ON public.admin_messages;

CREATE POLICY "admin_all_messages" ON public.admin_messages
  FOR ALL TO authenticated
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

CREATE POLICY "students_read_messages_via_recipients" ON public.admin_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_message_recipients
      WHERE message_id = id
        AND user_id = (select auth.uid())
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- admin_message_recipients
-- Consolidate 3 overlapping policies → 4 non-overlapping per-action policies
-- This eliminates the multiple_permissive_policies warnings entirely.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_all_recipients"         ON public.admin_message_recipients;
DROP POLICY IF EXISTS "students_read_own_recipients" ON public.admin_message_recipients;
DROP POLICY IF EXISTS "students_update_own_read_at"  ON public.admin_message_recipients;

-- SELECT: admins see all rows; students see only their own
CREATE POLICY "recipients_select" ON public.admin_message_recipients
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR public.has_role((select auth.uid()), 'admin')
  );

-- INSERT: admins only (creating recipient rows when sending a message)
CREATE POLICY "recipients_insert" ON public.admin_message_recipients
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));

-- UPDATE: students mark own messages as read; admins can update any row
CREATE POLICY "recipients_update" ON public.admin_message_recipients
  FOR UPDATE TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR public.has_role((select auth.uid()), 'admin')
  )
  WITH CHECK (
    (select auth.uid()) = user_id
    OR public.has_role((select auth.uid()), 'admin')
  );

-- DELETE: admins only
CREATE POLICY "recipients_delete" ON public.admin_message_recipients
  FOR DELETE TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'));


-- ─────────────────────────────────────────────────────────────────────────────
-- cadet_notifications  (inline EXISTS → has_role for superadmin compat)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_cadet_notifs" ON public.cadet_notifications;

CREATE POLICY "admin_cadet_notifs" ON public.cadet_notifications
  FOR ALL
  USING      (public.has_role((select auth.uid()), 'admin'))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'));


-- ─────────────────────────────────────────────────────────────────────────────
-- cadet_notification_reads
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "own_reads"   ON public.cadet_notification_reads;
DROP POLICY IF EXISTS "admin_reads" ON public.cadet_notification_reads;

CREATE POLICY "own_reads" ON public.cadet_notification_reads
  FOR ALL
  USING      (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "admin_reads" ON public.cadet_notification_reads
  FOR SELECT
  USING (public.has_role((select auth.uid()), 'admin'));
