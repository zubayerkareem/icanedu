import { Link } from "react-router-dom";
import {
  BookOpen, Package, Users, ShoppingBag, TrendingUp, Bell,
  RefreshCw, BookMarked, ShoppingCart,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/strings";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

// ── helpers ──────────────────────────────────────────────────────────────────
function bnNum(n: number) {
  try { return new Intl.NumberFormat("bn-BD").format(n); } catch { return String(n); }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "এইমাত্র";
  if (m < 60) return `${m} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ঘণ্টা আগে`;
  const d = Math.floor(h / 24);
  return `${d} দিন আগে`;
}

// ── stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, href, color, loading, prefix = "",
}: {
  label: string; value: number; icon: React.ElementType;
  href: string; color: string; loading: boolean; prefix?: string;
}) {
  return (
    <Link
      to={href}
      className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-current/10 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60" />
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 font-heading text-2xl font-bold text-foreground">
          {loading
            ? <span className="inline-block h-7 w-14 animate-pulse rounded bg-muted" />
            : `${prefix}${bnNum(value)}`
          }
        </p>
      </div>
    </Link>
  );
}

// ── chart tooltip ─────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, prefix = "" }: {
  active?: boolean; payload?: { value: number; name: string; color: string }[];
  label?: string; prefix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs">
      {label && <p className="mb-1.5 font-medium text-foreground">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5" style={{ color: p.color }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{prefix}{bnNum(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

// ── skeleton block ────────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

// ── main component ────────────────────────────────────────────────────────────
export default function AdminHome() {
  const { data: d, isLoading, refetch, isFetching } = useAdminDashboard();

  const statCards = [
    { key: "totalCourses",   label: "মোট কোর্স",           icon: BookOpen,    href: "/admin/courses",  color: "text-blue-500" },
    { key: "totalProducts",  label: "মোট পণ্য",             icon: Package,     href: "/admin/products", color: "text-purple-500" },
    { key: "totalStudents",  label: "নিবন্ধিত শিক্ষার্থী",  icon: Users,       href: "/admin/students", color: "text-green-500" },
    { key: "activeOrders",   label: "চলমান অর্ডার",         icon: ShoppingBag, href: "/admin/orders",   color: "text-amber-500" },
    { key: "totalRevenue",   label: "মোট আয়",              icon: TrendingUp,  href: "/admin/orders",   color: "text-emerald-500", prefix: "৳" },
    { key: "totalNotices",   label: "মোট নোটিশ",            icon: Bell,        href: "/admin/notices",  color: "text-rose-500" },
  ] as const;

  const ACTIVITY_COLORS: Record<string, { bg: string; icon: React.ElementType; dot: string }> = {
    order:   { bg: "bg-blue-100 dark:bg-blue-900/30",   icon: ShoppingCart,  dot: "bg-blue-500" },
    course:  { bg: "bg-purple-100 dark:bg-purple-900/30", icon: BookMarked,  dot: "bg-purple-500" },
    student: { bg: "bg-green-100 dark:bg-green-900/30",  icon: Users,        dot: "bg-green-500" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t.admin.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">সাইটের সার্বিক পরিস্থিতির একটি ওভারভিউ</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          রিফ্রেশ
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map(({ key, label, icon, href, color, ...rest }) => (
          <StatCard
            key={key}
            label={label}
            value={(d as Record<string, number>)?.[key] ?? 0}
            icon={icon}
            href={href}
            color={color}
            loading={isLoading}
            prefix={"prefix" in rest ? rest.prefix : ""}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily orders bar chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <p className="font-medium text-foreground">অর্ডার — শেষ ৩০ দিন</p>
            <p className="text-xs text-muted-foreground">দৈনিক অর্ডার সংখ্যা</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={d?.dailyOrders} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval={6}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTip />} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="orders" name="অর্ডার" fill="#3b82f6" radius={[3,3,0,0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly revenue area chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <p className="font-medium text-foreground">আয় — শেষ ৬ মাস</p>
            <p className="text-xs text-muted-foreground">মাসিক মোট আয় (ডেলিভার্ড অর্ডার)</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={d?.monthlyRevenue} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `৳${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
                />
                <Tooltip content={<ChartTip prefix="৳" />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="আয়"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row: donut charts + timeline */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1.6fr]">

        {/* Order by status donut */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-1 font-medium text-foreground">অর্ডার স্ট্যাটাস</p>
          <p className="mb-4 text-xs text-muted-foreground">সর্বশেষ ২০টি অর্ডার</p>
          {isLoading ? (
            <Skeleton className="mx-auto h-44 w-44 rounded-full" />
          ) : !d?.byStatus.length ? (
            <p className="py-10 text-center text-sm text-muted-foreground">ডেটা নেই</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={d.byStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {d.byStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [bnNum(v), n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                {d.byStatus.map((s) => (
                  <span key={s.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                    {s.name} ({bnNum(s.value)})
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Order by type donut */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-1 font-medium text-foreground">অর্ডার ধরন</p>
          <p className="mb-4 text-xs text-muted-foreground">পণ্য বনাম কোর্স</p>
          {isLoading ? (
            <Skeleton className="mx-auto h-44 w-44 rounded-full" />
          ) : !d?.byType.length ? (
            <p className="py-10 text-center text-sm text-muted-foreground">ডেটা নেই</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={d.byType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {d.byType.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [bnNum(v), n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                {d.byType.map((s) => (
                  <span key={s.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                    {s.name} ({bnNum(s.value)})
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent activities timeline */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">সাম্প্রতিক কার্যক্রম</p>
              <p className="text-xs text-muted-foreground">সর্বশেষ অর্ডার ও নিবন্ধন</p>
            </div>
            <Link to="/admin/orders">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">সব দেখুন</Badge>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !d?.recentActivity.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">কোনো কার্যক্রম নেই</p>
          ) : (
            <div className="relative">
              {/* vertical line */}
              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

              <div className="space-y-0">
                {d.recentActivity.map((act, idx) => {
                  const cfg = ACTIVITY_COLORS[act.type] ?? ACTIVITY_COLORS.order;
                  const Icon = cfg.icon;
                  const isLast = idx === d.recentActivity.length - 1;
                  return (
                    <div key={act.id} className={`relative flex gap-4 ${isLast ? "" : "pb-4"}`}>
                      {/* dot on the line */}
                      <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                        <Icon className="h-3.5 w-3.5 text-foreground/70" />
                      </div>

                      {/* content */}
                      <div className="flex-1 pt-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground leading-tight line-clamp-1">{act.title}</p>
                          {act.amount != null && (
                            <span className="shrink-0 text-xs font-semibold text-accent">৳{bnNum(act.amount)}</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{act.subtitle}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/60">{timeAgo(act.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
