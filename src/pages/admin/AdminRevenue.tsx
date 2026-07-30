import { useState, useMemo } from "react";
import { TrendingUp, BookOpen, Package, Calendar } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useAllCoursesForSelect } from "@/hooks/useAdminEnrollments";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useOfflineStudentIds } from "@/hooks/useStudents";

// ── helpers ───────────────────────────────────────────────────────────────────

function bnNum(n: number) {
  try { return new Intl.NumberFormat("bn-BD").format(n); } catch { return String(n); }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMonth(ym: string) {
  return new Date(ym + "-01").toLocaleDateString("bn-BD", { month: "long", year: "numeric" });
}

const REVENUE_STATUSES = new Set(["confirmed", "shipped", "delivered"]);

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "পেন্ডিং", confirmed: "কনফার্ম", shipped: "পাঠানো হয়েছে",
  delivered: "পৌঁছেছে", cancelled: "বাতিল",
};

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, prefix = "", color }: { label: string; value: number; prefix?: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 font-heading text-2xl font-bold ${color}`}>
        {prefix}{bnNum(value)}
      </p>
    </div>
  );
}

// ── course tab ────────────────────────────────────────────────────────────────

function CourseRevenueTab({ selectedMonth, offlineIds }: { selectedMonth: string; offlineIds: Set<string> }) {
  const { data: orders = [], isLoading } = useOrders();
  const { data: courses = [] } = useAllCoursesForSelect();
  const [selectedCourse, setSelectedCourse] = useState("");

  const onlineOrders = orders.filter((o) => !offlineIds.has(o.user_id ?? ""));
  const monthOrders = selectedMonth === "all"
    ? onlineOrders
    : onlineOrders.filter((o) => o.created_at.startsWith(selectedMonth));

  const courseOrders = monthOrders.filter((o) => o.order_type === "course");
  const filtered = selectedCourse
    ? courseOrders.filter((o) => o.product_id === selectedCourse)
    : courseOrders;

  const revenue   = filtered.filter((o) => REVENUE_STATUSES.has(o.status)).reduce((s, o) => s + o.total_price, 0);
  const pending   = filtered.filter((o) => o.status === "pending").length;
  const confirmed = filtered.filter((o) => o.status === "confirmed").length;

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="">সব কোর্স</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        {selectedCourse && (
          <button
            onClick={() => setSelectedCourse("")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕ ক্লিয়ার
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="মোট আয়"    value={revenue}         prefix="৳" color="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="মোট অর্ডার" value={filtered.length}            color="text-foreground" />
        <StatCard label="পেন্ডিং"    value={pending}                     color="text-amber-600 dark:text-amber-400" />
        <StatCard label="কনফার্মড"   value={confirmed}                   color="text-blue-600 dark:text-blue-400" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">কোনো অর্ডার পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">তারিখ</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">ছাত্র</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">কোর্স</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">পরিমাণ</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(o.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{o.customer_name}</td>
                    <td className="px-4 py-3 text-foreground max-w-[200px] truncate">{o.product_name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">৳{bnNum(o.total_price)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[o.status] ?? ""}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30">
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-foreground">মোট আয় (কনফার্মড+ডেলিভার্ড)</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">৳{bnNum(revenue)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── product tab ───────────────────────────────────────────────────────────────

function ProductRevenueTab({ selectedMonth, offlineIds }: { selectedMonth: string; offlineIds: Set<string> }) {
  const { data: orders = [], isLoading } = useOrders();
  const { data: products = [] } = useAdminProducts();
  const [selectedProduct, setSelectedProduct] = useState("");

  const onlineOrders = orders.filter((o) => !offlineIds.has(o.user_id ?? ""));
  const monthOrders = selectedMonth === "all"
    ? onlineOrders
    : onlineOrders.filter((o) => o.created_at.startsWith(selectedMonth));

  const productOrders = monthOrders.filter((o) => o.order_type === "product");
  const filtered = selectedProduct
    ? productOrders.filter((o) => o.product_id === selectedProduct)
    : productOrders;

  const revenue = filtered.filter((o) => REVENUE_STATUSES.has(o.status)).reduce((s, o) => s + o.total_price, 0);
  const pending = filtered.filter((o) => o.status === "pending").length;
  const shipped = filtered.filter((o) => o.status === "shipped").length;

  return (
    <div className="space-y-5">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="">সব পণ্য</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {selectedProduct && (
          <button
            onClick={() => setSelectedProduct("")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕ ক্লিয়ার
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="মোট আয়"        value={revenue}         prefix="৳" color="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="মোট অর্ডার"     value={filtered.length}            color="text-foreground" />
        <StatCard label="পেন্ডিং"         value={pending}                    color="text-amber-600 dark:text-amber-400" />
        <StatCard label="পাঠানো হয়েছে"   value={shipped}                    color="text-purple-600 dark:text-purple-400" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">কোনো অর্ডার পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">তারিখ</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">গ্রাহক</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">পণ্য</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">পরিমাণ</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(o.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{o.customer_name}</td>
                    <td className="px-4 py-3 text-foreground max-w-[200px] truncate">{o.product_name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">৳{bnNum(o.total_price)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[o.status] ?? ""}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30">
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-foreground">মোট আয় (কনফার্মড+ডেলিভার্ড)</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">৳{bnNum(revenue)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

type Tab = "course" | "product";

export default function AdminRevenue() {
  const [tab, setTab]                     = useState<Tab>("course");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const { data: orders = [] }             = useOrders();
  const offlineIds                        = useOfflineStudentIds();

  // Exclude offline students' orders from all revenue calculations
  const onlineOrders = useMemo(
    () => orders.filter((o) => !offlineIds.has(o.user_id ?? "")),
    [orders, offlineIds],
  );

  // Derive unique months from online orders only, newest first
  const months = useMemo(() => {
    const set = new Set(onlineOrders.map((o) => o.created_at.slice(0, 7)));
    return [...set].sort().reverse();
  }, [onlineOrders]);

  const filteredOrders = selectedMonth === "all"
    ? onlineOrders
    : onlineOrders.filter((o) => o.created_at.startsWith(selectedMonth));

  const totalRevenue = filteredOrders
    .filter((o) => REVENUE_STATUSES.has(o.status))
    .reduce((s, o) => s + o.total_price, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">রেভেনিউ</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">কোর্স ও পণ্য অনুযায়ী আয়ের বিবরণ</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month selector */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm text-foreground focus:outline-none"
            >
              <option value="all">সব সময়</option>
              {months.map((m) => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </div>

          {/* Grand total badge */}
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 px-4 py-2">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-muted-foreground">
              {selectedMonth === "all" ? "সর্বমোট আয়" : formatMonth(selectedMonth)}
            </span>
            <span className="font-heading text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ৳{bnNum(totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-full border border-border bg-muted/30 p-1 w-fit">
        <button
          onClick={() => setTab("course")}
          className={[
            "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors",
            tab === "course"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <BookOpen className="h-3.5 w-3.5" />
          কোর্স
        </button>
        <button
          onClick={() => setTab("product")}
          className={[
            "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors",
            tab === "product"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Package className="h-3.5 w-3.5" />
          পণ্য
        </button>
      </div>

      {/* Tab content */}
      {tab === "course"
        ? <CourseRevenueTab selectedMonth={selectedMonth} offlineIds={offlineIds} />
        : <ProductRevenueTab selectedMonth={selectedMonth} offlineIds={offlineIds} />
      }
    </div>
  );
}
