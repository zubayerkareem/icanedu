import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://prjsoviauzapqhqbnnuf.supabase.co",
  "sb_publishable_MmUGk-1N2BtQSKM8FMPy9A_zw0doq9V"
);

const products = [
  {
    name: "iCAN Guide — Academic Practice Sheets (Class 5)",
    slug: "ican-guide-academic-practice-sheets-class-5",
    category: "বই",
    image_url: "https://icanbd.vercel.app/products/book-class5-v2.jpg",
    images: [
      "https://icanbd.vercel.app/products/book-class5-v2.jpg",
      "https://icanbd.vercel.app/products/book-class5-v3.jpg",
      "https://icanbd.vercel.app/products/book-class5-v1.png",
    ],
    price: 400,
    discount_price: 320,
    short_description:
      "iCAN Guide Academic Practice Sheets — ৫ম শ্রেণির শিক্ষার্থীদের জন্য ক্যাডেট কলেজ ভর্তি প্রস্তুতির বিশেষ প্র্যাকটিস শিট সংকলন।",
    long_description: `iCAN Academy-র বিশেষজ্ঞ শিক্ষক প্যানেল কর্তৃক প্রণীত Academic Practice Sheets — ৫ম শ্রেণির শিক্ষার্থীদের জন্য।

বইয়ের বিশেষত্ব:
• ক্যাডেট কলেজ ভর্তি পরীক্ষার আদলে সাজানো প্র্যাকটিস শিট
• বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান — সব বিষয় একসাথে
• অধ্যায়ভিত্তিক বিন্যাস ও বিস্তারিত সমাধান
• iCAN-এর অভিজ্ঞ শিক্ষকদের তত্ত্বাবধানে প্রস্তুত`,
    delivery_info: "৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।",
    contact_info: "অর্ডার: ০১৮৯৪৭৩৪০০২",
    in_stock: true,
    is_published: true,
    sales_count: 640,
  },
  {
    name: "iCAN Guide — Academic Practice Sheets (Class 6)",
    slug: "ican-guide-academic-practice-sheets-class-6",
    category: "বই",
    image_url: "https://icanbd.vercel.app/products/book-class6-v2.jpg",
    images: [
      "https://icanbd.vercel.app/products/book-class6-v2.jpg",
      "https://icanbd.vercel.app/products/book-class6-v1.png",
    ],
    price: 400,
    discount_price: 320,
    short_description:
      "iCAN Guide Academic Practice Sheets — ৬ষ্ঠ শ্রেণির শিক্ষার্থীদের জন্য ক্যাডেট কলেজ ভর্তি প্রস্তুতির বিশেষ প্র্যাকটিস শিট সংকলন।",
    long_description: `iCAN Academy-র বিশেষজ্ঞ শিক্ষক প্যানেল কর্তৃক প্রণীত Academic Practice Sheets — ৬ষ্ঠ শ্রেণির শিক্ষার্থীদের জন্য।

বইয়ের বিশেষত্ব:
• ক্যাডেট কলেজ ভর্তি পরীক্ষার আদলে সাজানো প্র্যাকটিস শিট
• বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান — সব বিষয় একসাথে
• অধ্যায়ভিত্তিক বিন্যাস ও বিস্তারিত সমাধান
• iCAN-এর অভিজ্ঞ শিক্ষকদের তত্ত্বাবধানে প্রস্তুত`,
    delivery_info: "৩-৫ কর্মদিবসে সারাদেশে হোম ডেলিভারি।",
    contact_info: "অর্ডার: ০১৮৯৪৭৩৪০০২",
    in_stock: true,
    is_published: true,
    sales_count: 580,
  },
];

const { data, error } = await supabase.from("products").insert(products).select();

if (error) {
  console.error("Insert error:", error.message);
  console.error("Details:", error.details);
  process.exit(1);
}

console.log("Inserted products:");
data.forEach((p) => console.log(` ✓ ${p.name} (id: ${p.id})`));
