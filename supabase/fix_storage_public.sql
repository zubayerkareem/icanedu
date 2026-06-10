-- Run once in Supabase SQL editor
-- Makes course-media bucket publicly readable so uploaded images load everywhere

-- 1. Set bucket to public
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-media', 'course-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow anyone to read objects in the bucket
DROP POLICY IF EXISTS "Public read course-media" ON storage.objects;
CREATE POLICY "Public read course-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-media');
