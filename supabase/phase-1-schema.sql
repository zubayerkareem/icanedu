-- ============================================================
--  IcanBD — Phase 1 schema (run once in your Supabase SQL editor)
--  Copy this whole file and paste into:
--    Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1. App role enum + user_roles table (roles live OUTSIDE profiles)
do $$ begin
  create type public.app_role as enum ('admin', 'student');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- security-definer role check (avoids recursive RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Admins can manage roles" on public.user_roles;
create policy "Admins can manage roles"
on public.user_roles for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));


-- 2. profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));


-- 3. Auto-create profile + default 'student' role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


-- 4. site_settings — public read, admin-only write
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings are publicly readable" on public.site_settings;
create policy "site_settings are publicly readable"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "site_settings are admin-writable" on public.site_settings;
create policy "site_settings are admin-writable"
on public.site_settings for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Seed defaults
insert into public.site_settings (key, value) values
  ('heading_font',    '"Hind Siliguri"'::jsonb),
  ('body_font',       '"Hind Siliguri"'::jsonb),
  ('primary_color',   '"#1a2332"'::jsonb),
  ('accent_color',    '"#2563eb"'::jsonb),
  ('tagline',         '"আপনার শিক্ষার সঙ্গী"'::jsonb),
  ('contact_email',   '""'::jsonb),
  ('contact_phone',   '""'::jsonb),
  ('contact_address', '""'::jsonb),
  ('facebook_url',    '""'::jsonb),
  ('youtube_url',     '""'::jsonb),
  ('telegram_url',    '""'::jsonb),
  ('logo_url',        '""'::jsonb)
on conflict (key) do nothing;


-- 5. Helper: promote yourself to admin (run AFTER you sign up)
--    Replace the email below with your own:
--
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = 'you@example.com'
--   on conflict (user_id, role) do nothing;
