import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomepageConfig } from "@/hooks/useHomepageConfig";
import type { AnySection } from "@/lib/page-builder/types";
import { HeroSection } from "./HeroSection";
import { EmptyHomepage } from "./EmptyHomepage";

// Above-the-fold sections render eagerly (Hero). Everything else is
// code-split and lazy-loaded to keep the initial homepage bundle small.
const StatsSection = lazy(() =>
  import("./StatsSection").then((m) => ({ default: m.StatsSection })),
);
const FeaturedCoursesSection = lazy(() =>
  import("./FeaturedCoursesSection").then((m) => ({ default: m.FeaturedCoursesSection })),
);
const HowItWorksSection = lazy(() =>
  import("./HowItWorksSection").then((m) => ({ default: m.HowItWorksSection })),
);
const TestimonialsSection = lazy(() =>
  import("./TestimonialsSection").then((m) => ({ default: m.TestimonialsSection })),
);
const CtaBannerSection = lazy(() =>
  import("./CtaBannerSection").then((m) => ({ default: m.CtaBannerSection })),
);
const TextBlockSection = lazy(() =>
  import("./TextBlockSection").then((m) => ({ default: m.TextBlockSection })),
);
const ImageBannerSection = lazy(() =>
  import("./ImageBannerSection").then((m) => ({ default: m.ImageBannerSection })),
);
const VideoEmbedSection = lazy(() =>
  import("./VideoEmbedSection").then((m) => ({ default: m.VideoEmbedSection })),
);
const FeaturedProductsSection = lazy(() =>
  import("./FeaturedProductsSection").then((m) => ({ default: m.FeaturedProductsSection })),
);
const FaqSection = lazy(() =>
  import("./FaqSection").then((m) => ({ default: m.FaqSection })),
);
const NoticePreviewSection = lazy(() =>
  import("./NoticePreviewSection").then((m) => ({ default: m.NoticePreviewSection })),
);

function SectionFallback() {
  return (
    <div className="container py-12">
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function renderSection(section: AnySection, eager: boolean) {
  // Hero is eager; everything else is wrapped in Suspense.
  switch (section.type) {
    case "hero":
      return <HeroSection key={section.id} config={section.config} />;
    case "stats":
      return (
        <Suspense key={section.id} fallback={<SectionFallback />}>
          <StatsSection config={section.config} />
        </Suspense>
      );
    case "featured_courses":
      return (
        <Suspense key={section.id} fallback={<SectionFallback />}>
          <FeaturedCoursesSection config={section.config} />
        </Suspense>
      );
    case "how_it_works":
      return (
        <Suspense key={section.id} fallback={<SectionFallback />}>
          <HowItWorksSection config={section.config} />
        </Suspense>
      );
    case "testimonials":
      return (
        <Suspense key={section.id} fallback={<SectionFallback />}>
          <TestimonialsSection config={section.config} />
        </Suspense>
      );
    case "cta_banner":
      return (
        <Suspense key={section.id} fallback={<SectionFallback />}>
          <CtaBannerSection config={section.config} />
        </Suspense>
      );
    case "text_block":
      return (
        <Suspense key={section.id} fallback={<SectionFallback />}>
          <TextBlockSection config={section.config} />
        </Suspense>
      );
    case "image_banner":
      return (
        <Suspense key={section.id} fallback={<SectionFallback />}>
          <ImageBannerSection config={section.config} />
        </Suspense>
      );
    case "video_embed":
      return (
        <Suspense key={section.id} fallback={<SectionFallback />}>
          <VideoEmbedSection config={section.config} />
        </Suspense>
      );
    case "featured_products":
      return (
        <Suspense key={section.id} fallback={<SectionFallback />}>
          <FeaturedProductsSection config={section.config} />
        </Suspense>
      );
    case "faq":
      return (
        <Suspense key={section.id} fallback={<SectionFallback />}>
          <FaqSection config={section.config} />
        </Suspense>
      );
    case "notice_preview":
      return (
        <Suspense key={section.id} fallback={<SectionFallback />}>
          <NoticePreviewSection config={section.config} />
        </Suspense>
      );
    default:
      return null;
  }
}

export function HomepageRenderer() {
  const { data, isLoading } = useHomepageConfig();

  if (isLoading) {
    return (
      <>
        <SectionFallback />
        <SectionFallback />
      </>
    );
  }

  const sections = data ?? [];
  if (sections.length === 0) {
    return <EmptyHomepage />;
  }

  return <>{sections.map((s, i) => renderSection(s, i === 0))}</>;
}
