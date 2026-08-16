-- Cadet course payment plans (one-time fee vs. monthly subscription) + manual
-- per-enrollment payment status, reconciled by admin (no automated recurring
-- billing gateway — bKash/bank/cash confirmed manually).
-- Run once in your Supabase SQL editor.

alter table public.courses
  add column if not exists payment_type text default 'one_time' check (payment_type in ('one_time', 'monthly')),
  add column if not exists main_fee numeric,
  add column if not exists monthly_fee numeric;

alter table public.orders
  add column if not exists payment_status text default 'complete' check (payment_status in ('due', 'complete')),
  add column if not exists payment_due_date timestamptz;
