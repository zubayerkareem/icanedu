-- Admin → Student messaging system
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.admin_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body       text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_message_recipients (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.admin_messages(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at    timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id)
);

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_message_recipients ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "admin_all_messages" ON public.admin_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admin_all_recipients" ON public.admin_message_recipients FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Students: read their own recipient rows
CREATE POLICY "students_read_own_recipients" ON public.admin_message_recipients
  FOR SELECT USING (auth.uid() = user_id);

-- Students: mark messages as read
CREATE POLICY "students_update_own_read_at" ON public.admin_message_recipients
  FOR UPDATE USING (auth.uid() = user_id);

-- Students: read the message body for messages they are a recipient of
CREATE POLICY "students_read_messages_via_recipients" ON public.admin_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_message_recipients
      WHERE message_id = id AND user_id = auth.uid()
    )
  );
