import type {
  Course,
  CourseIncludes,
  CourseReview,
  Module,
  Teacher,
} from "./types";

const sampleTeacher = (name: string, short: string): Teacher => ({
  name,
  short_bio: short,
  long_bio:
    `${name} একজন অভিজ্ঞ শিক্ষক, যিনি গত ১০ বছর ধরে এই বিষয়ে কাজ করছেন। ` +
    "তিনি দেশ-বিদেশের অনেক প্রতিষ্ঠানে প্রশিক্ষণ দিয়েছেন এবং হাজারো শিক্ষার্থীকে সফল ক্যারিয়ার গড়তে সহায়তা করেছেন।",
});

const baseIncludes: CourseIncludes = {
  videos: 48,
  pdfs: 12,
  quizzes: 8,
  assignments: 5,
  lifetime_access: true,
  certificate: true,
};

function buildModules(): Module[] {
  return [
    {
      id: "m1",
      title: "শুরুর কথা ও পরিচিতি",
      total_duration: "১ ঘণ্টা ২০ মিনিট",
      lessons: [
        { id: "l1", title: "কোর্স পরিচিতি", type: "video", duration: "০৮:১২", isPreview: true },
        { id: "l2", title: "কীভাবে কোর্সটি ব্যবহার করবেন", type: "video", duration: "১০:০৫", isPreview: true },
        { id: "l3", title: "প্রয়োজনীয় গাইড (PDF)", type: "pdf", duration: "—" },
        { id: "l4", title: "প্রাথমিক ধারণা যাচাই", type: "quiz", duration: "১০ প্রশ্ন" },
      ],
    },
    {
      id: "m2",
      title: "মূল ভিত্তি গড়ে তোলা",
      total_duration: "৩ ঘণ্টা",
      lessons: [
        { id: "l5", title: "মৌলিক ধারণা — পর্ব ১", type: "video", duration: "১৮:৪০" },
        { id: "l6", title: "মৌলিক ধারণা — পর্ব ২", type: "video", duration: "২২:১০" },
        { id: "l7", title: "অনুশীলন: ছোট প্রজেক্ট", type: "assignment", duration: "—" },
        { id: "l8", title: "রিভিউ কুইজ", type: "quiz", duration: "১৫ প্রশ্ন" },
      ],
    },
    {
      id: "m3",
      title: "অ্যাডভান্সড টপিক",
      total_duration: "৪ ঘণ্টা ৩০ মিনিট",
      lessons: [
        { id: "l9", title: "অ্যাডভান্সড টেকনিক", type: "video", duration: "২৮:৫০" },
        { id: "l10", title: "কেস স্টাডি বিশ্লেষণ", type: "video", duration: "৩৫:২০" },
        { id: "l11", title: "রেফারেন্স গাইড (PDF)", type: "pdf", duration: "—" },
        { id: "l12", title: "ফাইনাল অ্যাসাইনমেন্ট", type: "assignment", duration: "—" },
      ],
    },
    {
      id: "m4",
      title: "প্রজেক্ট ও সার্টিফিকেট",
      total_duration: "২ ঘণ্টা",
      lessons: [
        { id: "l13", title: "ক্যাপস্টোন প্রজেক্ট পরিচিতি", type: "video", duration: "১৫:০০" },
        { id: "l14", title: "প্রজেক্ট গাইডলাইন (PDF)", type: "pdf", duration: "—" },
        { id: "l15", title: "ফাইনাল মূল্যায়ন", type: "quiz", duration: "৩০ প্রশ্ন" },
      ],
    },
  ];
}

const baseReviews: CourseReview[] = [
  {
    id: "r1",
    name: "তানভীর আহমেদ",
    rating: 5,
    comment: "অসাধারণ কোর্স! প্রতিটি বিষয় বিস্তারিতভাবে বুঝিয়ে দেয়া হয়েছে।",
    created_at: "2026-03-20T10:00:00Z",
  },
  {
    id: "r2",
    name: "ফারহানা ইসলাম",
    rating: 5,
    comment: "কোর্সটি করে আমি আমার লক্ষ্যে পৌঁছাতে পেরেছি। সবাইকে রিকমেন্ড করব।",
    created_at: "2026-02-15T10:00:00Z",
  },
  {
    id: "r3",
    name: "সাব্বির হোসেন",
    rating: 4,
    comment: "ভালো কোর্স, তবে আরও কিছু প্র্যাকটিক্যাল উদাহরণ থাকলে আরও ভালো হতো।",
    created_at: "2026-01-30T10:00:00Z",
  },
];

const longDescription = `এই কোর্সটি শূন্য থেকে শুরু করে অ্যাডভান্সড পর্যায় পর্যন্ত সাজানো হয়েছে।

কোর্সটি যে কারণে আলাদা:
• বাস্তব প্রজেক্ট-ভিত্তিক শেখা
• আজীবন অ্যাক্সেস
• বাংলায় বিস্তারিত ব্যাখ্যা
• সার্টিফিকেট প্রদান`;

const baseHighlights: string[] = [
  "বাস্তব প্রজেক্ট-ভিত্তিক শেখা",
  "আজীবন অ্যাক্সেস",
  "বাংলায় বিস্তারিত ব্যাখ্যা",
  "সার্টিফিকেট প্রদান",
];

const issbWrittenTeachers = [
  {
    name: "মেজর (অব.) আরিফ হোসেন",
    short_bio: "সাবেক সেনা কর্মকর্তা, ISSB বিশেষজ্ঞ",
    long_bio: "মেজর (অব.) আরিফ হোসেন দীর্ঘ সামরিক ক্যারিয়ারে ISSB পরীক্ষায় অংশগ্রহণ ও প্রশিক্ষণে বিশেষজ্ঞ। তিনি হাজারো শিক্ষার্থীকে সশস্ত্র বাহিনীতে যোগ দিতে সহায়তা করেছেন।",
  },
  {
    name: "ড. নাজমুল ইসলাম",
    short_bio: "সাইকোলজিস্ট ও মোটিভেশনাল স্পিকার",
    long_bio: "ড. নাজমুল ইসলাম একজন প্রখ্যাত মনোবিজ্ঞানী, স্পিকার ও লেখক। ISSB মনোবিজ্ঞান পরীক্ষায় তাঁর সেশন শিক্ষার্থীদের আত্মবিশ্বাস ও মানসিক প্রস্তুতিতে বিশেষভাবে কার্যকর।",
  },
  {
    name: "ক্যাপ্টেন (অব.) রাফি আহমেদ",
    short_bio: "বাংলা ও ইংরেজি রচনা বিশেষজ্ঞ",
    long_bio: "ক্যাপ্টেন (অব.) রাফি আহমেদ সশস্ত্র বাহিনীর লিখিত পরীক্ষার বিশেষজ্ঞ, বিশেষত বাংলা ও ইংরেজি রচনা এবং Essay Writing মডিউলে অভিজ্ঞ।",
  },
  {
    name: "সার্জেন্ট (অব.) মামুন রশীদ",
    short_bio: "আইকিউ ও সাধারণ জ্ঞান প্রশিক্ষক",
    long_bio: "সার্জেন্ট (অব.) মামুন রশীদ IQ Practice, গণিত ও সমসাময়িক সাধারণ জ্ঞানে বিশেষজ্ঞ। তাঁর প্র্যাকটিক্যাল পদ্ধতি শিক্ষার্থীদের দ্রুত ফলাফল পেতে সাহায্য করে।",
  },
];

function buildIssbWrittenModules(): Module[] {
  return [
    {
      id: "wm1",
      title: "বাংলা — রচনা, ব্যাকরণ ও সারসংক্ষেপ",
      total_duration: "৬ ঘণ্টা",
      lessons: [
        { id: "wl1", title: "রচনা লেখার কৌশল ও কাঠামো", type: "video", duration: "২০:১৫", isPreview: true },
        { id: "wl2", title: "সারসংক্ষেপ ও ভাবসম্প্রসারণ", type: "video", duration: "১৮:৩০", isPreview: true },
        { id: "wl3", title: "ব্যাকরণ গাইড (PDF)", type: "pdf", duration: "—" },
        { id: "wl4", title: "বাংলা মক টেস্ট", type: "quiz", duration: "২০ প্রশ্ন" },
      ],
    },
    {
      id: "wm2",
      title: "ইংরেজি — Grammar, Essay & Comprehension",
      total_duration: "৬ ঘণ্টা",
      lessons: [
        { id: "wl5", title: "English Essay Writing Techniques", type: "video", duration: "২২:০০" },
        { id: "wl6", title: "Grammar Crash Course", type: "video", duration: "২৫:০০" },
        { id: "wl7", title: "Reading Comprehension Practice (PDF)", type: "pdf", duration: "—" },
        { id: "wl8", title: "English Mock Test", type: "quiz", duration: "২৫ প্রশ্ন" },
      ],
    },
    {
      id: "wm3",
      title: "গণিত ও আইকিউ",
      total_duration: "৫ ঘণ্টা",
      lessons: [
        { id: "wl9", title: "সংখ্যাতত্ত্ব ও বীজগণিত", type: "video", duration: "২৪:০০" },
        { id: "wl10", title: "লজিক ও Pattern Recognition", type: "video", duration: "২০:৩০" },
        { id: "wl11", title: "আইকিউ প্র্যাকটিস সেট (PDF)", type: "pdf", duration: "—" },
        { id: "wl12", title: "গণিত ও আইকিউ মক টেস্ট", type: "quiz", duration: "৩০ প্রশ্ন" },
      ],
    },
    {
      id: "wm4",
      title: "সাধারণ জ্ঞান ও সমসাময়িক",
      total_duration: "৪ ঘণ্টা",
      lessons: [
        { id: "wl13", title: "বাংলাদেশ বিষয়াবলি ও মুক্তিযুদ্ধ", type: "video", duration: "১৮:০০" },
        { id: "wl14", title: "আন্তর্জাতিক বিষয় ও সমসাময়িক ঘটনা", type: "video", duration: "১৬:০০" },
        { id: "wl15", title: "সাধারণ জ্ঞান শিট (PDF)", type: "pdf", duration: "—" },
        { id: "wl16", title: "সাধারণ জ্ঞান মক টেস্ট", type: "quiz", duration: "৩০ প্রশ্ন" },
      ],
    },
    {
      id: "wm5",
      title: "Preliminary Viva প্রস্তুতি",
      total_duration: "৩ ঘণ্টা",
      lessons: [
        { id: "wl17", title: "Viva তে কীভাবে নিজেকে উপস্থাপন করবেন", type: "video", duration: "২২:০০" },
        { id: "wl18", title: "সম্ভাব্য প্রশ্ন ও সেরা উত্তর কৌশল", type: "video", duration: "২৮:০০" },
        { id: "wl19", title: "Mock Viva সেশন ও ফিডব্যাক", type: "assignment", duration: "—" },
      ],
    },
  ];
}

// ─── ISSB Courses ────────────────────────────────────────────────────────────

export const ISSB_COURSES: Course[] = [
  {
    id: "issb1",
    title: "Regular Programme",
    slug: "issb-regular-programme",
    category: "ISSB",
    thumbnail_url: "/issb-full-prep-banner.jpg",
    duration: "৮ সপ্তাহ / ৪৮ দিন",
    total_lessons: 104,
    price: 9000,
    teacher_name: "মেজর (অব.) আরিফ হোসেন",
    teacher: sampleTeacher("মেজর (অব.) আরিফ হোসেন", "সাবেক সেনা কর্মকর্তা, ISSB বিশেষজ্ঞ"),
    short_description: "৮ সপ্তাহে সম্পূর্ণ ISSB প্রস্তুতি — ইনডোর ৫০% + আউটডোর ৫০%। রিনাউন্ড সাইকোলজিস্ট, স্পিকার ও লেখকের সেশন এবং ফাউন্ডারের সাথে ওয়ান-টু-ওয়ান DP Viva।",
    long_description: `এই কোর্সটি ISSB-এ সফল হতে ইচ্ছুক প্রার্থীদের জন্য সম্পূর্ণ প্রস্তুতির সুযোগ।

কোর্সের বিশেষত্ব:
• ৮ সপ্তাহ / ৪৮ দিন ব্যাপী নিবিড় প্রশিক্ষণ
• ১০৪ ঘণ্টা ক্লাস (ইনডোর ৫০% + আউটডোর ৫০%)
• প্রখ্যাত মনোবিজ্ঞানী, স্পিকার ও লেখকের বিশেষ সেশন
• ফাউন্ডারের সাথে ওয়ান-টু-ওয়ান DP Viva সেশন`,
    highlights: [
      "১০৪ ঘণ্টা ক্লাস (ইনডোর ৫০% + আউটডোর ৫০%)",
      "রিনাউন্ড সাইকোলজিস্ট, স্পিকার ও লেখকের সেশন",
      "ফাউন্ডারের সাথে ওয়ান-টু-ওয়ান DP Viva",
      "৮ সপ্তাহ / ৪৮ দিনের নিবিড় প্রশিক্ষণ",
    ],
    enrollment_count: 2140,
    rating_average: 4.9,
    rating_count: 540,
    modules: buildModules(),
    includes: baseIncludes,
    reviews: baseReviews,
    created_at: "2026-04-10T10:00:00Z",
  },
  {
    id: "issb2",
    title: "Preliminary Viva",
    slug: "issb-preliminary-viva",
    category: "ISSB",
    thumbnail_url:
      "https://images.unsplash.com/photo-1560439513-74b037a25d84?w=1200&auto=format&fit=crop",
    duration: "৪ সপ্তাহ / ২৪ দিন",
    total_lessons: 48,
    price: 5000,
    teacher_name: "মেজর (অব.) আরিফ হোসেন",
    teacher: sampleTeacher("মেজর (অব.) আরিফ হোসেন", "সাবেক সেনা কর্মকর্তা, ISSB বিশেষজ্ঞ"),
    short_description: "৪ সপ্তাহে প্রাথমিক ভাইভা প্রস্তুতি — ইনডোর ৫০% + আউটডোর ৫০%। প্রাথমিক ইন্টারভিউ ও মিলিটারি ডাক্তারের প্রাইমারি মেডিকেল চেকআপ।",
    long_description: `প্রাথমিক ভাইভা পর্যায়ে সফল হওয়ার জন্য বিশেষভাবে তৈরি কোর্স।

কোর্সের বিশেষত্ব:
• ৪ সপ্তাহ / ২৪ দিন ব্যাপী প্রশিক্ষণ
• ৪৮ ঘণ্টা ক্লাস (ইনডোর ৫০% + আউটডোর ৫০%)
• প্রাথমিক ইন্টারভিউর জন্য ওয়ান-টু-ওয়ান সেশন
• মিলিটারি ডাক্তারের প্রাইমারি মেডিকেল চেকআপ`,
    highlights: [
      "৪৮ ঘণ্টা ক্লাস (ইনডোর ৫০% + আউটডোর ৫০%)",
      "প্রাথমিক ইন্টারভিউর ওয়ান-টু-ওয়ান সেশন",
      "মিলিটারি ডাক্তারের প্রাইমারি মেডিকেল চেকআপ",
      "৪ সপ্তাহ / ২৪ দিনের প্রশিক্ষণ",
    ],
    enrollment_count: 1860,
    rating_average: 4.8,
    rating_count: 420,
    modules: buildModules(),
    includes: baseIncludes,
    reviews: baseReviews,
    created_at: "2026-03-25T10:00:00Z",
  },
];

// ─── Cadet College Courses ────────────────────────────────────────────────────

export const CADET_COURSES: Course[] = [
  {
    id: "cadet1",
    title: "Cadet College Admission Online Batch",
    slug: "cadet-online-batch",
    category: "Cadet",
    thumbnail_url:
      "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=1200&auto=format&fit=crop",
    duration: "মাসিক",
    total_lessons: 48,
    price: 3000,
    teacher_name: "Ex Cadet / BUP / Dhaka University",
    teacher: sampleTeacher("Ex Cadet / BUP / Dhaka University", "অভিজ্ঞ শিক্ষক প্যানেল"),
    short_description: "অনলাইন Zoom ব্যাচ — সপ্তাহে ৪ দিন, প্রতিদিন ৩ ঘণ্টা। মাসিক ৩০০০ টাকা, ভর্তি ফি ৫০০০ টাকা।",
    long_description: `অনলাইনে ক্যাডেট কলেজ ভর্তি প্রস্তুতির সেরা সুযোগ।

কোর্সের বিশেষত্ব:
• Zoom Premium ব্যবহার
• মাসিক ফি — ৩০০০ টাকা | ভর্তি ফি — ৫০০০ টাকা
• সপ্তাহে ৪ দিন ক্লাস, প্রতিদিন ৩ ঘণ্টা
• প্রতি শনিবার পরীক্ষা | শুক্রবার ছুটি
• বাংলা + ইংরেজি উভয় মিডিয়াম
• নিয়মিত শিট ও সকল বিষয়ের রেগুলার শিট
• শিক্ষক: Ex Cadet / BUP / Dhaka University`,
    highlights: [
      "Zoom Premium — সপ্তাহে ৪ দিন, প্রতিদিন ৩ ঘণ্টা",
      "প্রতি শনিবার পরীক্ষা, শুক্রবার ছুটি",
      "বাংলা ও ইংরেজি উভয় মিডিয়াম",
      "Ex Cadet / BUP / Dhaka University শিক্ষক",
    ],
    enrollment_count: 3400,
    rating_average: 4.9,
    rating_count: 870,
    modules: buildModules(),
    includes: baseIncludes,
    reviews: baseReviews,
    created_at: "2026-04-18T10:00:00Z",
  },
  {
    id: "cadet2",
    title: "Pre-Cadet Online College Admission Preparation",
    slug: "pre-cadet-online",
    category: "Cadet",
    thumbnail_url:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop",
    duration: "মাসিক",
    total_lessons: 32,
    price: 2500,
    teacher_name: "Ex Cadet / BUP / Dhaka University",
    teacher: sampleTeacher("Ex Cadet / BUP / Dhaka University", "অভিজ্ঞ শিক্ষক প্যানেল"),
    short_description: "অনলাইন প্রি-ক্যাডেট প্রস্তুতি — মাসিক ২৫০০ টাকা, ভর্তি ফি ৩০০০ টাকা। সপ্তাহে ৪ দিন, ২.৩০ ঘণ্টা।",
    long_description: `অনলাইনে প্রি-ক্যাডেট ভর্তি প্রস্তুতি।

কোর্সের বিশেষত্ব:
• ভর্তি ফি — ৩০০০ টাকা | মাসিক ফি — ২৫০০ টাকা
• নিয়মিত ক্লাস শিট
• দুর্বল শিক্ষার্থীদের জন্য বিশেষ ক্লাস
• বাংলা ও ইংরেজি উভয় মিডিয়াম
• সপ্তাহে ৪ দিন ক্লাস (২.৩০ ঘণ্টা)
• সাপ্তাহিক ও মাসিক পরীক্ষা
• শিক্ষক: Ex Cadet / BUP / Dhaka University`,
    highlights: [
      "সপ্তাহে ৪ দিন ক্লাস (২.৩০ ঘণ্টা)",
      "দুর্বল শিক্ষার্থীদের জন্য বিশেষ ক্লাস",
      "সাপ্তাহিক ও মাসিক পরীক্ষা",
      "বাংলা ও ইংরেজি উভয় মিডিয়াম",
    ],
    enrollment_count: 2900,
    rating_average: 4.8,
    rating_count: 640,
    modules: buildModules(),
    includes: baseIncludes,
    reviews: baseReviews,
    created_at: "2026-04-12T10:00:00Z",
  },
  {
    id: "cadet3",
    title: "Pre-Cadet College Admission Preparation",
    slug: "pre-cadet-offline",
    category: "Cadet",
    thumbnail_url:
      "https://images.unsplash.com/photo-1532094349884-543559059c7d?w=1200&auto=format&fit=crop",
    duration: "মাসিক",
    total_lessons: 32,
    price: 2500,
    teacher_name: "Ex Cadet / BUP / Dhaka University",
    teacher: sampleTeacher("Ex Cadet / BUP / Dhaka University", "অভিজ্ঞ শিক্ষক প্যানেল"),
    short_description: "অফলাইন প্রি-ক্যাডেট প্রস্তুতি — মাসিক ২৫০০ টাকা, ভর্তি ফি ৪০০০ টাকা। সপ্তাহে ৪ দিন, ২.৩০ ঘণ্টা।",
    long_description: `অফলাইনে প্রি-ক্যাডেট ভর্তি প্রস্তুতি।

কোর্সের বিশেষত্ব:
• ভর্তি ফি — ৪০০০ টাকা | মাসিক ফি — ২৫০০ টাকা
• সপ্তাহে ৪ দিন ক্লাস (২.৩০ ঘণ্টা)
• দুর্বল শিক্ষার্থীদের জন্য বিশেষ ক্লাস
• বাংলা ও ইংরেজি উভয় মিডিয়াম
• সাপ্তাহিক ও মাসিক পরীক্ষা
• নিয়মিত ক্লাস শিট
• শিক্ষক: Ex Cadet / BUP / Dhaka University`,
    highlights: [
      "সপ্তাহে ৪ দিন ক্লাস (২.৩০ ঘণ্টা)",
      "দুর্বল শিক্ষার্থীদের জন্য বিশেষ ক্লাস",
      "বাংলা ও ইংরেজি উভয় মিডিয়াম",
      "সাপ্তাহিক ও মাসিক পরীক্ষা",
    ],
    enrollment_count: 2100,
    rating_average: 4.7,
    rating_count: 480,
    modules: buildModules(),
    includes: baseIncludes,
    reviews: baseReviews,
    created_at: "2026-04-05T10:00:00Z",
  },
  {
    id: "cadet4",
    title: "Cadet College Admission Preparation",
    slug: "cadet-offline",
    category: "Cadet",
    thumbnail_url:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&auto=format&fit=crop",
    duration: "মাসিক",
    total_lessons: 40,
    price: 3500,
    teacher_name: "Experienced & Meritorious Teachers Panel",
    teacher: sampleTeacher("অভিজ্ঞ শিক্ষক প্যানেল", "মেধাবী ও অভিজ্ঞ শিক্ষকমণ্ডলী"),
    short_description: "অফলাইন ক্যাডেট ভর্তি প্রস্তুতি — মাসিক ৩৫০০ টাকা, ভর্তি ফি ৭০০০ টাকা। সপ্তাহে ৪ দিন, ২.৩০ ঘণ্টা।",
    long_description: `অফলাইনে সম্পূর্ণ ক্যাডেট কলেজ ভর্তি প্রস্তুতি।

কোর্সের বিশেষত্ব:
• ভর্তি ফি — ৭০০০ টাকা | মাসিক ফি — ৩৫০০ টাকা
• সপ্তাহে ৪ দিন ক্লাস (২.৩০ ঘণ্টা)
• সাপ্তাহিক ও মাসিক পরীক্ষা
• নিয়মিত ক্লাস শিট
• দুর্বল শিক্ষার্থীদের জন্য বিশেষ ক্লাস
• বাংলা ও ইংরেজি উভয় মিডিয়াম
• অভিজ্ঞ ও মেধাবী শিক্ষক প্যানেল`,
    highlights: [
      "সপ্তাহে ৪ দিন ক্লাস (২.৩০ ঘণ্টা)",
      "অভিজ্ঞ ও মেধাবী শিক্ষক প্যানেল",
      "বাংলা ও ইংরেজি উভয় মিডিয়াম",
      "সাপ্তাহিক ও মাসিক পরীক্ষা",
    ],
    enrollment_count: 1800,
    rating_average: 4.9,
    rating_count: 360,
    modules: buildModules(),
    includes: baseIncludes,
    reviews: baseReviews,
    created_at: "2026-03-30T10:00:00Z",
  },
];

// Written & Prelim Viva course appended after the two base ISSB courses
ISSB_COURSES.push({
  id: "issb3",
  title: "Online Written & Preliminary Viva",
  slug: "issb-written-prelim-viva",
  category: "ISSB",
  thumbnail_url: "/issb-written-banner.jpg",
  duration: "১৬ দিন",
  total_lessons: 19,
  price: 5000,
  discount_price: 3000,
  teacher_name: "বিশেষজ্ঞ শিক্ষক প্যানেল",
  teachers: issbWrittenTeachers,
  short_description:
    "97 BMA · 27 A · 94 BAFA — অনলাইনে ১৬ দিনের লিখিত পরীক্ষা ও প্রিলিমিনারি ভাইভা প্রস্তুতি। বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান ও সব ISSB মডিউল একসাথে।",
  long_description: `97 BMA | 27 A | 94 BAFA ভর্তি পরীক্ষার জন্য বিশেষভাবে তৈরি অনলাইন কোর্স।

কোর্সের বিশেষত্ব:
• ১৬ দিনের নিবিড় অনলাইন প্রশিক্ষণ
• বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান — সব বিষয় একসাথে
• IQ Practice, WAT, IST, Essay Writing সহ সব ISSB মডিউল
• ৪ জন বিশেষজ্ঞ শিক্ষকের সমন্বিত প্যানেল
• Preliminary Viva কৌশল ও মক সেশন
• প্রতিটি বিষয়ে মক টেস্ট ও মডেল উত্তর`,
  highlights: [
    "97 BMA · 27 A · 94 BAFA — সব ব্যাচের জন্য প্রযোজ্য",
    "সব ISSB মডিউল একসাথে (WAT, IST, IQ, Extempore)",
    "৪ জন বিশেষজ্ঞ শিক্ষকের প্যানেল",
    "১৬ দিনের নিবিড় অনলাইন প্রস্তুতি",
  ],
  enrollment_count: 1240,
  rating_average: 4.9,
  rating_count: 310,
  modules: buildIssbWrittenModules(),
  includes: { ...baseIncludes, videos: 19, pdfs: 5, quizzes: 4, assignments: 1 },
  reviews: baseReviews,
  created_at: "2026-05-01T10:00:00Z",
});

// Online ISSB Full Preparation
ISSB_COURSES.push({
  id: "issb4",
  title: "Online ISSB Full Preparation",
  slug: "issb-online-full-preparation",
  category: "ISSB",
  thumbnail_url: "/issb-full-prep-banner.jpg",
  duration: "৮ সপ্তাহ / ৪৮ দিন",
  total_lessons: 19,
  price: 9000,
  teacher_name: "বিশেষজ্ঞ শিক্ষক প্যানেল",
  teachers: issbWrittenTeachers,
  short_description:
    "Army · Navy · Airforce — Future Officer Cadet-দের জন্য সম্পূর্ণ ISSB অনলাইন প্রস্তুতি। সব মডিউল, বিশেষজ্ঞ শিক্ষক প্যানেল ও লাইভ মক সেশন।",
  long_description: `Army · Navy · Airforce — Future Officer Cadet-দের জন্য iCAN Academy-র সম্পূর্ণ ISSB অনলাইন কোর্স।

কোর্সের বিশেষত্ব:
• সব ISSB মডিউল: IQ Practice, WAT, IST, Essay Writing, Picture Story, Incomplete Story, PPDT
• ৪ জন বিশেষজ্ঞ শিক্ষকের সমন্বিত প্যানেল
• ৮ সপ্তাহ / ৪৮ দিনের নিবিড় অনলাইন প্রশিক্ষণ
• লাইভ মক সেশন ও ব্যক্তিগত ফিডব্যাক
• "Dream It. Prepare It. Achieve It."`,
  highlights: [
    "Army · Navy · Airforce — সব বাহিনীর জন্য প্রযোজ্য",
    "সব ISSB মডিউল একসাথে (WAT, IST, IQ, Extempore, PPDT)",
    "৪ জন বিশেষজ্ঞ শিক্ষকের প্যানেল",
    "৮ সপ্তাহ / ৪৮ দিনের নিবিড় প্রশিক্ষণ",
  ],
  enrollment_count: 1850,
  rating_average: 4.9,
  rating_count: 420,
  modules: buildIssbWrittenModules(),
  includes: { ...baseIncludes, videos: 19, pdfs: 5, quizzes: 4, assignments: 1 },
  reviews: baseReviews,
  created_at: "2026-05-10T10:00:00Z",
});

// Combined export for useCourses hook (courses page shows all)
export const MOCK_COURSES: Course[] = [...ISSB_COURSES, ...CADET_COURSES];
