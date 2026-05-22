import {
  Image as ImageIcon,
  BarChart3,
  GraduationCap,
  ListChecks,
  MessageSquareQuote,
  Megaphone,
  Type,
  Image as BannerIcon,
  Video,
  ShoppingBag,
  HelpCircle,
  BellRing,
  type LucideIcon,
} from "lucide-react";
import type { SectionType, AnySection } from "./types";

export interface SectionMeta {
  type: SectionType;
  name: string; // bn
  description: string; // bn
  icon: LucideIcon;
}

export const SECTION_META: Record<SectionType, SectionMeta> = {
  hero: {
    type: "hero",
    name: "হিরো ব্যানার",
    description: "পেজের শুরুতে বড় ব্যানার, শিরোনাম ও কল-টু-অ্যাকশন।",
    icon: ImageIcon,
  },
  stats: {
    type: "stats",
    name: "পরিসংখ্যান বার",
    description: "শিক্ষার্থী সংখ্যা, কোর্স ইত্যাদি গণনা দেখান।",
    icon: BarChart3,
  },
  featured_courses: {
    type: "featured_courses",
    name: "জনপ্রিয় কোর্স",
    description: "সর্বশেষ বা নির্বাচিত কোর্স গ্রিড আকারে দেখান।",
    icon: GraduationCap,
  },
  how_it_works: {
    type: "how_it_works",
    name: "কীভাবে কাজ করে",
    description: "ধাপে ধাপে প্রক্রিয়া দেখান (২–৫ ধাপ)।",
    icon: ListChecks,
  },
  testimonials: {
    type: "testimonials",
    name: "শিক্ষার্থীদের মতামত",
    description: "শিক্ষার্থীদের রিভিউ ও রেটিং দেখান।",
    icon: MessageSquareQuote,
  },
  cta_banner: {
    type: "cta_banner",
    name: "কল টু অ্যাকশন ব্যানার",
    description: "ব্যবহারকারীকে নির্দিষ্ট কাজে উৎসাহিত করুন।",
    icon: Megaphone,
  },
  text_block: {
    type: "text_block",
    name: "টেক্সট ব্লক",
    description: "ফ্রি-ফর্ম টেক্সট/বর্ণনা যুক্ত করুন।",
    icon: Type,
  },
  image_banner: {
    type: "image_banner",
    name: "ইমেজ ব্যানার",
    description: "একটি বড় ছবি, ক্যাপশন ও লিংকসহ।",
    icon: BannerIcon,
  },
  video_embed: {
    type: "video_embed",
    name: "ভিডিও সেকশন",
    description: "YouTube বা Vimeo ভিডিও এমবেড করুন।",
    icon: Video,
  },
  featured_products: {
    type: "featured_products",
    name: "জনপ্রিয় প্রোডাক্ট",
    description: "নির্বাচিত প্রোডাক্ট গ্রিড আকারে দেখান।",
    icon: ShoppingBag,
  },
  faq: {
    type: "faq",
    name: "সাধারণ জিজ্ঞাসা",
    description: "অ্যাকর্ডিয়ন আকারে FAQ যুক্ত করুন।",
    icon: HelpCircle,
  },
  notice_preview: {
    type: "notice_preview",
    name: "সাম্প্রতিক নোটিশ",
    description: "সর্বশেষ সক্রিয় নোটিশসমূহ দেখান।",
    icon: BellRing,
  },
};

export const ALL_SECTION_TYPES: SectionType[] = [
  "hero",
  "stats",
  "featured_courses",
  "how_it_works",
  "testimonials",
  "cta_banner",
  "text_block",
  "image_banner",
  "video_embed",
  "featured_products",
  "faq",
  "notice_preview",
];

export function metaFor(s: AnySection): SectionMeta {
  return SECTION_META[s.type];
}
