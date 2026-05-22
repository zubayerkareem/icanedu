import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/CourseCard";
import { useCourses } from "@/hooks/useCourses";
import { t } from "@/lib/strings";

const PAGE_SIZE = 9;

function toBnNumber(n: number): string {
  try {
    return new Intl.NumberFormat("bn-BD").format(n);
  } catch {
    return String(n);
  }
}

export default function Courses() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);

  const updatePage = (p: number) => {
    const next = new URLSearchParams(params);
    if (p === 1) next.delete("page");
    else next.set("page", String(p));
    setParams(next, { replace: true });
  };

  const { data, isLoading, isFetching } = useCourses({
    search: "",
    category: "all",
    sort: "newest",
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = data?.totalPages ?? 1;
  const items = data?.items ?? [];

  const pageNumbers = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);

  return (
    <>
      {/* Page header */}
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container py-10 sm:py-14">
          <nav aria-label="breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <Link to="/" className="hover:text-foreground">
                  {t.courses.breadcrumbHome}
                </Link>
              </li>
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
        </div>
      </section>

      {/* Grid */}
      <section className="py-10 sm:py-14">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-20 text-center">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {t.courses.empty}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.courses.emptyDesc}</p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${
                isFetching ? "opacity-70" : "opacity-100"
              }`}
            >
              {items.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="pagination"
              className="mt-10 flex items-center justify-center gap-1"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => updatePage(Math.max(1, page - 1))}
                disabled={page <= 1}
                aria-label={t.home.prev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {pageNumbers.map((p, i) =>
                p === "…" ? (
                  <span
                    key={`gap-${i}`}
                    className="px-2 text-sm text-muted-foreground"
                    aria-hidden
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="icon"
                    className={
                      p === page
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : ""
                    }
                    onClick={() => updatePage(p as number)}
                    aria-current={p === page ? "page" : undefined}
                    aria-label={`${t.home.next} ${toBnNumber(p as number)}`}
                  >
                    <span className="text-sm font-medium">{toBnNumber(p as number)}</span>
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => updatePage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                aria-label={t.home.next}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}

function buildPageList(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | "…"> = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}
