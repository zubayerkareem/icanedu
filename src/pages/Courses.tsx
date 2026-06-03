import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/CourseCard";
import { useCourses } from "@/hooks/useCourses";
import { t } from "@/lib/strings";

// Human-readable labels for known categories
const CATEGORY_LABELS: Record<string, string> = {
  ISSB:   "ISSB",
  Cadet:  "ক্যাডেট কলেজ",
  Skills: "স্কিলস",
};

function catLabel(cat: string) {
  return CATEGORY_LABELS[cat] ?? cat;
}

function groupLabel(cat: string) {
  return CATEGORY_LABELS[cat] ? `${CATEGORY_LABELS[cat]} কোর্সসমূহ` : `${cat} কোর্সসমূহ`;
}

export default function Courses() {
  const [category, setCategory] = useState("all");

  const { data, isLoading } = useCourses({ category, sort: "newest", pageSize: 100 });
  const items      = data?.items      ?? [];
  const categories = data?.categories ?? [];

  const groups = useMemo(() => {
    if (category !== "all") {
      return [{ label: catLabel(category), items }];
    }
    const map: Record<string, typeof items> = {};
    items.forEach((c) => {
      const cat = c.category ?? "অন্যান্য";
      if (!map[cat]) map[cat] = [];
      map[cat].push(c);
    });
    return Object.entries(map).map(([cat, list]) => ({
      label: groupLabel(cat),
      items: list,
    }));
  }, [category, items]);

  return (
    <>
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container py-10 sm:py-14">
          <nav aria-label="breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">{t.courses.breadcrumbHome}</Link></li>
              <li aria-hidden>›</li>
              <li className="text-foreground">{t.courses.breadcrumbCourses}</li>
            </ol>
          </nav>
          <h1 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            {t.courses.pageTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {t.courses.pageSubtitle}
          </p>

          {/* Dynamic category pills */}
          {!isLoading && categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("all")}
                className={[
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors border",
                  category === "all"
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground",
                ].join(" ")}
              >
                সব কোর্স
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={[
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors border",
                    category === cat
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground",
                  ].join(" ")}
                >
                  {catLabel(cat)}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Course sections */}
      <section className="py-10 sm:py-14">
        <div className="container space-y-14">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-20 text-center">
              <h3 className="font-heading text-lg font-semibold text-foreground">{t.courses.empty}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.courses.emptyDesc}</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <h2 className="mb-6 font-heading text-xl font-bold text-foreground sm:text-2xl border-l-4 border-accent pl-3">
                  {group.label}
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {group.items.map((c) => (
                    <CourseCard key={c.id} course={c} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
