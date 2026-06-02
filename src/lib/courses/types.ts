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

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  total_duration?: string; // e.g. "২ ঘণ্টা ১৫ মিনিট"
  isFree?: boolean; // whole module viewable without enrollment
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
