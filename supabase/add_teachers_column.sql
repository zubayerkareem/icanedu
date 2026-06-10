-- Add multi-teacher JSONB column to courses table
-- Run this once in your Supabase SQL editor

alter table public.courses
  add column if not exists teachers jsonb not null default '[]';
