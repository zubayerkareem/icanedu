-- Run this in Supabase SQL Editor if the Students page shows an error.
-- It allows authenticated (admin) users to read all profiles.

-- Allow admins to read all profiles
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to read all user_roles
CREATE POLICY "Authenticated users can read user_roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);
