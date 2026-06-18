import { useState } from "react";
import { Search, RefreshCw, BookOpen, Package, Calendar, X } from "lucide-react";
import { DataPagination } from "@/components/ui/data-pagination";

const PAGE_SIZE = 25;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOrders, useUpdateOrderStatus, useBulkUpdateOrderStatus } from "@/hooks/useOrders";
import { useAdminUpdateValidity } from "@/hooks/useAdminEnrollments";
import type { Order, OrderStatus } from "@/hooks/useOrders";
import { toast } from "sonner";
import { sendPurchaseEmail, sendShippedEmail } from "@/lib/email";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   "পেন্ডিং",
  confirmed: "কনফার্ম",
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

const COURSE_STATUS_NEXT: Record<OrderStatus, OrderStatus | null> = {
  pending:   "confirmed",
  confirmed: null,
  shipped:   null,
  delivered: null,
  cancelled: null,
};

const PRODUCT_STATUS_NEXT: Record<OrderStatus, OrderStatus | null> = {
  pending:   "confirmed",
  confirmed: "shipped",
  shipped:   null,
  delivered: null,
  cancelled: null,
};

const SHIPPING_LABELS: Record<string, string> = {
  inside:  "ঢাকার ভেতরে",
  outside: "ঢাকার বাইরে",
};

const BULK_STATUSES: OrderStatus[] = ["pending", "confirmed"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("bn-BD", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ValidityBadge({ validUntil }: { validUntil: string | null }) {
  if (!validUntil) return <span className="text-xs text-muted-foreground">আজীবন</span>;
  const d = new Date(validUntil);
  const daysLeft = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  const label = d.toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" });
  if (daysLeft < 0)
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">মেয়াদ শেষ</span>;
  if (daysLeft <= 7)
    return <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">{label}</span>;
  return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">{label}</span>;
}

function ValidityCell({ order }: { order: Order }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(order.valid_until ? order.valid_until.slice(0, 10) : "");
  const { mutate: updateValidity, isPending } = useAdminUpdateValidity();

  function save() {
    updateValidity(
      { orderId: order.id, validUntil: date ? new Date(date).toISOString() : null },
      {
        onSuccess: () => { toast.success("মেয়াদ আপডেট হয়েছে"); setEditing(false); },
        onError:   () => toast.error("মেয়াদ আপডেট ব্যর্থ"),
      }
    );
  }

  function clearValidity() {
    updateValidity(
      { orderId: order.id, validUntil: null },
      {
        onSuccess: () => { toast.success("আজীবন করা হয়েছে"); setDate(""); setEditing(false); },
        onError:   () => toast.error("মেয়াদ আপডেট ব্যর্থ"),
      }
    );
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-7 text-xs" />
        <div className="flex items-center gap-1">
          <Button size="sm" className="h-6 text-[11px] px-2" onClick={save} disabled={isPending}>সেভ</Button>
          <Button size="sm" variant="outline" className="h-6 text-[11px] px-2" onClick={clearValidity} disabled={isPending}>আজীবন</Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setEditing(false)}><X className="h-3 w-3" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <ValidityBadge validUntil={order.valid_until} />
      <button onClick={() => setEditing(true)} title="মেয়াদ পরিবর্তন" className="text-muted-foreground hover:text-foreground transition-colors">
        <Calendar className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Bulk action bar ───────────────────────────────────────────────────────────

function BulkActionBar({
  count, onApply, onClear, isPending,
}: {
  count: number;
  onApply: (status: OrderStatus) => void;
  onClear: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5">
      <span className="text-sm font-medium text-foreground shrink-0">{count}টি নির্বাচিত</span>
      <div className="flex gap-2">
        {BULK_STATUSES.map((s) => (
          <Button key={s} size="sm" variant="outline" className="h-7 text-xs" onClick={() => onApply(s)} disabled={isPending}>
            {STATUS_LABELS[s]}
          </Button>
        ))}
      </div>
      <button onClick={onClear} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Course orders tab ─────────────────────────────────────────────────────────

function CourseOrdersTab({ orders, onAdvance, onCancel }: { orders: Order[]; onAdvance: (o: Order) => void; onCancel: (o: Order) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const bulkUpdate = useBulkUpdateOrderStatus();

  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.product_name.toLowerCase().includes(q) ||
      (o.bkash_txn_id ?? "").toLowerCase().includes(q)
    );
  });

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allChecked = filtered.length > 0 && filtered.every((o) => selected.has(o.id));
  const someChecked = filtered.some((o) => selected.has(o.id));

  function toggleAll() {
    if (allChecked) {
      setSelected((prev) => { const n = new Set(prev); filtered.forEach((o) => n.delete(o.id)); return n; });
    } else {
      setSelected((prev) => { const n = new Set(prev); filtered.forEach((o) => n.add(o.id)); return n; });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleBulkApply(status: OrderStatus) {
    const ids = Array.from(selected);
    bulkUpdate.mutate(
      { ids, status },
      {
        onSuccess: () => { toast.success(`${ids.length}টি অর্ডার → ${STATUS_LABELS[status]}`); setSelected(new Set()); },
        onError:   () => toast.error("বাল্ক আপডেট ব্যর্থ"),
      }
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="নাম, ফোন, কোর্স বা TxnID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      {selected.size > 0 && (
        <BulkActionBar count={selected.size} onApply={handleBulkApply} onClear={() => setSelected(new Set())} isPending={bulkUpdate.isPending} />
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BookOpen className="mb-3 h-10 w-10 opacity-30" />
            <p>কোনো কোর্স অর্ডার নেই</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={allChecked} data-state={someChecked && !allChecked ? "indeterminate" : undefined} onCheckedChange={toggleAll} />
                </th>
                {["তারিখ", "ছাত্র", "কোর্স", "bKash তথ্য", "মোট", "স্ট্যাটাস", "মেয়াদ", "অ্যাকশন"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {paginated.map((order) => {
                const nextStatus = COURSE_STATUS_NEXT[order.status];
                const isSelected = selected.has(order.id);
                return (
                  <tr key={order.id} className={`transition-colors hover:bg-muted/30 ${isSelected ? "bg-accent/5" : ""}`}>
                    <td className="px-4 py-3"><Checkbox checked={isSelected} onCheckedChange={() => toggleOne(order.id)} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="max-w-[180px] truncate block">{order.product_name}</span>
                      <span className="text-xs text-muted-foreground">৳{order.product_price.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      {order.bkash_txn_id ? (
                        <div className="space-y-0.5">
                          <div className="text-[11px]"><span className="text-muted-foreground">TxnID: </span><span className="font-mono font-bold">{order.bkash_txn_id}</span></div>
                          {order.bkash_number && <div className="text-[11px]"><span className="text-muted-foreground">নম্বর: </span><span className="font-mono">{order.bkash_number}</span></div>}
                        </div>
                      ) : <span className="text-xs italic text-muted-foreground">নেই</span>}
                    </td>
                    <td className="px-4 py-3 font-heading font-bold text-accent">৳{order.total_price.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANTS[order.status]}>{STATUS_LABELS[order.status]}</Badge></td>
                    <td className="px-4 py-3"><ValidityCell order={order} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {nextStatus && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAdvance(order)}>
                            {STATUS_LABELS[nextStatus]}
                          </Button>
                        )}
                        {order.status !== "cancelled" && order.status !== "delivered" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => onCancel(order)}>
                            বাতিল
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <DataPagination page={safePage} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  );
}

// ─── Product orders tab ────────────────────────────────────────────────────────

function ProductOrdersTab({ orders, onAdvance, onCancel }: { orders: Order[]; onAdvance: (o: Order) => void; onCancel: (o: Order) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const bulkUpdate = useBulkUpdateOrderStatus();

  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.product_name.toLowerCase().includes(q) ||
      (o.address ?? "").toLowerCase().includes(q)
    );
  });

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const allChecked = filtered.length > 0 && filtered.every((o) => selected.has(o.id));
  const someChecked = filtered.some((o) => selected.has(o.id));

  function toggleAll() {
    if (allChecked) {
      setSelected((prev) => { const n = new Set(prev); filtered.forEach((o) => n.delete(o.id)); return n; });
    } else {
      setSelected((prev) => { const n = new Set(prev); filtered.forEach((o) => n.add(o.id)); return n; });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleBulkApply(status: OrderStatus) {
    const ids = Array.from(selected);
    bulkUpdate.mutate(
      { ids, status },
      {
        onSuccess: () => { toast.success(`${ids.length}টি অর্ডার → ${STATUS_LABELS[status]}`); setSelected(new Set()); },
        onError:   () => toast.error("বাল্ক আপডেট ব্যর্থ"),
      }
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="নাম, ফোন, পণ্য বা ঠিকানা..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      {selected.size > 0 && (
        <BulkActionBar count={selected.size} onApply={handleBulkApply} onClear={() => setSelected(new Set())} isPending={bulkUpdate.isPending} />
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="mb-3 h-10 w-10 opacity-30" />
            <p>কোনো পণ্য অর্ডার নেই</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={allChecked} data-state={someChecked && !allChecked ? "indeterminate" : undefined} onCheckedChange={toggleAll} />
                </th>
                {["তারিখ", "গ্রাহক", "পণ্য", "ঠিকানা", "ডেলিভারি", "মোট", "স্ট্যাটাস", "অ্যাকশন"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {paginated.map((order) => {
                const nextStatus = PRODUCT_STATUS_NEXT[order.status];
                const isSelected = selected.has(order.id);
                return (
                  <tr key={order.id} className={`transition-colors hover:bg-muted/30 ${isSelected ? "bg-accent/5" : ""}`}>
                    <td className="px-4 py-3"><Checkbox checked={isSelected} onCheckedChange={() => toggleOne(order.id)} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="max-w-[160px] truncate block">{order.product_name}</span>
                      <span className="text-xs text-muted-foreground">৳{order.product_price.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      {order.address
                        ? <span className="max-w-[160px] truncate block text-xs text-muted-foreground">{order.address}</span>
                        : <span className="text-xs italic text-muted-foreground">নেই</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {order.shipping_type
                        ? <>{SHIPPING_LABELS[order.shipping_type]}<div className="text-foreground">+৳{order.shipping_cost}</div></>
                        : <span className="italic">ফ্রি</span>}
                    </td>
                    <td className="px-4 py-3 font-heading font-bold text-accent">৳{order.total_price.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANTS[order.status]}>{STATUS_LABELS[order.status]}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {nextStatus && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAdvance(order)}>
                            {STATUS_LABELS[nextStatus]}
                          </Button>
                        )}
                        {order.status !== "cancelled" && order.status !== "delivered" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => onCancel(order)}>
                            বাতিল
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <DataPagination page={safePage} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const { data: orders = [], isLoading, refetch } = useOrders();
  const { mutate: updateStatus } = useUpdateOrderStatus();

  const courseOrders  = orders.filter((o) => o.order_type === "course");
  const productOrders = orders.filter((o) => o.order_type === "product");

  function handleAdvance(order: Order) {
    const nextMap = order.order_type === "course" ? COURSE_STATUS_NEXT : PRODUCT_STATUS_NEXT;
    const next = nextMap[order.status];
    if (!next) return;
    updateStatus(
      { id: order.id, status: next },
      {
        onSuccess: () => {
          toast.success(`স্ট্যাটাস: ${STATUS_LABELS[next]}`);
          if (order.user_id) {
            if (next === "confirmed") {
              sendPurchaseEmail(order.user_id, {
                name: order.customer_name,
                productName: order.product_name,
                orderType: order.order_type,
                amount: order.total_price,
              });
            } else if (next === "shipped") {
              sendShippedEmail(order.user_id, {
                name: order.customer_name,
                productName: order.product_name,
              });
            }
          }
        },
        onError: () => toast.error("স্ট্যাটাস আপডেট ব্যর্থ হয়েছে"),
      }
    );
  }

  function handleCancel(order: Order) {
    updateStatus(
      { id: order.id, status: "cancelled" },
      {
        onSuccess: () => toast.success("অর্ডার বাতিল করা হয়েছে"),
        onError:   () => toast.error("বাতিল করতে ব্যর্থ"),
      }
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">লোড হচ্ছে...</div>;
  }

  const pendingCourse  = courseOrders.filter((o) => o.status === "pending").length;
  const pendingProduct = productOrders.filter((o) => o.status === "pending").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">অর্ডার ম্যানেজমেন্ট</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">কোর্স {courseOrders.length}টি · পণ্য {productOrders.length}টি</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> রিফ্রেশ
        </Button>
      </div>

      <Tabs defaultValue="course" className="mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="course" className="gap-2">
            <BookOpen className="h-4 w-4" />
            কোর্স অর্ডার
            {pendingCourse > 0 && (
              <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">{pendingCourse}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="product" className="gap-2">
            <Package className="h-4 w-4" />
            পণ্য অর্ডার
            {pendingProduct > 0 && (
              <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">{pendingProduct}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course">
          <CourseOrdersTab orders={courseOrders} onAdvance={handleAdvance} onCancel={handleCancel} />
        </TabsContent>
        <TabsContent value="product">
          <ProductOrdersTab orders={productOrders} onAdvance={handleAdvance} onCancel={handleCancel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
