import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/CourseCard";
import { t } from "@/lib/strings";
import type { Course } from "@/lib/courses/types";
import type { FeaturedCoursesConfig } from "@/lib/page-builder/types";

function useFeaturedCourses(config: FeaturedCoursesConfig) {
  return useQuery({
    queryKey: ["featured_courses", config.source, config.count, config.manualIds],
    staleTime: 60 * 1000,
    queryFn: async (): Promise<Course[]> => {
      try {
        let q = supabase.from("courses").select("*").limit(config.count);
        if (config.source === "manual" && config.manualIds.length > 0) {
          q = q.in("id", config.manualIds);
        } else if (config.source === "popular") {
          q = q.order("enrollment_count", { ascending: false });
        } else {
          q = q.order("created_at", { ascending: false });
        }
        const { data, error } = await q;
        if (error) return [];
        return (data ?? []) as Course[];
      } catch {
        return [];
      }
    },
  });
}

export function FeaturedCoursesSection({ config }: { config: FeaturedCoursesConfig }) {
  const { data, isLoading } = useFeaturedCourses(config);
  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {config.heading}
          </h2>
          {config.showSeeAll && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/courses">{t.home.seeAllCourses}</Link>
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: config.count }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            {t.home.noCourses}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
