import { useState } from "react";
import { ShoppingBag, Search, RefreshCw, BookOpen, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import type { Order, OrderStatus } from "@/hooks/useOrders";
import { toast } from "sonner";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   "অপেক্ষমাণ",
  confirmed: "নিশ্চিত",
  shipped:   "পাঠানো হয়েছে",
  delivered: "পৌঁছেছে",
  cancelled: "বাতিল",
};

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending:   "secondary",
  confirmed: "default",
  shipped:   "default",
  delivered: "outline",
  cancelled: "destructive",
};

const STATUS_NEXT: Record<OrderStatus, OrderStatus | null> = {
  pending:   "confirmed",
  confirmed: "shipped",
  shipped:   "delivered",
  delivered: null,
  cancelled: null,
};

const SHIPPING_LABELS: Record<string, string> = { inside: "ঢাকার ভেতরে", outside: "ঢাকার বাইরে" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("bn-BD", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminOrders() {
  const { data: orders = [], isLoading, refetch } = useOrders();
  const { mutate: updateStatus } = useUpdateOrderStatus();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  const filtered = orders.filter((o) => {
    const matchesSearch =
      !search.trim() ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      o.product_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  function handleAdvance(order: Order) {
    const next = STATUS_NEXT[order.status];
    if (!next) return;
    updateStatus(
      { id: order.id, status: next },
      {
        onSuccess: () => toast.success(`অর্ডার স্ট্যাটাস: ${STATUS_LABELS[next]}`),
        onError: () => toast.error("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে"),
      }
    );
  }

  function handleCancel(order: Order) {
    updateStatus(
      { id: order.id, status: "cancelled" },
      {
        onSuccess: () => toast.success("অর্ডার বাতিল করা হয়েছে"),
        onError: () => toast.error("বাতিল করতে ব্যর্থ"),
      }
    );
  }

  const counts = {
    all:       orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped:   orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">অর্ডার ম্যানেজমেন্ট</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            মোট {orders.length}টি অর্ডার
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> রিফ্রেশ
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filterStatus === s
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent/20",
            ].join(" ")}
          >
            {s === "all" ? "সব" : STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mt-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="নাম, ফোন বা পণ্য খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-lg border border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            লোড হচ্ছে...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ShoppingBag className="mb-3 h-10 w-10 opacity-30" />
            <p>কোনো অর্ডার পাওয়া যায়নি</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {["তারিখ", "গ্রাহক", "পণ্য", "ডেলিভারি", "মোট", "স্ট্যাটাস", "অ্যাকশন"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{order.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{order.phone}</div>
                    {order.address && (
                      <div className="mt-0.5 max-w-[160px] truncate text-xs text-muted-foreground">
                        {order.address}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {order.order_type === "course"
                        ? <BookOpen className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        : <Package className="h-3.5 w-3.5 shrink-0 text-purple-500" />
                      }
                      <span className="max-w-[160px] truncate text-foreground">{order.product_name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">৳{order.product_price.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {order.shipping_type
                      ? <>{SHIPPING_LABELS[order.shipping_type]}<div className="text-foreground">+৳{order.shipping_cost}</div></>
                      : <span className="italic">ডিজিটাল</span>
                    }
                  </td>
                  <td className="px-4 py-3 font-heading font-bold text-accent">
                    ৳{order.total_price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[order.status]}>
                      {STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {STATUS_NEXT[order.status] && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleAdvance(order)}
                        >
                          {STATUS_LABELS[STATUS_NEXT[order.status]!]}
                        </Button>
                      )}
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleCancel(order)}
                        >
                          বাতিল
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
