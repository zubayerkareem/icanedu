-- Run this in Supabase Dashboard → SQL Editor
-- Adds iCAN Guide Academic Practice Sheets (Class 5 & Class 6)

INSERT INTO products (name, slug, category, image_url, images, price, discount_price, short_description, long_description, delivery_info, contact_info, in_stock, is_published, sales_count, created_at)
VALUES
(
  'iCAN Guide — Academic Practice Sheets (Class 5)',
  'ican-guide-academic-practice-sheets-class-5',
  'বই',
  'https://icanbd.vercel.app/products/book-class5-v2.jpg',
  '["https://icanbd.vercel.app/products/book-class5-v2.jpg","https://icanbd.vercel.app/products/book-class5-v3.jpg","https://icanbd.vercel.app/products/book-class5-v1.png"]'::jsonb,
  400,
  320,
  'iCAN Guide Academic Practice Sheets — ৫ম শ্রেণির শিক্ষার্থীদের জন্য ক্যাডেট কলেজ ভর্তি প্রস্তুতির বিশেষ প্র্যাকটিস শিট সংকলন।',
  'iCAN Academy-র বিশেষজ্ঞ শিক্ষক প্যানেল কর্তৃক প্রণীত Academic Practice Sheets — ৫ম শ্রেণির শিক্ষার্থীদের জন্য।

বইয়ের বিশেষত্ব:
• ক্যাডেট কলেজ ভর্তি পরীক্ষার আদলে সাজানো প্র্যাকটিস শিট
• বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান — সব বিষয় একসাথে
• অধ্যায়ভিত্তিক বিন্যাস ও বিস্তারিত সমাধান
• iCAN-এর অভিজ্ঞ শিক্ষকদের তত্ত্বাবধানে প্রস্তুত',
  '৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।',
  'অর্ডার: ০১৮৯৪৭৩৪০০২',
  true,
  true,
  640,
  NOW()
),
(
  'iCAN Guide — Academic Practice Sheets (Class 6)',
  'ican-guide-academic-practice-sheets-class-6',
  'বই',
  'https://icanbd.vercel.app/products/book-class6-v2.jpg',
  '["https://icanbd.vercel.app/products/book-class6-v2.jpg","https://icanbd.vercel.app/products/book-class6-v1.png"]'::jsonb,
  400,
  320,
  'iCAN Guide Academic Practice Sheets — ৬ষ্ঠ শ্রেণির শিক্ষার্থীদের জন্য ক্যাডেট কলেজ ভর্তি প্রস্তুতির বিশেষ প্র্যাকটিস শিট সংকলন।',
  'iCAN Academy-র বিশেষজ্ঞ শিক্ষক প্যানেল কর্তৃক প্রণীত Academic Practice Sheets — ৬ষ্ঠ শ্রেণির শিক্ষার্থীদের জন্য।

বইয়ের বিশেষত্ব:
• ক্যাডেট কলেজ ভর্তি পরীক্ষার আদলে সাজানো প্র্যাকটিস শিট
• বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান — সব বিষয় একসাথে
• অধ্যায়ভিত্তিক বিন্যাস ও বিস্তারিত সমাধান
• iCAN-এর অভিজ্ঞ শিক্ষকদের তত্ত্বাবধানে প্রস্তুত',
  '৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।',
  'অর্ডার: ০১৮৯৪৭৩৪০০২',
  true,
  true,
  580,
  NOW()
);
