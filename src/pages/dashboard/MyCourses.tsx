import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useMyOrders, type Order, type OrderStatus } from "@/hooks/useOrders";
import type { Course } from "@/lib/courses/types";
import { MOCK_COURSES } from "@/lib/courses/mock";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  pending:   { label: "অনুমোদন বাকি", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "সক্রিয়",        color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  shipped:   { label: "সক্রিয়",        color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  delivered: { label: "সম্পন্ন",        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  cancelled: { label: "বাতিল",         color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

// ─── Hook: fetch enrolled DB courses by product_id ────────────────────────────

function useEnrolledDbCourses(productIds: string[]) {
  return useQuery<Course[]>({
    queryKey: ["enrolled_db_courses", productIds],
    enabled: productIds.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const cols = "id, slug, title, thumbnail_url, category, duration, total_lessons, modules";

      // First match by id (UUIDs stored in orders)
      const { data: byId } = await supabase
        .from("courses")
        .select(cols)
        .in("id", productIds);

      const matchedIds = new Set((byId ?? []).map((c) => c.id));
      const remaining = productIds.filter((pid) => !matchedIds.has(pid));

      // Fallback: match remaining by slug
      let bySlug: Course[] = [];
      if (remaining.length > 0) {
        const { data } = await supabase
          .from("courses")
          .select(cols)
          .in("slug", remaining);
        bySlug = (data ?? []) as Course[];
      }

      const dbCourses = [...(byId ?? []), ...bySlug] as Course[];

      // Fill missing thumbnail_url from MOCK_COURSES fallback
      return dbCourses.map((c) => {
        if (c.thumbnail_url) return c;
        const mock = MOCK_COURSES.find((m) => m.id === c.id || m.slug === c.slug || m.title === c.title);
        return mock?.thumbnail_url ? { ...c, thumbnail_url: mock.thumbnail_url } : c;
      });
    },
  });
}

// ─── Enrolled Course Card ─────────────────────────────────────────────────────

function EnrolledCourseCard({ order, dbCourses }: { order: Order; dbCourses: Course[] }) {
  const course: Course | undefined =
    dbCourses.find((c) => c.id === order.product_id || c.slug === order.product_id) ??
    MOCK_COURSES.find((c) => c.id === order.product_id || c.slug === order.product_id || c.title === order.product_name);

  const status = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
  const isActive = order.status === "confirmed" || order.status === "shipped" || order.status === "delivered";
  const courseId = course?.id ?? order.product_id ?? "";
  const thumbnail = course?.thumbnail_url;
  const displayName = course?.title ?? order.product_name;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Banner */}
      <div className="relative h-44 w-full bg-muted overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/30 via-accent/10 to-background">
            <span className="font-heading text-4xl font-black text-accent/50 select-none">
              {displayName.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <h3 className="font-heading font-bold text-white text-sm leading-snug line-clamp-2 drop-shadow">
            {displayName}
          </h3>
          <Badge className={`shrink-0 text-[10px] ${status.color}`}>{status.label}</Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(order.created_at).toLocaleDateString("bn-BD", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </span>
          {order.total_price > 0 && (
            <span className="font-bold text-accent">
              ৳{order.total_price.toLocaleString("bn-BD")}
            </span>
          )}
        </div>

        {/* Validity badge */}
        {(() => {
          if (!order.valid_until) return null;
          const exp = new Date(order.valid_until);
          const expired = exp <= new Date();
          return (
            <div className={`rounded-md px-2 py-1 text-xs font-medium ${expired ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"}`}>
              {expired
                ? "মেয়াদ শেষ হয়েছে"
                : `মেয়াদ: ${exp.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })} পর্যন্ত`}
            </div>
          );
        })()}

        {isActive && courseId && (
          <Button asChild className="w-full" size="sm">
            <Link to={`/dashboard/courses/${courseId}`}>
              কোর্স চালু করুন <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyCourses() {
  const { data: allOrders = [], isLoading } = useMyOrders();
  const enrollments = allOrders.filter((o) => o.order_type === "course");

  const productIds = enrollments
    .map((o) => o.product_id)
    .filter((id): id is string => !!id);

  const { data: dbCourses = [] } = useEnrolledDbCourses(productIds);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">আমার কোর্স</h1>
      <p className="mt-1 text-sm text-muted-foreground">আমার কোর্স</p>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-muted/30" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="font-medium text-muted-foreground">কোনো কোর্সে নথিভুক্ত নন</p>
            <p className="mt-1 text-sm text-muted-foreground">একটি কোর্স কিনুন এবং এখানে দেখুন।</p>
            <Link
              to="/courses"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              কোর্স দেখুন <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((order) => (
              <EnrolledCourseCard key={order.id} order={order} dbCourses={dbCourses} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
