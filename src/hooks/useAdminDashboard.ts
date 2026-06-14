import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DailyData   { date: string; orders: number; revenue: number }
export interface MonthlyData { month: string; revenue: number; orders: number }
export interface SliceData   { name: string; value: number; color: string }

export interface RecentActivity {
  id: string;
  type: "order" | "course" | "student";
  title: string;
  subtitle: string;
  amount?: number;
  created_at: string;
}

export interface AdminDashboardData {
  totalCourses:   number;
  totalProducts:  number;
  totalStudents:  number;
  activeOrders:   number;
  totalRevenue:   number;
  totalNotices:   number;
  dailyOrders:    DailyData[];
  monthlyRevenue: MonthlyData[];
  byStatus:       SliceData[];
  byType:         SliceData[];
  recentActivity: RecentActivity[];
}

const MONTH_LABELS = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];

const STATUS_COLORS: Record<string, string> = {
  pending:   "#f59e0b",
  confirmed: "#3b82f6",
  shipped:   "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

function pad(n: number) { return String(n).padStart(2, "0"); }
function ymd(d: Date)   { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

export function useAdminDashboard() {
  return useQuery<AdminDashboardData>({
    queryKey: ["admin_dashboard"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [coursesRes, productsRes, studentsRes, noticesRes, ordersRes, recentOrdersRes, revenueRes] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("notices").select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id, order_type, product_name, customer_name, total_price, status, created_at")
          .gte("created_at", sixMonthsAgo.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("id, order_type, product_name, customer_name, total_price, status, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("orders")
          .select("total_price")
          .in("status", ["confirmed", "shipped", "delivered"]),
      ]);

      const orders = ordersRes.data ?? [];
      const recentOrders = recentOrdersRes.data ?? [];

      // ── Active & Revenue ─────────────────────────────────────────────
      const activeOrders = orders.filter((o) => !["delivered","cancelled"].includes(o.status)).length;
      const totalRevenue  = (revenueRes.data ?? [])
        .reduce((sum, o) => sum + (o.total_price ?? 0), 0);

      // ── Daily orders — last 30 days ──────────────────────────────────
      const today = new Date();
      const dailyMap = new Map<string, { orders: number; revenue: number }>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        dailyMap.set(ymd(d), { orders: 0, revenue: 0 });
      }
      orders.forEach((o) => {
        const key = ymd(new Date(o.created_at));
        if (dailyMap.has(key)) {
          const entry = dailyMap.get(key)!;
          entry.orders++;
          entry.revenue += o.total_price ?? 0;
        }
      });
      const dailyOrders: DailyData[] = Array.from(dailyMap.entries()).map(([date, v]) => ({
        date: date.slice(5), // MM-DD
        orders: v.orders,
        revenue: v.revenue,
      }));

      // ── Monthly revenue — last 6 months ─────────────────────────────
      const monthlyMap = new Map<string, { revenue: number; orders: number }>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today); d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${pad(d.getMonth()+1)}`;
        monthlyMap.set(key, { revenue: 0, orders: 0 });
      }
      orders.forEach((o) => {
        const d   = new Date(o.created_at);
        const key = `${d.getFullYear()}-${pad(d.getMonth()+1)}`;
        if (monthlyMap.has(key)) {
          const entry = monthlyMap.get(key)!;
          entry.revenue += o.total_price ?? 0;
          entry.orders++;
        }
      });
      const monthlyRevenue: MonthlyData[] = Array.from(monthlyMap.entries()).map(([key, v]) => ({
        month: MONTH_LABELS[parseInt(key.split("-")[1]) - 1],
        revenue: v.revenue,
        orders:  v.orders,
      }));

      // ── By status ────────────────────────────────────────────────────
      const statusCount: Record<string, number> = {};
      recentOrders.forEach((o) => { statusCount[o.status] = (statusCount[o.status] ?? 0) + 1; });
      const STATUS_LABELS: Record<string, string> = {
        pending: "অপেক্ষমাণ", confirmed: "নিশ্চিত",
        shipped: "পাঠানো",    delivered: "পৌঁছেছে", cancelled: "বাতিল",
      };
      const byStatus: SliceData[] = Object.entries(statusCount).map(([k, v]) => ({
        name: STATUS_LABELS[k] ?? k, value: v, color: STATUS_COLORS[k] ?? "#94a3b8",
      }));

      // ── By type ──────────────────────────────────────────────────────
      const productCount = recentOrders.filter((o) => o.order_type === "product").length;
      const courseCount  = recentOrders.filter((o) => o.order_type === "course").length;
      const byType: SliceData[] = [
        { name: "পণ্য",  value: productCount, color: "#3b82f6" },
        { name: "কোর্স", value: courseCount,  color: "#8b5cf6" },
      ].filter((d) => d.value > 0);

      // ── Recent activities ────────────────────────────────────────────
      const recentActivity: RecentActivity[] = recentOrders.slice(0, 5).map((o) => ({
        id:         o.id,
        type:       o.order_type === "course" ? "course" : "order",
        title:      o.product_name,
        subtitle:   o.customer_name,
        amount:     o.total_price,
        created_at: o.created_at,
      }));

      return {
        totalCourses:   coursesRes.count  ?? 0,
        totalProducts:  productsRes.count ?? 0,
        totalStudents:  studentsRes.count ?? 0,
        activeOrders,
        totalRevenue,
        totalNotices:   noticesRes.count  ?? 0,
        dailyOrders,
        monthlyRevenue,
        byStatus,
        byType,
        recentActivity,
      };
    },
  });
}
