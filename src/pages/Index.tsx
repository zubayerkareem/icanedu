import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/CourseCard";
import { ProductCard, ProductCardSkeleton } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useCourses } from "@/hooks/useCourses";
import type { Product } from "@/lib/products/types";
import type { Course } from "@/lib/courses/types";
import { useTranslation } from "@/lib/i18n";
import { SuccessStoriesSection } from "@/components/home/SuccessStoriesSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { NoticesSection } from "@/components/home/NoticesSection";
import { FounderSection } from "@/components/home/FounderSection";
import { HeroSlider } from "@/components/home/HeroSlider";

// ─── Category ordering & labels (mirrors Courses.tsx) ────────────────────────

const CATEGORY_ORDER = ["ISSB", "Cadet", "Skills"];

const CATEGORY_LABELS: Record<string, string> = {
  ISSB:   "ISSB",
  Cadet:  "ক্যাডেট কলেজ",
  Skills: "স্কিলস",
};

// ─── Course Grid ─────────────────────────────────────────────────────────────

function CoursesGrid({ title, courses, isLoading, mobileSlider = true, highlighted = false, badgeLabel }: {
  title: string;
  courses: Course[];
  isLoading: boolean;
  mobileSlider?: boolean;
  highlighted?: boolean;
  badgeLabel?: string;
}) {
  const tr = useTranslation();
  return (
    <section className={highlighted ? "relative py-12 sm:py-16 bg-gradient-to-b from-accent/5 to-transparent" : "py-12 sm:py-16"}>

      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            {highlighted && badgeLabel && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground uppercase tracking-wide">
                {badgeLabel}
              </span>
            )}
            <h2 className="font-heading text-2xl font-bold sm:text-3xl text-foreground">{title}</h2>
          </div>
          <Button variant={highlighted ? "default" : "outline"} size="sm" asChild>
            <Link to="/courses">{tr.home.seeAllCourses}</Link>
          </Button>
        </div>
        {isLoading ? (
          <>
            {mobileSlider ? (
              <div className="flex gap-4 overflow-x-auto pb-2 sm:hidden" style={{ scrollSnapType: "x mandatory" }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[72vw] shrink-0" style={{ scrollSnapAlign: "start" }}>
                    <CourseCardSkeleton />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:hidden">
                {Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            )}
            <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
          </>
        ) : (
          <>
            {mobileSlider ? (
              <div className="flex gap-4 overflow-x-auto pb-2 sm:hidden" style={{ scrollSnapType: "x mandatory" }}>
                {courses.map((c) => (
                  <div key={c.id} className="w-[72vw] shrink-0" style={{ scrollSnapAlign: "start" }}>
                    <CourseCard course={c} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:hidden">
                {courses.map((c) => <CourseCard key={c.id} course={c} />)}
              </div>
            )}
            <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
              {courses.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─── All Courses Section (dynamic — all categories, no cap) ──────────────────

function AllCoursesSection() {
  const { data, isLoading } = useCourses({ sort: "manual", pageSize: 500 });
  const items = data?.items ?? [];

  const groups = useMemo(() => {
    const map: Record<string, Course[]> = {};
    items.forEach((c) => {
      const cat = c.category ?? "অন্যান্য";
      if (!map[cat]) map[cat] = [];
      map[cat].push(c);
    });
    const allCats = Object.keys(map);
    const ordered = [
      ...CATEGORY_ORDER.filter((c) => allCats.includes(c)),
      ...allCats.filter((c) => !CATEGORY_ORDER.includes(c)),
    ];
    return ordered.map((cat) => ({
      cat,
      label: CATEGORY_LABELS[cat] ? `${CATEGORY_LABELS[cat]} কোর্সসমূহ` : `${cat} কোর্সসমূহ`,
      items: map[cat],
    }));
  }, [items]);

  if (isLoading) {
    return (
      <>
        <CoursesGrid
          title="ISSB কোর্সসমূহ"
          courses={[]}
          isLoading
          mobileSlider={false}
          highlighted
          badgeLabel="ISSB"
        />
        <CoursesGrid title="কোর্সসমূহ" courses={[]} isLoading />
      </>
    );
  }

  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((g, i) => (
        <CoursesGrid
          key={g.cat}
          title={g.label}
          courses={g.items}
          isLoading={false}
          highlighted={i === 0}
          badgeLabel={i === 0 ? (CATEGORY_LABELS[g.cat] ?? g.cat) : undefined}
          mobileSlider={i !== 0}
        />
      ))}
    </>
  );
}

// ─── Products Grid ────────────────────────────────────────────────────────────

function useSupabaseProducts() {
  return useQuery<Product[]>({
    queryKey: ["home_products_db"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });
}

function ProductsGrid() {
  const { data: products = [], isLoading } = useSupabaseProducts();
  const tr = useTranslation();
  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {tr.home.productsTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tr.home.productsSubtitle}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/products">{tr.home.seeAllProducts}</Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Index = () => (
  <>
    <HeroSlider />
    <NoticesSection />
    <AllCoursesSection />
    <FounderSection />
    <ProductsGrid />
    <ReviewsSection />
    <SuccessStoriesSection />
  </>
);

export default Index;
