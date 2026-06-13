// Shared Course types used across homepage, listing, and detail pages.

export type LessonType = "video" | "pdf" | "quiz" | "assignment" | "text";

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration?: string; // e.g. "১২:৩০"
  isPreview?: boolean; // legacy free-preview flag
  isFree?: boolean; // viewable without enrollment
  video_url?: string; // YouTube/Vimeo link (type: video)
  pdf_url?: string; // uploaded PDF public URL (type: pdf)
  content?: string; // TipTap HTML (type: text / quiz / assignment)
}

export interface ISSBModuleConfig {
  iq: boolean;
  wat: boolean;
  ist: boolean;
  extempore: boolean;
  ppdt: boolean;
  pictureStory: boolean;
  incompleteStory: boolean;
  planningTask: boolean;
  groupDiscussion: boolean;
}

export const ISSB_ELEMENT_DEFS: Array<{
  key: keyof ISSBModuleConfig;
  label: string;
  labelBn: string;
  path: string;
}> = [
  { key: "iq",              label: "IQ Practice",      labelBn: "IQ প্র্যাকটিস",       path: "iq-practice" },
  { key: "ppdt",            label: "PPDT Practice",    labelBn: "PPDT প্র্যাকটিস",     path: "ppdt" },
  { key: "wat",             label: "WAT Practice",     labelBn: "WAT প্র্যাকটিস",      path: "wat" },
  { key: "ist",             label: "IST Practice",     labelBn: "IST প্র্যাকটিস",      path: "ist" },
  { key: "extempore",       label: "Essay Writing",    labelBn: "Essay Writing",        path: "extempore" },
  { key: "pictureStory",    label: "Picture Story",    labelBn: "পিকচার স্টোরি",       path: "picture-story" },
  { key: "incompleteStory", label: "Incomplete Story", labelBn: "অসম্পূর্ণ গল্প",       path: "incomplete-story" },
  { key: "planningTask",    label: "Planning Task",    labelBn: "প্ল্যানিং টাস্ক",       path: "planning-task" },
  { key: "groupDiscussion", label: "Group Discussion", labelBn: "গ্রুপ ডিসকাশন",        path: "group-discussion" },
];

export interface Module {
  id: string;
  title: string;
  type?: "lessons" | "issb";
  lessons: Lesson[];
  total_duration?: string; // e.g. "২ ঘণ্টা ১৫ মিনিট"
  isFree?: boolean; // whole module viewable without enrollment
  issb?: ISSBModuleConfig;
}

// A list row with a chosen lucide icon (overview "why different" + "what you get").
export interface IconListItem {
  id: string;
  icon: string; // lucide icon name
  text: string;
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  expires_at?: string; // ISO
  max_uses?: number;
  used_count?: number;
}

// A lesson is free if its module is free, or the lesson is flagged free/preview.
export function isLessonFree(module: Pick<Module, "isFree">, lesson: Pick<Lesson, "isFree" | "isPreview">): boolean {
  return !!(module.isFree || lesson.isFree || lesson.isPreview);
}

export interface Teacher {
  name: string;
  avatar?: string;
  short_bio?: string;
  long_bio?: string;
}

export interface CourseIncludes {
  videos?: number;
  pdfs?: number;
  quizzes?: number;
  assignments?: number;
  lifetime_access?: boolean;
  certificate?: boolean;
}

export interface CourseReview {
  id: string;
  name: string;
  avatar?: string;
  rating: number; // 1-5
  comment: string;
  created_at?: string;
}

export interface CourseVideo {
  id: string;
  title: string;
  url: string; // YouTube or Vimeo URL
  description?: string;
}

export interface CourseResource {
  id: string;
  title: string;
  url: string; // PDF or file URL
  type?: string; // "pdf", "doc", etc. — display hint only
}

export interface Course {
  id: string;
  title: string;
  slug?: string;
  thumbnail_url?: string;
  category?: string;
  duration?: string;
  price?: number;
  discount_price?: number;
  discount_ends_at?: string; // ISO; used for countdown
  short_description?: string;
  long_description?: string; // markdown / plain text
  total_lessons?: number;
  enrollment_count?: number;
  created_at?: string;

  teacher_name?: string;
  teacher_avatar?: string;
  teacher_short_bio?: string;
  teacher_long_bio?: string;
  teacher?: Teacher;
  teachers?: Teacher[]; // multi-teacher courses

  modules?: Module[];
  includes?: CourseIncludes;

  highlights?: string[]; // legacy plain-text bullets (fallback)
  highlight_items?: IconListItem[]; // overview "why different" with icons
  feature_items?: IconListItem[]; // "what you get" with icons

  coupons?: Coupon[];
  is_published?: boolean;

  rating_average?: number;
  rating_count?: number;
  reviews?: CourseReview[];

  videos?: CourseVideo[];
  resources?: CourseResource[];
}

export type CourseSort = "newest" | "price_asc" | "price_desc";
