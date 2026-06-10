-- Success stories table
-- Run once in your Supabase SQL editor

create table if not exists public.success_stories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null check (category in ('issb', 'cadet')),
  image_url   text,
  description text,
  show_on_homepage boolean not null default false,
  is_published     boolean not null default true,
  order_index int  default 0,
  created_at  timestamptz default now()
);

alter table public.success_stories enable row level security;

create policy "public read published"
  on public.success_stories for select
  using (is_published = true);

create policy "admin full access"
  on public.success_stories for all
  using (public.has_role(auth.uid(), 'admin'));
