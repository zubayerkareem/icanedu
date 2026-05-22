import { Link } from "react-router-dom";
import { BookOpen, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMyOrders, type OrderStatus } from "@/hooks/useOrders";

const STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  pending:   { label: "অনুমোদন বাকি",    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "সক্রিয়",           color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  shipped:   { label: "সক্রিয়",           color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  delivered: { label: "সম্পন্ন",           color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  cancelled: { label: "বাতিল",            color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function MyCourses() {
  const { data: allOrders = [], isLoading } = useMyOrders();
  const enrollments = allOrders.filter((o) => o.order_type === "course");

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">আমার কোর্স</h1>
      <p className="mt-1 text-sm text-muted-foreground">আপনার নথিভুক্ত কোর্সসমূহ</p>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-muted/30" />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((order) => {
              const status = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
              const isActive = order.status === "confirmed" || order.status === "shipped";
              return (
                <div key={order.id} className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mb-4">
                    <BookOpen className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-medium text-foreground leading-snug line-clamp-2">{order.product_name}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    নথিভুক্তি: {new Date(order.created_at).toLocaleDateString("bn-BD", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge className={`text-xs ${status.color}`}>{status.label}</Badge>
                    {isActive && (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" /> চালু আছে
                      </span>
                    )}
                  </div>
                  <p className="mt-3 font-heading text-base font-bold text-accent">
                    ৳{order.total_price.toLocaleString("bn-BD")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
