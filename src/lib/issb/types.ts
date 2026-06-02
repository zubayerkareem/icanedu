// TypeScript types for all ISSB practice module tables.

// ─── IQ Practice ─────────────────────────────────────────────
export interface IQOption {
  id: string;
  text: string;
}

export interface IQQuestion {
  id: string;
  set_id: string;
  text: string;
  image_url?: string;
  options: IQOption[];
  correct: string; // option id
  order_index: number;
}

export interface IQSet {
  id: string;
  course_id?: string;
  title: string;
  description: string;
  timer_seconds: number;
  order_index: number;
  is_published: boolean;
  created_at?: string;
  iq_questions?: IQQuestion[];
}

export interface IQResult {
  id?: string;
  user_id?: string;
  set_id: string;
  course_id?: string;
  score: number;
  total: number;
  answers: Record<string, string>; // {questionId: optionId}
  time_taken_seconds: number;
  completed_at?: string;
}

// ─── WAT ─────────────────────────────────────────────────────
export interface WATSet {
  id: string;
  course_id?: string;
  title: string;
  words: string[];
  word_seconds: number;
  order_index: number;
  is_published: boolean;
  created_at?: string;
}

// ─── IST ─────────────────────────────────────────────────────
export interface ISTSentence {
  id: string;
  set_id: string;
  stem: string;
  example: string;
  order_index: number;
}

export interface ISTSet {
  id: string;
  course_id?: string;
  title: string;
  timer_seconds: number;
  order_index: number;
  is_published: boolean;
  created_at?: string;
  ist_sentences?: ISTSentence[];
}

// ─── Extempore / SRT / GTO ───────────────────────────────────
export interface ExtemporeTopic {
  id: string;
  set_id: string;
  topic: string;
  category: string;
  hint: string;
  model_points: string[];
  model_essay: string;
  order_index: number;
}

export interface ExtemporeSet {
  id: string;
  course_id?: string;
  title: string;
  timer_seconds: number;
  order_index: number;
  is_published: boolean;
  created_at?: string;
  extempore_topics?: ExtemporeTopic[];
}

// ─── PPDT ────────────────────────────────────────────────────
export interface PPDTPicture {
  id: string;
  set_id: string;
  picture_number: number;
  image_url: string;
  title: string;
  idea: string;
  order_index: number;
}

export interface PPDTSet {
  id: string;
  course_id?: string;
  title: string;
  observe_seconds: number;
  write_seconds: number;
  order_index: number;
  is_published: boolean;
  created_at?: string;
  ppdt_pictures?: PPDTPicture[];
}

// ─── Picture Story ────────────────────────────────────────────
export interface PictureStoryPicture {
  id: string;
  set_id: string;
  picture_number: number;
  image_url: string;
  title: string;
  idea: string;
  order_index: number;
}

export interface PictureStorySet {
  id: string;
  course_id?: string;
  title: string;
  observe_seconds: number;
  write_seconds: number;
  order_index: number;
  is_published: boolean;
  created_at?: string;
  picture_story_pictures?: PictureStoryPicture[];
}

// ─── Incomplete Story ─────────────────────────────────────────
export interface IncompleteStory {
  id: string;
  set_id: string;
  title: string;
  instruction: string;
  body: string;
  word_limit: number;
  time_guide_minutes: number;
  idea: string;
  order_index: number;
}

export interface IncompleteStorySet {
  id: string;
  course_id?: string;
  title: string;
  order_index: number;
  is_published: boolean;
  created_at?: string;
  incomplete_stories?: IncompleteStory[];
}
