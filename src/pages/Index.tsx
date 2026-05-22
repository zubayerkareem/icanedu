import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/CourseCard";
import { ProductCard, ProductCardSkeleton } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { ISSB_COURSES, CADET_COURSES } from "@/lib/courses/mock";
import { mockProducts } from "@/lib/products/mock";
import type { Course } from "@/lib/courses/types";
import type { Product } from "@/lib/products/types";
import { SuccessStoriesSection } from "@/components/home/SuccessStoriesSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { NoticesSection } from "@/components/home/NoticesSection";
import { FounderSection } from "@/components/home/FounderSection";
import { EmptyHomepage } from "@/components/home/EmptyHomepage";

// ─── Generic lazy loaders ────────────────────────────────────────────────────

function useStaticCourses(courses: Course[], key: string) {
  return useQuery({
    queryKey: [key],
    staleTime: Infinity,
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return courses.slice(0, 8);
    },
  });
}

function useStaticProducts(products: Product[], key: string) {
  return useQuery({
    queryKey: [key],
    staleTime: Infinity,
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return products.slice(0, 8);
    },
  });
}

// ─── Course Grid ─────────────────────────────────────────────────────────────

function CoursesGrid({ title, courses, isLoading }: {
  title: string;
  courses: Course[];
  isLoading: boolean;
}) {
  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/courses">সব কোর্স দেখুন</Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Products Grid ────────────────────────────────────────────────────────────

function ProductsGrid() {
  const { data = [], isLoading } = useStaticProducts(mockProducts, "home_products");
  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              আমাদের পণ্যসমূহ
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              বই, গাইড, নোট ও প্রশ্নব্যাংক
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/products">সব পণ্য দেখুন</Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {data.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function IssbGrid() {
  const { data = [], isLoading } = useStaticCourses(ISSB_COURSES, "issb_home");
  return <CoursesGrid title="Courses OF ISSB" courses={data} isLoading={isLoading} />;
}

function CadetGrid() {
  const { data = [], isLoading } = useStaticCourses(CADET_COURSES, "cadet_home");
  return <CoursesGrid title="Courses OF Cadet" courses={data} isLoading={isLoading} />;
}

function ExampleGrid() {
  const { data = [], isLoading } = useStaticCourses(ISSB_COURSES, "example_home");
  return <CoursesGrid title="Example course grid" courses={data.slice(0, 4)} isLoading={isLoading} />;
}

const Index = () => (
  <>
    <NoticesSection />
    <EmptyHomepage />
    <IssbGrid />
    <CadetGrid />
    <ExampleGrid />
    <FounderSection />
    <ProductsGrid />
    <ReviewsSection />
    <SuccessStoriesSection />
  </>
);

export default Index;
