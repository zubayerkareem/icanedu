import { Link } from "react-router-dom";
import { Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/strings";
import { useTranslation } from "@/lib/i18n";
import type { Course } from "@/lib/courses/types";

function formatBnNumber(n: number): string {
  try {
    return new Intl.NumberFormat("bn-BD").format(n);
  } catch {
    return String(n);
  }
}

export function CourseCard({ course }: { course: Course }) {
  const tr = useTranslation();
  const href = `/courses/${course.slug ?? course.id}`;
  const hasDiscount =
    typeof course.discount_price === "number" &&
    typeof course.price === "number" &&
    course.discount_price < course.price;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={href}
        className="relative block aspect-video w-full overflow-hidden bg-muted"
      >
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted to-secondary" />
        )}
        {course.category && (
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 bg-background/90 text-xs backdrop-blur"
          >
            {course.category}
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-heading text-base font-semibold text-foreground">
          <Link to={href} className="hover:text-accent">
            {course.title}
          </Link>
        </h3>

        {course.teacher_name && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              {course.teacher_avatar && <AvatarImage src={course.teacher_avatar} />}
              <AvatarFallback className="text-[10px]">
                {course.teacher_name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{course.teacher_name}</span>
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {course.duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{course.duration}</span>
            </div>
          )}
          {typeof course.enrollment_count === "number" && course.enrollment_count > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>
                {formatBnNumber(course.enrollment_count)} {tr.home.cards.students}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="font-heading text-lg font-bold text-accent">
                ৳{formatBnNumber(course.discount_price!)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ৳{formatBnNumber(course.price!)}
              </span>
            </>
          ) : typeof course.price === "number" && course.price > 0 ? (
            <span className="font-heading text-lg font-bold text-foreground">
              ৳{formatBnNumber(course.price)}
            </span>
          ) : (
            <span className="font-heading text-base font-semibold text-success">
              {tr.home.cards.free}
            </span>
          )}
        </div>

        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to={href}>{tr.home.cards.viewDetails}</Link>
        </Button>
      </div>
    </article>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card p-4">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-3 h-8 w-full" />
    </div>
  );
}
