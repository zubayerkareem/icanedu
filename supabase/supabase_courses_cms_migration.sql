-- Run in Supabase SQL Editor → New Query
-- Course CMS migration: storage bucket, new course columns, coupon support.
-- Reuses public.has_role(auth.uid(), 'admin') from phase-1-schema.sql.

-- ─────────────────────────────────────────────────────────────
-- 1. Storage bucket for course media (thumbnails + PDF resources)
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('course-media', 'course-media', true)
on conflict (id) do nothing;

-- Public read (so <img>, iframe and downloads work with the anon key)
drop policy if exists "course-media public read" on storage.objects;
create policy "course-media public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'course-media');

-- Admin-only write
drop policy if exists "course-media admin insert" on storage.objects;
create policy "course-media admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'course-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "course-media admin update" on storage.objects;
create policy "course-media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'course-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "course-media admin delete" on storage.objects;
create policy "course-media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'course-media' and public.has_role(auth.uid(), 'admin'));

-- ─────────────────────────────────────────────────────────────
-- 2. New columns on courses
--    (per-module isFree and per-lesson video_url/pdf_url/content/isFree
--     ride inside the existing `modules` jsonb — no migration needed)
-- ─────────────────────────────────────────────────────────────
alter table public.courses
  add column if not exists coupons         jsonb default '[]',
  add column if not exists highlight_items jsonb default '[]',
  add column if not exists feature_items   jsonb default '[]';

-- ─────────────────────────────────────────────────────────────
-- 3. Record applied coupon on the order
-- ─────────────────────────────────────────────────────────────
alter table public.orders
  add column if not exists coupon_code text;

-- ─────────────────────────────────────────────────────────────
-- 4. Atomic coupon usage increment (called after a successful order)
-- ─────────────────────────────────────────────────────────────
create or replace function public.increment_coupon_use(p_course_id uuid, p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.courses
  set coupons = (
    select jsonb_agg(
      case when (c->>'code') = p_code
        then jsonb_set(c, '{used_count}', to_jsonb(coalesce((c->>'used_count')::int, 0) + 1))
        else c
      end
    )
    from jsonb_array_elements(coupons) c
  )
  where id = p_course_id;
$$;
