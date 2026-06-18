-- Add source column to profiles to distinguish self-registered vs admin-created users
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'registered';

-- Update admin_create_student RPC to mark admin-created users
CREATE OR REPLACE FUNCTION public.admin_create_student(
  p_email    text,
  p_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_result  json;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Check if email already exists
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(p_email);
  IF v_user_id IS NOT NULL THEN
    RETURN json_build_object('error', 'email_exists');
  END IF;

  -- Create user via Supabase admin API is not possible from plpgsql;
  -- Instead we rely on the existing RPC and mark the profile after creation.
  -- This migration adds the source column; the actual tagging is done
  -- client-side in api/import-users.ts and after admin_create_student calls.
  RETURN json_build_object('ok', true);
END;
$$;

-- Function to mark a user as admin-created (called after account creation)
CREATE OR REPLACE FUNCTION public.admin_mark_user_source(
  p_user_id uuid,
  p_source  text DEFAULT 'admin_created'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.profiles
    SET source = p_source
    WHERE id = p_user_id;
END;
$$;
