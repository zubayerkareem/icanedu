import type { AnySection, SectionType } from "./types";

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36));

export function makeSection(type: SectionType, order: number): AnySection {
  const base = { id: uid(), visible: true, order };

  switch (type) {
    case "hero":
      return {
        ...base,
        type,
        config: {
          heading: "আপনার শেখার যাত্রা শুরু হোক iCANBD-এর সাথে",
          subheading: "মান-সম্পন্ন কোর্স, সাশ্রয়ী মূল্যে। যেকোনো জায়গা থেকে, যেকোনো সময়।",
          buttonText: "এখনই শুরু করুন",
          buttonLink: "/courses",
          backgroundImage: "",
          backgroundType: "gradient",
          backgroundColor: "#1a2332",
          overlayOpacity: 40,
          textAlign: "center",
        },
      };
    case "stats":
      return {
        ...base,
        type,
        config: {
          backgroundColor: "#f1f5f9",
          items: [
            { icon: "Users", value: "১০,০০০+", label: "শিক্ষার্থী" },
            { icon: "BookOpen", value: "১০০+", label: "কোর্স" },
            { icon: "Award", value: "৫০+", label: "শিক্ষক" },
            { icon: "Star", value: "৪.৮", label: "গড় রেটিং" },
          ],
        },
      };
    case "featured_courses":
      return {
        ...base,
        type,
        config: { heading: "Courses OF ISSB", count: 6, source: "latest", manualIds: [], showSeeAll: true },
      };
    case "how_it_works":
      return {
        ...base,
        type,
        config: {
          heading: "কীভাবে কাজ করে",
          steps: [
            { icon: "UserPlus", title: "অ্যাকাউন্ট তৈরি করুন", description: "মাত্র এক মিনিটে রেজিস্টার করুন।" },
            { icon: "BookOpen", title: "কোর্স নির্বাচন করুন", description: "আপনার পছন্দ অনুযায়ী কোর্স বেছে নিন।" },
            { icon: "GraduationCap", title: "শিখুন ও সফল হন", description: "যেকোনো সময়, যেকোনো জায়গায়।" },
          ],
        },
      };
    case "testimonials":
      return {
        ...base,
        type,
        config: {
          heading: "শিক্ষার্থীদের মতামত",
          autoSlide: true,
          intervalSeconds: 5,
          items: [
            { quote: "অসাধারণ কোর্স! অনেক কিছু শিখেছি।", name: "রহিম উদ্দিন", course: "ওয়েব ডেভেলপমেন্ট", rating: 5 },
            { quote: "শিক্ষকরা অনেক হেল্পফুল।", name: "সুমাইয়া আক্তার", course: "গ্রাফিক ডিজাইন", rating: 5 },
          ],
        },
      };
    case "cta_banner":
      return {
        ...base,
        type,
        config: {
          heading: "আজই যোগ দিন iCANBD পরিবারে",
          subheading: "হাজারো শিক্ষার্থীর সাথে শেখা শুরু করুন।",
          buttonText: "রেজিস্টার করুন",
          buttonLink: "/register",
          backgroundType: "gradient",
          backgroundColor: "#2563eb",
          gradientFrom: "#1d4ed8",
          gradientTo: "#2563eb",
        },
      };
    case "text_block":
      return {
        ...base,
        type,
        config: {
          content: "এখানে আপনার লেখা যুক্ত করুন।",
          background: "white",
        },
      };
    case "image_banner":
      return {
        ...base,
        type,
        config: { imageUrl: "", caption: "", link: "", fullWidth: false },
      };
    case "video_embed":
      return {
        ...base,
        type,
        config: { heading: "আমাদের ভিডিও", videoUrl: "", description: "" },
      };
    case "featured_products":
      return {
        ...base,
        type,
        config: { heading: "জনপ্রিয় প্রোডাক্ট", count: 6, source: "latest", manualIds: [], showSeeAll: true },
      };
    case "faq":
      return {
        ...base,
        type,
        config: {
          heading: "সাধারণ জিজ্ঞাসা",
          items: [
            { question: "কোর্সের মেয়াদ কতদিন?", answer: "প্রতিটি কোর্সের মেয়াদ আলাদা — কোর্সের পেজে বিস্তারিত দেখুন।" },
            { question: "কীভাবে পেমেন্ট করবো?", answer: "বিকাশ, নগদ, রকেট ও কার্ড সাপোর্টেড।" },
          ],
        },
      };
    case "notice_preview":
      return { ...base, type, config: { heading: "সাম্প্রতিক নোটিশ", count: 3 } };
  }
}
