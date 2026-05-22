import { Link } from "react-router-dom";
import {
  BookOpen, ShoppingBag, ClipboardList, ChevronRight,
  Bell, Package, BookMarked, ShoppingCart, Megaphone,
  Sparkles, Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrders, type OrderStatus } from "@/hooks/useOrders";
import { useNotices } from "@/hooks/useNotices";
import { useCourses } from "@/hooks/useCourses";
import { t } from "@/lib/strings";

// ── helpers ────────────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "সুপ্রভাত";
  if (h < 17) return "শুভ বিকাল";
  return "শুভ সন্ধ্যা";
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return "এইমাত্র";
  if (m < 60) return `${m} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ঘণ্টা আগে`;
  return `${Math.floor(h / 24)} দিন আগে`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

const STATUS_BADGE: Record<OrderStatus, { label: string; color: string }> = {
  pending:   { label: "অপেক্ষমাণ",   color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "নিশ্চিত",      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped:   { label: "পাঠানো",       color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  delivered: { label: "পৌঁছেছে",      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "বাতিল",        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const NOTICE_BADGE_COLORS: Record<string, string> = {
  default:     "bg-accent/10 text-accent",
  secondary:   "bg-muted text-muted-foreground",
  destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  outline:     "border border-border text-muted-foreground",
};

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

// ── main ───────────────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const { profile, user }        = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders();
  const { data: notices = [], isLoading: noticesLoading } = useNotices(4);
  const { data: coursesData, isLoading: coursesLoading } = useCourses({ sort: "newest", pageSize: 4 });

  const name         = profile?.full_name || user?.email?.split("@")[0] || "শিক্ষার্থী";
  const courseCount  = orders.filter((o) => o.order_type === "course").length;
  const orderCount   = orders.filter((o) => o.order_type === "product").length;
  const recentOrders = orders.slice(0, 6);
  const newCourses   = coursesData?.items ?? [];

  const stats = [
    { label: "নথিভুক্ত কোর্স",  value: courseCount,  icon: BookOpen,      href: "/dashboard/courses", color: "text-accent",       bg: "bg-accent/10" },
    { label: "পণ্য অর্ডার",      value: orderCount,   icon: ShoppingBag,   href: "/dashboard/orders",  color: "text-blue-500",    bg: "bg-blue-500/10" },
    { label: "পরীক্ষা",          value: 0,            icon: ClipboardList, href: "/dashboard/exams",   color: "text-purple-500",  bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-7">

      {/* ── Welcome banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/90 to-accent px-6 py-7 text-accent-foreground shadow-md">
        <div className="relative z-10">
          <p className="text-sm font-medium opacity-80">{greeting()},</p>
          <h1 className="mt-0.5 font-heading text-2xl font-bold sm:text-3xl">{name}</h1>
          <p className="mt-2 max-w-md text-sm opacity-75">
            আজকের লক্ষ্য নির্ধারণ করুন এবং প্রস্তুতি অব্যাহত রাখুন। সাফল্য কাছেই।
          </p>
          <Link
            to="/courses"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" /> কোর্স দেখুন
          </Link>
        </div>
        {/* decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 right-16 h-28 w-28 rounded-full bg-white/5" />
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.href}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 font-heading text-2xl font-bold text-foreground">
                {ordersLoading ? <Skeleton className="inline-block h-6 w-8" /> : s.value}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-60 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      {/* ── Main content grid ───────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* Left column */}
        <div className="space-y-6">

          {/* New courses */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">নতুন কোর্স</h2>
                <p className="text-xs text-muted-foreground">সম্প্রতি যোগ হওয়া কোর্সসমূহ</p>
              </div>
              <Link to="/courses" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                সব কোর্স <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {coursesLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[1,2,3,4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : newCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                <BookOpen className="mb-2 h-8 w-8 opacity-30" />
                কোনো কোর্স পাওয়া যায়নি
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {newCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.slug ?? course.id}`}
                    className="group flex gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-accent/40"
                  >
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="h-14 w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <BookOpen className="h-6 w-6 text-accent" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                        {course.title}
                      </p>
                      {course.category && (
                        <span className="mt-1 inline-block text-[10px] text-muted-foreground">{course.category}</span>
                      )}
                      <p className="mt-1 font-heading text-sm font-bold text-accent">
                        {course.discount_price ? `৳${course.discount_price}` : course.price ? `৳${course.price}` : "ফ্রি"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent activity timeline */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">সাম্প্রতিক কার্যক্রম</h2>
                <p className="text-xs text-muted-foreground">আপনার সর্বশেষ অর্ডার ও নিবন্ধন</p>
              </div>
              <Link to="/dashboard/orders" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                সব অর্ডার <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              {ordersLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">কোনো কার্যক্রম নেই</p>
                  <Link to="/products" className="text-xs font-medium text-accent hover:underline">পণ্য দেখুন</Link>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[17px] top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-0">
                    {recentOrders.map((order, idx) => {
                      const isCourse = order.order_type === "course";
                      const statusCfg = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
                      const isLast = idx === recentOrders.length - 1;
                      return (
                        <div key={order.id} className={`relative flex gap-4 ${isLast ? "" : "pb-4"}`}>
                          <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-background ${isCourse ? "bg-purple-100 dark:bg-purple-900/40" : "bg-blue-100 dark:bg-blue-900/40"}`}>
                            {isCourse
                              ? <BookMarked className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                              : <ShoppingCart className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-foreground line-clamp-1">{order.product_name}</p>
                              <span className="shrink-0 text-xs font-bold text-accent">৳{order.total_price.toLocaleString()}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                              <Badge className={`h-4 px-1.5 text-[10px] ${statusCfg.color}`}>{statusCfg.label}</Badge>
                              <span className="text-[10px] text-muted-foreground/60">{timeAgo(order.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Recent notices */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">নোটিশ</h2>
                <p className="text-xs text-muted-foreground">সর্বশেষ ঘোষণা</p>
              </div>
              <Link to="/notices" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                সব <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {noticesLoading ? (
                [1,2,3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              ) : notices.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
                  <Bell className="h-7 w-7 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">কোনো নোটিশ নেই</p>
                </div>
              ) : (
                notices.map((notice) => (
                  <Link
                    key={notice.id}
                    to="/notices"
                    className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-accent/40"
                  >
                    <div className="flex items-start gap-2">
                      <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{notice.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {stripHtml(notice.content)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {notice.badge && (
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${NOTICE_BADGE_COLORS[notice.badge_variant] ?? NOTICE_BADGE_COLORS.default}`}>
                          {notice.badge}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground/60">
                        {new Date(notice.created_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="mb-3 font-heading text-base font-semibold text-foreground">দ্রুত অ্যাক্সেস</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "কোর্স দেখুন",    href: "/courses",   icon: BookOpen,      color: "text-accent    bg-accent/10" },
                { label: "পণ্য দেখুন",      href: "/products",  icon: Package,       color: "text-blue-500  bg-blue-500/10" },
                { label: "নোটিশবোর্ড",     href: "/notices",   icon: Bell,          color: "text-amber-500 bg-amber-500/10" },
                { label: "পরীক্ষা দিন",    href: "/dashboard/exams", icon: Star,    color: "text-purple-500 bg-purple-500/10" },
              ].map(({ label, href, icon: Icon, color }) => {
                const [textCls, bgCls] = color.split(" ");
                return (
                  <Link
                    key={href}
                    to={href}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-sm transition-all hover:shadow-md hover:border-accent/40"
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bgCls} ${textCls}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </Link>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
