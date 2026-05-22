// Type registry for the homepage page builder.
// Adding a new section type = add an entry here, a default in defaults.ts,
// an editor in editors/, and a renderer in renderers/.

export type SectionType =
  | "hero"
  | "stats"
  | "featured_courses"
  | "how_it_works"
  | "testimonials"
  | "cta_banner"
  | "text_block"
  | "image_banner"
  | "video_embed"
  | "featured_products"
  | "faq"
  | "notice_preview";

export interface SectionBase<T extends SectionType, C> {
  id: string;
  type: T;
  visible: boolean;
  order: number;
  config: C;
}

// ---------- Section configs ----------

export type BgType = "solid" | "gradient" | "image";
export type TextAlign = "left" | "center" | "right";

export interface HeroConfig {
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  backgroundType: BgType;
  backgroundColor: string;
  overlayOpacity: number; // 0-100
  textAlign: TextAlign;
}

export interface StatItem {
  icon: string; // Lucide icon name
  value: string;
  label: string;
}
export interface StatsConfig {
  items: StatItem[];
  backgroundColor: string;
}

export type CourseSource = "latest" | "popular" | "manual";
export interface FeaturedCoursesConfig {
  heading: string;
  count: 3 | 6 | 9;
  source: CourseSource;
  manualIds: string[];
  showSeeAll: boolean;
}

export interface HowItWorksStep {
  icon: string;
  title: string;
  description: string;
}
export interface HowItWorksConfig {
  heading: string;
  steps: HowItWorksStep[];
}

export interface TestimonialItem {
  quote: string;
  name: string;
  course: string;
  rating: number; // 1-5
  avatar?: string;
}
export interface TestimonialsConfig {
  heading: string;
  items: TestimonialItem[];
  autoSlide: boolean;
  intervalSeconds: number;
}

export interface CtaBannerConfig {
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
  backgroundType: "solid" | "gradient";
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface TextBlockConfig {
  content: string; // markdown / plain text for now
  background: "white" | "muted";
}

export interface ImageBannerConfig {
  imageUrl: string;
  caption: string;
  link: string;
  fullWidth: boolean;
}

export interface VideoEmbedConfig {
  heading: string;
  videoUrl: string;
  description: string;
}

export interface FeaturedProductsConfig {
  heading: string;
  count: 3 | 6 | 9;
  source: CourseSource;
  manualIds: string[];
  showSeeAll: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}
export interface FaqConfig {
  heading: string;
  items: FaqItem[];
}

export interface NoticePreviewConfig {
  heading: string;
  count: 3 | 5;
}

// Discriminated union of all sections
export type Section =
  | SectionBase<"hero", HeroConfig>
  | SectionBase<"stats", StatsConfig>
  | SectionBase<"featured_courses", FeaturedCoursesConfig>
  | SectionBase<"how_it_works", HowItWorksConfig>
  | SectionBase<"testimonials", TestimonialsConfig>
  | SectionBase<"cta_banner", CtaBannerConfig>
  | SectionBase<"text_block", TextBlockConfig>
  | SectionBase<"image_banner", ImageBannerConfig>
  | SectionBase<"video_embed", VideoEmbedConfig>
  | SectionBase<"featured_products", FeaturedProductsConfig>
  | SectionBase<"faq", FaqConfig>
  | SectionBase<"notice_preview", NoticePreviewConfig>;

export type AnySection = Section;
