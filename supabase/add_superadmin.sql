-- ──────────────────────────────────────────────────────────────────────────────
-- Superadmin role migration
-- Run this in the Supabase SQL editor once.
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Extend the app_role enum with the new value (safe — only additive)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';

-- 2. Update has_role() so that superadmin passes every existing 'admin' RLS policy
--    automatically, without touching any individual policy. Superadmin always
--    satisfies has_role(uid, 'admin') as well as has_role(uid, 'superadmin').
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND (
      role = _role
      OR (_role = 'admin' AND role = 'superadmin')   -- superadmin inherits all admin rights
    )
  );
$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- After running the above, create your first superadmin with the query below.
-- Replace '<user-uuid>' with the UUID from auth.users for that account.
-- ──────────────────────────────────────────────────────────────────────────────
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<user-uuid>', 'superadmin')
-- ON CONFLICT (user_id, role) DO NOTHING;
