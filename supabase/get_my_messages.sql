-- Run this in Supabase SQL Editor
-- Replaces the broken RLS-based approach for students reading their messages

CREATE OR REPLACE FUNCTION public.get_my_messages()
RETURNS TABLE (
  recipient_id uuid,
  message_id   uuid,
  body         text,
  created_at   timestamptz,
  read_at      timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id         AS recipient_id,
    r.message_id,
    m.body,
    m.created_at,
    r.read_at
  FROM admin_message_recipients r
  JOIN admin_messages m ON m.id = r.message_id
  WHERE r.user_id = auth.uid()
  ORDER BY r.read_at ASC NULLS FIRST, m.created_at DESC;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_messages() TO authenticated;
