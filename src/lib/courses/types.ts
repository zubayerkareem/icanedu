// Shared Course types used across homepage, listing, and detail pages.

export type LessonType = "video" | "pdf" | "quiz" | "assignment";

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration?: string; // e.g. "১২:৩০"
  isPreview?: boolean; // free preview, viewable without enrollment
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  total_duration?: string; // e.g. "২ ঘণ্টা ১৫ মিনিট"
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
  teacher?: Teacher;
  teachers?: Teacher[]; // multi-teacher courses

  modules?: Module[];
  includes?: CourseIncludes;

  highlights?: string[]; // short bullet points shown in the hero

  rating_average?: number;
  rating_count?: number;
  reviews?: CourseReview[];

  videos?: CourseVideo[];
  resources?: CourseResource[];
}

export type CourseSort = "newest" | "price_asc" | "price_desc";
