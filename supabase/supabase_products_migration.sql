-- Products table + RLS + seed data
CREATE TABLE IF NOT EXISTS products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  slug             text UNIQUE,
  category         text,
  image_url        text,
  images           jsonb DEFAULT '[]',
  price            numeric(10,2),
  discount_price   numeric(10,2),
  short_description text,
  long_description  text,
  in_stock         boolean DEFAULT true,
  delivery_info    text,
  contact_info     text,
  sales_count      integer DEFAULT 0,
  is_published     boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published products" ON products;
DROP POLICY IF EXISTS "Authenticated full access on products" ON products;

CREATE POLICY "Public read published products"
  ON products FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated full access on products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed the 8 existing products (skips if slug already exists)
INSERT INTO products (name, slug, category, image_url, price, discount_price, short_description, long_description, delivery_info, contact_info, in_stock, sales_count, created_at)
VALUES
  (
    'ISSB সম্পূর্ণ গাইড বই', 'issb-complete-guide-book', 'বই',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    850, 599,
    'ISSB-র লিখিত, মনস্তাত্ত্বিক, গ্রুপ টাস্ক ও ইন্টারভিউ — সব ধাপের সম্পূর্ণ গাইড।',
    'এই বইয়ে ISSB-র প্রতিটি ধাপের বিস্তারিত আলোচনা, কৌশল ও নমুনা প্রশ্নোত্তর রয়েছে।',
    '৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।', '০১৭০০-০০০০০০', true, 1240, '2026-04-01T08:00:00Z'
  ),
  (
    'ISSB সাইকোলজিক্যাল টেস্ট বই', 'issb-psychological-test-book', 'বই',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80',
    650, 449,
    'WAT, TAT, SRT ও SDT — ISSB মনস্তাত্ত্বিক পরীক্ষার সম্পূর্ণ প্রস্তুতি বই।',
    'এই বইয়ে ISSB-র চারটি মনস্তাত্ত্বিক পরীক্ষার জন্য বিস্তারিত কৌশল ও প্রচুর অনুশীলনী রয়েছে।',
    '৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।', '০১৭০০-০০০০০০', true, 980, '2026-03-20T08:00:00Z'
  ),
  (
    'ISSB প্রশ্নব্যাংক (বিগত ১০ বছর)', 'issb-question-bank', 'প্রশ্নব্যাংক',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    750, 549,
    'বিগত ১০ বছরের ISSB লিখিত পরীক্ষার প্রশ্ন ও সমাধান একটি বইয়ে।',
    'ISSB লিখিত পরীক্ষার বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞানের বিগত প্রশ্নের সমাহার।',
    '৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।', null, true, 760, '2026-03-10T08:00:00Z'
  ),
  (
    'ক্যাডেট কলেজ ভর্তি গাইড', 'cadet-complete-guide', 'বই',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    700, 499,
    'ক্যাডেট কলেজ ভর্তি পরীক্ষার সম্পূর্ণ গাইড — সকল বিষয় একটি বইয়ে।',
    'গণিত, বিজ্ঞান, বাংলা, ইংরেজি ও সাধারণ জ্ঞান — সব বিষয়ের সম্পূর্ণ প্রস্তুতি।',
    '৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।', '০১৭০০-০০০০০০', true, 1560, '2026-04-05T08:00:00Z'
  ),
  (
    'ক্যাডেট কলেজ গণিত গাইড', 'cadet-math-guide', 'বই',
    'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=800&q=80',
    550, null,
    'ক্যাডেট কলেজ ভর্তির গণিত অংশের বিস্তারিত সমাধানসহ গাইড বই।',
    'বীজগণিত, জ্যামিতি ও পাটিগণিতের সব টপিক অধ্যায়ভিত্তিকভাবে সাজানো।',
    '৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।', null, true, 890, '2026-03-25T08:00:00Z'
  ),
  (
    'ক্যাডেট কলেজ প্রশ্নব্যাংক', 'cadet-question-bank', 'প্রশ্নব্যাংক',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80',
    680, 480,
    'বিগত বছরের ক্যাডেট কলেজ ভর্তি পরীক্ষার প্রশ্ন ও বিস্তারিত সমাধান।',
    'সকল ক্যাডেট কলেজের বিগত প্রশ্নের সমাহার, বিস্তারিত সমাধান ও ব্যাখ্যাসহ।',
    '৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।', null, true, 1100, '2026-04-10T08:00:00Z'
  ),
  (
    'ISSB হ্যান্ডনোট সেট', 'issb-note-set', 'নোট',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    420, 299,
    'ISSB সম্পূর্ণ প্রস্তুতির জন্য হাতে লেখা হ্যান্ডনোট সেট — সহজ ও গোছানো।',
    'ISSB-র প্রতিটি ধাপের জন্য আলাদা হ্যান্ডনোট, গুরুত্বপূর্ণ পয়েন্টসহ।',
    '৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।', null, true, 640, '2026-03-15T08:00:00Z'
  ),
  (
    'ক্যাডেট কলেজ হ্যান্ডনোট সেট', 'cadet-note-set', 'নোট',
    'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?auto=format&fit=crop&w=800&q=80',
    380, 269,
    'ক্যাডেট কলেজ ভর্তির সব বিষয়ের হ্যান্ডনোট একসাথে।',
    'গণিত, বিজ্ঞান, বাংলা ও ইংরেজির গুরুত্বপূর্ণ পয়েন্ট সম্বলিত হ্যান্ডনোট সেট।',
    '৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।', null, true, 520, '2026-04-08T08:00:00Z'
  )
ON CONFLICT (slug) DO NOTHING;
