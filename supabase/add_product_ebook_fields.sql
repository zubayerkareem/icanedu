-- Add ebook support columns to the products table.
-- Run this in Supabase SQL Editor before deploying the frontend changes.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_type   text    DEFAULT 'physical',  -- 'physical' | 'ebook'
  ADD COLUMN IF NOT EXISTS pdf_url        text,
  ADD COLUMN IF NOT EXISTS allow_download boolean DEFAULT false;
