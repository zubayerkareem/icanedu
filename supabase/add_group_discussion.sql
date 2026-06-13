-- Group Discussion ISSB module
-- Run this in the Supabase SQL editor.

create table if not exists public.group_discussion_sets (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid references public.courses(id) on delete cascade,
  title        text not null,
  order_index  int  default 0,
  is_published bool default true,
  is_free      bool default false,
  created_at   timestamptz default now()
);

create table if not exists public.group_discussion_tasks (
  id          uuid primary key default gen_random_uuid(),
  set_id      uuid not null references public.group_discussion_sets(id) on delete cascade,
  heading     text not null default '',
  body        text not null default '',
  image_url   text default '',
  idea        text default '',
  order_index int  default 0
);

-- RLS
alter table public.group_discussion_sets enable row level security;

drop policy if exists "group_discussion_sets public read" on public.group_discussion_sets;
create policy "group_discussion_sets public read" on public.group_discussion_sets
  for select using (is_published = true);

drop policy if exists "group_discussion_sets admin write" on public.group_discussion_sets;
create policy "group_discussion_sets admin write" on public.group_discussion_sets
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

alter table public.group_discussion_tasks enable row level security;

drop policy if exists "group_discussion_tasks public read" on public.group_discussion_tasks;
create policy "group_discussion_tasks public read" on public.group_discussion_tasks
  for select using (true);

drop policy if exists "group_discussion_tasks admin write" on public.group_discussion_tasks;
create policy "group_discussion_tasks admin write" on public.group_discussion_tasks
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
