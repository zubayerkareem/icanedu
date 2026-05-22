import { Link } from "react-router-dom";
import { ShoppingBag, Package, BookOpen, Clock, CheckCircle2, Truck, XCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMyOrders, type OrderStatus } from "@/hooks/useOrders";

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "অপেক্ষমাণ",       color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <Clock className="h-3 w-3" /> },
  confirmed: { label: "নিশ্চিত",          color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",        icon: <CheckCircle2 className="h-3 w-3" /> },
  shipped:   { label: "পাঠানো হয়েছে",     color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: <Truck className="h-3 w-3" /> },
  delivered: { label: "পৌঁছেছে",          color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",    icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: "বাতিল",            color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",             icon: <XCircle className="h-3 w-3" /> },
};

export default function MyOrders() {
  const { data: allOrders = [], isLoading } = useMyOrders();
  const orders = allOrders.filter((o) => o.order_type === "product");

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">আমার অর্ডার</h1>
      <p className="mt-1 text-sm text-muted-foreground">আপনার সকল পণ্য অর্ডারের তালিকা</p>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-muted/30" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="font-medium text-muted-foreground">কোনো অর্ডার নেই</p>
            <p className="mt-1 text-sm text-muted-foreground">আপনার প্রথম অর্ডার করতে পণ্য পেজে যান।</p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              পণ্য দেখুন <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
              return (
                <div key={order.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <Package className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{order.product_name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("bn-BD", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-lg font-bold text-foreground">
                        ৳{order.total_price.toLocaleString("bn-BD")}
                      </p>
                      {order.shipping_cost > 0 && (
                        <p className="text-xs text-muted-foreground">ডেলিভারি: ৳{order.shipping_cost}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Badge className={`flex items-center gap-1 ${status.color}`}>
                      {status.icon} {status.label}
                    </Badge>
                    {order.address && (
                      <span className="text-xs text-muted-foreground truncate max-w-xs">{order.address}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
