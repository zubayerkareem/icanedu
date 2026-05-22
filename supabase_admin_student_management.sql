-- Run in Supabase SQL Editor → New Query
-- Enables admin to delete students and reset passwords

-- Allow admins to delete profiles and roles
CREATE POLICY "Authenticated users can delete profiles"
  ON profiles FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete user_roles"
  ON user_roles FOR DELETE TO authenticated USING (true);

-- Return all user IDs + emails for the admin students list
CREATE OR REPLACE FUNCTION admin_list_users()
RETURNS TABLE(id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email::text FROM auth.users ORDER BY created_at DESC;
$$;

-- Hard-delete a user from auth (cascades to profiles via FK)
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
