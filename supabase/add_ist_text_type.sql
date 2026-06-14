-- Add text_type column to ist_sets for Bangla / English filtering
ALTER TABLE public.ist_sets
  ADD COLUMN IF NOT EXISTS text_type text NOT NULL DEFAULT 'Bangla';
