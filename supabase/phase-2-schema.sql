-- ============================================================
--  IcanBD — Phase 2 schema (homepage page builder)
--  Run AFTER phase-1-schema.sql in Supabase SQL Editor.
-- ============================================================

-- homepage_config: stores the ordered JSON of homepage sections.
-- Two rows max in practice:
--   status = 'draft'     → admin's working copy
--   status = 'published' → live homepage (read by public site)
create table if not exists public.homepage_config (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('draft','published')),
  sections_json jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  unique (status)
);

alter table public.homepage_config enable row level security;

-- Public read: only the published row
drop policy if exists "homepage published is public" on public.homepage_config;
create policy "homepage published is public"
on public.homepage_config for select
to anon, authenticated
using (status = 'published');

-- Admins can read both draft and published
drop policy if exists "admins read all homepage configs" on public.homepage_config;
create policy "admins read all homepage configs"
on public.homepage_config for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Admins can write
drop policy if exists "admins manage homepage" on public.homepage_config;
create policy "admins manage homepage"
on public.homepage_config for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Seed empty draft + published rows so upserts on (status) always have a row
insert into public.homepage_config (status, sections_json) values
  ('draft',     '[]'::jsonb),
  ('published', '[]'::jsonb)
on conflict (status) do nothing;
