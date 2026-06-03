-- ══════════════════════════════════════════════════════════
-- Run in Supabase SQL Editor → New Query
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS courses (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title            text        NOT NULL,
  slug             text        UNIQUE,
  category         text,
  thumbnail_url    text,
  duration         text,
  price            numeric,
  discount_price   numeric,
  discount_ends_at timestamptz,
  short_description text,
  long_description  text,
  total_lessons    integer     DEFAULT 0,
  enrollment_count integer     DEFAULT 0,
  teacher_name     text,
  teacher_avatar   text,
  teacher_short_bio text,
  teacher_long_bio  text,
  includes         jsonb       DEFAULT '{}',
  modules          jsonb       DEFAULT '[]',
  reviews          jsonb       DEFAULT '[]',
  highlights       text[]      DEFAULT '{}',
  rating_average   numeric     DEFAULT 0,
  rating_count     integer     DEFAULT 0,
  is_published     boolean     DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published courses"
  ON courses FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage courses"
  ON courses FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── Dummy course: ISSB Psychological Test Mastery ──────────
INSERT INTO courses (
  id, title, slug, category, thumbnail_url, duration,
  price, short_description, long_description,
  total_lessons, enrollment_count,
  teacher_name, teacher_short_bio, teacher_long_bio,
  highlights, includes, reviews,
  rating_average, rating_count, is_published
) VALUES (
  gen_random_uuid(),
  'ISSB Psychological Test Mastery',
  'issb-psychological-test',
  'ISSB',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop',
  '২০ ঘণ্টা',
  2500,
  'Word Association, Thematic Apperception Test, Situation Reaction Test — সম্পূর্ণ গাইড।',
  'এই কোর্সটি শূন্য থেকে শুরু করে অ্যাডভান্সড পর্যায় পর্যন্ত সাজানো হয়েছে।',
  32,
  1860,
  'ড. নাহিদ সুলতান',
  'মনোবিজ্ঞানী, ISSB পরামর্শদাতা',
  'ড. নাহিদ সুলতান একজন অভিজ্ঞ শিক্ষক, যিনি গত ১০ বছর ধরে এই বিষয়ে কাজ করছেন। তিনি দেশ-বিদেশের অনেক প্রতিষ্ঠানে প্রশিক্ষণ দিয়েছেন এবং হাজারো শিক্ষার্থীকে সফল ক্যারিয়ার গড়তে সহায়তা করেছেন।',
  ARRAY['বাস্তব প্রজেক্ট-ভিত্তিক শেখা','আজীবন অ্যাক্সেস','বাংলায় বিস্তারিত ব্যাখ্যা','সার্টিফিকেট প্রদান'],
  '{"videos":48,"pdfs":12,"quizzes":8,"assignments":5,"lifetime_access":true,"certificate":true}'::jsonb,
  '[
    {"id":"r1","name":"তানভীর আহমেদ","rating":5,"comment":"অসাধারণ কোর্স! প্রতিটি বিষয় বিস্তারিতভাবে বুঝিয়ে দেয়া হয়েছে।"},
    {"id":"r2","name":"ফারহানা ইসলাম","rating":5,"comment":"কোর্সটি করে আমি আমার লক্ষ্যে পৌঁছাতে পেরেছি। সবাইকে রিকমেন্ড করব।"},
    {"id":"r3","name":"সাব্বির হোসেন","rating":4,"comment":"ভালো কোর্স, তবে আরও কিছু প্র্যাকটিক্যাল উদাহরণ থাকলে আরও ভালো হতো।"}
  ]'::jsonb,
  4.8,
  420,
  true
) ON CONFLICT (slug) DO NOTHING;
