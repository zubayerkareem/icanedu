-- Run in Supabase SQL Editor → New Query
-- ISSB Practice Modules: creates all content tables + iq_results + RLS.
-- Reuses public.has_role(auth.uid(), 'admin') from phase-1-schema.sql.

-- ─────────────────────────────────────────────────────────────
-- IQ PRACTICE
-- ─────────────────────────────────────────────────────────────
create table if not exists public.iq_sets (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid references public.courses(id) on delete cascade,
  title         text not null,
  description   text default '',
  timer_seconds int  default 300,
  order_index   int  default 0,
  is_published  bool default true,
  created_at    timestamptz default now()
);

create table if not exists public.iq_questions (
  id          uuid primary key default gen_random_uuid(),
  set_id      uuid not null references public.iq_sets(id) on delete cascade,
  text        text not null,
  image_url   text,
  options     jsonb not null default '[]',  -- [{id, text}]
  correct     text  not null,              -- option id
  order_index int   default 0
);

-- ─────────────────────────────────────────────────────────────
-- WAT (Word Association Test)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.wat_sets (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid references public.courses(id) on delete cascade,
  title        text  not null,
  words        jsonb not null default '[]',  -- string[]
  word_seconds int   default 10,
  order_index  int   default 0,
  is_published bool  default true,
  created_at   timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- IST (Intelligence Subjective Test)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ist_sets (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid references public.courses(id) on delete cascade,
  title         text not null,
  timer_seconds int  default 300,
  order_index   int  default 0,
  is_published  bool default true,
  created_at    timestamptz default now()
);

create table if not exists public.ist_sentences (
  id          uuid primary key default gen_random_uuid(),
  set_id      uuid not null references public.ist_sets(id) on delete cascade,
  stem        text not null,
  example     text default '',
  order_index int  default 0
);

-- ─────────────────────────────────────────────────────────────
-- EXTEMPORE / SRT / GTO
-- ─────────────────────────────────────────────────────────────
create table if not exists public.extempore_sets (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid references public.courses(id) on delete cascade,
  title         text not null,
  timer_seconds int  default 1500,  -- 25 minutes
  order_index   int  default 0,
  is_published  bool default true,
  created_at    timestamptz default now()
);

create table if not exists public.extempore_topics (
  id           uuid primary key default gen_random_uuid(),
  set_id       uuid not null references public.extempore_sets(id) on delete cascade,
  topic        text  not null,
  category     text  default 'general',
  hint         text  default '',
  model_points jsonb default '[]',  -- string[]
  model_essay  text  default '',
  order_index  int   default 0
);

-- ─────────────────────────────────────────────────────────────
-- PPDT (Picture Perception & Discussion Test)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ppdt_sets (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid references public.courses(id) on delete cascade,
  title           text not null,
  observe_seconds int  default 30,
  write_seconds   int  default 270,
  order_index     int  default 0,
  is_published    bool default true,
  created_at      timestamptz default now()
);

create table if not exists public.ppdt_pictures (
  id             uuid primary key default gen_random_uuid(),
  set_id         uuid not null references public.ppdt_sets(id) on delete cascade,
  picture_number int  not null,
  image_url      text not null,
  title          text default '',
  idea           text default '',
  order_index    int  default 0
);

-- ─────────────────────────────────────────────────────────────
-- PICTURE STORY
-- ─────────────────────────────────────────────────────────────
create table if not exists public.picture_story_sets (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid references public.courses(id) on delete cascade,
  title           text not null,
  observe_seconds int  default 30,
  write_seconds   int  default 60,
  order_index     int  default 0,
  is_published    bool default true,
  created_at      timestamptz default now()
);

create table if not exists public.picture_story_pictures (
  id             uuid primary key default gen_random_uuid(),
  set_id         uuid not null references public.picture_story_sets(id) on delete cascade,
  picture_number int  not null,
  image_url      text not null,
  title          text default '',
  idea           text default '',
  order_index    int  default 0
);

-- ─────────────────────────────────────────────────────────────
-- INCOMPLETE STORY
-- ─────────────────────────────────────────────────────────────
create table if not exists public.incomplete_story_sets (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid references public.courses(id) on delete cascade,
  title        text not null,
  order_index  int  default 0,
  is_published bool default true,
  created_at   timestamptz default now()
);

create table if not exists public.incomplete_stories (
  id                  uuid primary key default gen_random_uuid(),
  set_id              uuid not null references public.incomplete_story_sets(id) on delete cascade,
  title               text not null,
  instruction         text default '',
  body                text not null,
  word_limit          int  default 200,
  time_guide_minutes  int  default 10,
  idea                text default '',
  order_index         int  default 0
);

-- ─────────────────────────────────────────────────────────────
-- IQ RESULTS (student scores)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.iq_results (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade,
  set_id              uuid references public.iq_sets(id) on delete cascade,
  course_id           uuid references public.courses(id) on delete set null,
  score               int  not null,
  total               int  not null,
  answers             jsonb default '{}',  -- {questionId: optionId}
  time_taken_seconds  int  default 0,
  completed_at        timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- RLS — Content tables (public read, admin write)
-- ─────────────────────────────────────────────────────────────
do $$ begin
  -- Helper to apply standard content RLS to a table
  -- Run for each set table
end $$;

-- iq_sets
alter table public.iq_sets enable row level security;
drop policy if exists "iq_sets public read" on public.iq_sets;
create policy "iq_sets public read" on public.iq_sets for select using (is_published = true);
drop policy if exists "iq_sets admin write" on public.iq_sets;
create policy "iq_sets admin write" on public.iq_sets for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- iq_questions (public read via join, admin write)
alter table public.iq_questions enable row level security;
drop policy if exists "iq_questions public read" on public.iq_questions;
create policy "iq_questions public read" on public.iq_questions for select using (true);
drop policy if exists "iq_questions admin write" on public.iq_questions;
create policy "iq_questions admin write" on public.iq_questions for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- wat_sets
alter table public.wat_sets enable row level security;
drop policy if exists "wat_sets public read" on public.wat_sets;
create policy "wat_sets public read" on public.wat_sets for select using (is_published = true);
drop policy if exists "wat_sets admin write" on public.wat_sets;
create policy "wat_sets admin write" on public.wat_sets for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ist_sets
alter table public.ist_sets enable row level security;
drop policy if exists "ist_sets public read" on public.ist_sets;
create policy "ist_sets public read" on public.ist_sets for select using (is_published = true);
drop policy if exists "ist_sets admin write" on public.ist_sets;
create policy "ist_sets admin write" on public.ist_sets for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ist_sentences
alter table public.ist_sentences enable row level security;
drop policy if exists "ist_sentences public read" on public.ist_sentences;
create policy "ist_sentences public read" on public.ist_sentences for select using (true);
drop policy if exists "ist_sentences admin write" on public.ist_sentences;
create policy "ist_sentences admin write" on public.ist_sentences for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- extempore_sets
alter table public.extempore_sets enable row level security;
drop policy if exists "extempore_sets public read" on public.extempore_sets;
create policy "extempore_sets public read" on public.extempore_sets for select using (is_published = true);
drop policy if exists "extempore_sets admin write" on public.extempore_sets;
create policy "extempore_sets admin write" on public.extempore_sets for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- extempore_topics
alter table public.extempore_topics enable row level security;
drop policy if exists "extempore_topics public read" on public.extempore_topics;
create policy "extempore_topics public read" on public.extempore_topics for select using (true);
drop policy if exists "extempore_topics admin write" on public.extempore_topics;
create policy "extempore_topics admin write" on public.extempore_topics for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ppdt_sets
alter table public.ppdt_sets enable row level security;
drop policy if exists "ppdt_sets public read" on public.ppdt_sets;
create policy "ppdt_sets public read" on public.ppdt_sets for select using (is_published = true);
drop policy if exists "ppdt_sets admin write" on public.ppdt_sets;
create policy "ppdt_sets admin write" on public.ppdt_sets for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ppdt_pictures
alter table public.ppdt_pictures enable row level security;
drop policy if exists "ppdt_pictures public read" on public.ppdt_pictures;
create policy "ppdt_pictures public read" on public.ppdt_pictures for select using (true);
drop policy if exists "ppdt_pictures admin write" on public.ppdt_pictures;
create policy "ppdt_pictures admin write" on public.ppdt_pictures for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- picture_story_sets
alter table public.picture_story_sets enable row level security;
drop policy if exists "picture_story_sets public read" on public.picture_story_sets;
create policy "picture_story_sets public read" on public.picture_story_sets for select using (is_published = true);
drop policy if exists "picture_story_sets admin write" on public.picture_story_sets;
create policy "picture_story_sets admin write" on public.picture_story_sets for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- picture_story_pictures
alter table public.picture_story_pictures enable row level security;
drop policy if exists "picture_story_pictures public read" on public.picture_story_pictures;
create policy "picture_story_pictures public read" on public.picture_story_pictures for select using (true);
drop policy if exists "picture_story_pictures admin write" on public.picture_story_pictures;
create policy "picture_story_pictures admin write" on public.picture_story_pictures for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- incomplete_story_sets
alter table public.incomplete_story_sets enable row level security;
drop policy if exists "incomplete_story_sets public read" on public.incomplete_story_sets;
create policy "incomplete_story_sets public read" on public.incomplete_story_sets for select using (is_published = true);
drop policy if exists "incomplete_story_sets admin write" on public.incomplete_story_sets;
create policy "incomplete_story_sets admin write" on public.incomplete_story_sets for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- incomplete_stories
alter table public.incomplete_stories enable row level security;
drop policy if exists "incomplete_stories public read" on public.incomplete_stories;
create policy "incomplete_stories public read" on public.incomplete_stories for select using (true);
drop policy if exists "incomplete_stories admin write" on public.incomplete_stories;
create policy "incomplete_stories admin write" on public.incomplete_stories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ─────────────────────────────────────────────────────────────
-- RLS — iq_results (users write/read own; admin reads all)
-- ─────────────────────────────────────────────────────────────
alter table public.iq_results enable row level security;

drop policy if exists "iq_results user insert" on public.iq_results;
create policy "iq_results user insert" on public.iq_results for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "iq_results user read own" on public.iq_results;
create policy "iq_results user read own" on public.iq_results for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
