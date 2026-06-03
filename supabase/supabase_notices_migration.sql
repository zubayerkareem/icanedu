-- Run in Supabase SQL Editor → New Query
-- Creates the notices table with seed data

CREATE TABLE IF NOT EXISTS notices (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         text        NOT NULL,
  content       text        NOT NULL DEFAULT '',
  badge         text        NOT NULL DEFAULT 'ঘোষণা',
  badge_variant text        NOT NULL DEFAULT 'secondary'
                            CHECK (badge_variant IN ('default','secondary','destructive','outline')),
  is_published  boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published notices"
  ON notices FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage notices"
  ON notices FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── Seed existing notices ──────────────────────────────────
INSERT INTO notices (title, content, badge, badge_variant, created_at) VALUES
(
  '২০২৬ সালের ভর্তি পরীক্ষার সময়সূচি প্রকাশিত হয়েছে',
  '<p>আগামী ১৫ মে থেকে ভর্তি পরীক্ষা শুরু হবে। সকল আবেদনকারীকে যথাসময়ে হলে উপস্থিত থাকার অনুরোধ করা হচ্ছে।</p>',
  'জরুরি', 'destructive', '2026-04-28T00:00:00Z'
),
(
  'ওয়েব ডেভেলপমেন্ট কোর্সের নতুন ব্যাচ শুরু হচ্ছে',
  '<p>আগামী ১ মে থেকে ওয়েব ডেভেলপমেন্টের নতুন ব্যাচ শুরু হবে। আসন সংখ্যা সীমিত, তাই দ্রুত নিবন্ধন করুন।</p>',
  'নতুন', 'default', '2026-04-25T00:00:00Z'
),
(
  'ঈদ উপলক্ষে সকল কোর্সে ৩০% ছাড়',
  '<p>ঈদুল ফিতর উপলক্ষে iCANBD-এর সকল কোর্সে বিশেষ ৩০% ছাড় দেওয়া হচ্ছে। অফারটি ৫ মে পর্যন্ত বৈধ।</p>',
  'ঘোষণা', 'secondary', '2026-04-20T00:00:00Z'
),
(
  'গ্রাফিক ডিজাইন কোর্সের সিলেবাস আপডেট করা হয়েছে',
  '<p>Adobe Illustrator ও Figma-র নতুন মডিউল যুক্ত করা হয়েছে। বর্তমান শিক্ষার্থীরা বিনামূল্যে নতুন কন্টেন্ট পাবেন।</p>',
  'আপডেট', 'secondary', '2026-04-15T00:00:00Z'
),
(
  'বিনামূল্যে লাইভ ওয়েবিনার — ফ্রিল্যান্সিং শুরু করবেন কীভাবে?',
  '<p>আগামী শুক্রবার রাত ৯টায় বিশেষ লাইভ সেশন অনুষ্ঠিত হবে। নিবন্ধন করুন এবং সরাসরি বিশেষজ্ঞদের কাছ থেকে শিখুন।</p>',
  'ইভেন্ট', 'default', '2026-04-10T00:00:00Z'
);
