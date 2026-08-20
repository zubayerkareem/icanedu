-- ──────────────────────────────────────────────────────────────────────────────
-- Superadmin role migration — TWO STEPS, run them separately in Supabase.
-- ──────────────────────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 1: Run this first, then click "Run" — stop here.
-- ════════════════════════════════════════════════════════════════════════════
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 2: After Step 1 is committed, run THIS in a NEW query (new Run click).
--         PostgreSQL requires the enum value to be committed before it can
--         be referenced in a function body.
-- ════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND (
      role = _role
      OR (_role = 'admin' AND role = 'superadmin')
    )
  );
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 3 (optional, same run as Step 2): Create your first superadmin.
--         Replace '<user-uuid>' with the UUID from auth.users.
-- ════════════════════════════════════════════════════════════════════════════
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<user-uuid>', 'superadmin')
-- ON CONFLICT (user_id, role) DO NOTHING;
