-- Run once in Supabase SQL editor

-- 1. Add validity column to orders
alter table public.orders add column if not exists valid_until timestamptz;

-- ─────────────────────────────────────────────────────────────────
-- 2. RPC: enroll a student in a course by email (admin only)
-- ─────────────────────────────────────────────────────────────────
create or replace function admin_enroll_student(
  p_email       text,
  p_course_id   text,
  p_course_name text,
  p_valid_until timestamptz default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid;
  v_name     text;
  v_order_id uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Not authorized';
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(p_email);

  if v_user_id is null then
    return json_build_object('error', 'user_not_found');
  end if;

  select full_name into v_name from public.profiles where id = v_user_id;

  if exists (
    select 1 from public.orders
    where user_id   = v_user_id
      and product_id = p_course_id
      and order_type = 'course'
      and status in ('confirmed', 'shipped', 'delivered')
      and (valid_until is null or valid_until > now())
  ) then
    return json_build_object('error', 'already_enrolled');
  end if;

  insert into public.orders (
    user_id, product_id, product_name, order_type,
    status, valid_until, customer_name,
    phone, product_price, shipping_cost, total_price
  ) values (
    v_user_id, p_course_id, p_course_name, 'course',
    'confirmed', p_valid_until, coalesce(v_name, p_email),
    '', 0, 0, 0
  ) returning id into v_order_id;

  return json_build_object('success', true, 'order_id', v_order_id, 'user_id', v_user_id);
end;
$$;

-- ─────────────────────────────────────────────────────────────────
-- 3. RPC: create a student account manually (admin only)
-- ─────────────────────────────────────────────────────────────────
create or replace function admin_create_student(
  p_email    text,
  p_password text
)
returns json
language plpgsql
security definer
set search_path = auth, public, extensions
as $$
declare
  v_user_id uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Not authorized';
  end if;

  if exists (select 1 from auth.users where lower(email) = lower(p_email)) then
    return json_build_object('error', 'email_exists');
  end if;

  v_user_id := gen_random_uuid();

  insert into auth.users (
    id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    aud, role,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values (
    v_user_id,
    lower(p_email),
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    'authenticated', 'authenticated',
    '', '', '', ''
  );

  insert into public.profiles (id, full_name, phone, avatar_url)
  values (v_user_id, null, null, null)
  on conflict (id) do nothing;

  return json_build_object('success', true, 'user_id', v_user_id);
end;
$$;
