import { useState } from "react";
import { Search, RefreshCw, BookOpen, Package, Calendar, X, Trash2, UserCheck, Truck } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataPagination } from "@/components/ui/data-pagination";

const PAGE_SIZE = 25;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useOrders, useUpdateOrderStatus, useBulkUpdateOrderStatus, useDeleteOrder, useBulkDeleteOrders } from "@/hooks/useOrders";
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
  count, onApply, onClear, onDelete, isPending,
}: {
  count: number;
  onApply: (status: OrderStatus) => void;
  onClear: () => void;
  onDelete: () => void;
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
        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={onDelete} disabled={isPending}>
          <Trash2 className="mr-1 h-3 w-3" /> মুছুন
        </Button>
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const bulkUpdate = useBulkUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const bulkDeleteOrders = useBulkDeleteOrders();

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

  function handleDelete() {
    if (!deleteId) return;
    deleteOrder.mutate(deleteId, {
      onSuccess: () => { toast.success("অর্ডার মুছে ফেলা হয়েছে"); setDeleteId(null); },
      onError:   () => toast.error("মুছতে সমস্যা হয়েছে"),
    });
  }

  function handleBulkDelete() {
    const ids = Array.from(selected);
    bulkDeleteOrders.mutate(ids, {
      onSuccess: () => { toast.success(`${ids.length}টি অর্ডার মুছে ফেলা হয়েছে`); setSelected(new Set()); setBulkDeleteConfirm(false); },
      onError:   () => toast.error("মুছতে সমস্যা হয়েছে"),
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="নাম, ফোন, কোর্স বা TxnID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      {selected.size > 0 && (
        <BulkActionBar count={selected.size} onApply={handleBulkApply} onDelete={() => setBulkDeleteConfirm(true)} onClear={() => setSelected(new Set())} isPending={bulkUpdate.isPending || bulkDeleteOrders.isPending} />
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
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(order.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>অর্ডার মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই অ্যাকশন পূর্বাবস্থায় ফেরানো যাবে না।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete} disabled={deleteOrder.isPending}>
              {deleteOrder.isPending ? "মুছছে..." : "মুছে ফেলুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selected.size}টি অর্ডার মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই অ্যাকশন পূর্বাবস্থায় ফেরানো যাবে না।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleBulkDelete} disabled={bulkDeleteOrders.isPending}>
              {bulkDeleteOrders.isPending ? "মুছছে..." : "মুছে ফেলুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Courier dialog ────────────────────────────────────────────────────────────

function CourierDialog({ order, open, onClose }: { order: Order | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [deliveryType, setDeliveryType] = useState<"0" | "1">("0");
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  async function handleSend() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("সেশন মেয়াদ শেষ — পুনরায় লগইন করুন"); return; }

      const res = await fetch("/api/send-to-courier", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          orderId:       order.id,
          note:          note.trim(),
          delivery_type: Number(deliveryType),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "কুরিয়ারে পাঠাতে ব্যর্থ হয়েছে");
        return;
      }
      toast.success(`কুরিয়ারে পাঠানো হয়েছে! Tracking: ${data.tracking_code}`);
      qc.invalidateQueries({ queryKey: ["orders"] });
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "একটি সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-green-600" /> কুরিয়ারে পাঠান
          </DialogTitle>
        </DialogHeader>

        {/* Order summary — read-only */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">প্রাপক</span>
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ফোন</span>
            <span className="font-mono">{order.phone}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground shrink-0">ঠিকানা</span>
            <span className="text-right">{order.address ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">COD পরিমাণ</span>
            <span className="font-heading font-bold text-accent">৳{order.total_price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">পণ্য</span>
            <span className="max-w-[200px] truncate text-right">{order.product_name}</span>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">ডেলিভারি ধরন</label>
            <Select value={deliveryType} onValueChange={(v) => setDeliveryType(v as "0" | "1")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">🏠 Home Delivery</SelectItem>
                <SelectItem value="1">📦 Hub Pickup</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">নোট (ঐচ্ছিক)</label>
            <Textarea
              placeholder="ডেলিভারি নির্দেশনা..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>বাতিল</Button>
          <Button onClick={handleSend} disabled={loading} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            {loading ? "পাঠানো হচ্ছে..." : <><Truck className="h-4 w-4" /> পাঠান</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Product orders tab ────────────────────────────────────────────────────────

function ProductOrdersTab({ orders, onAdvance, onCancel }: { orders: Order[]; onAdvance: (o: Order) => void; onCancel: (o: Order) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [courierOrder, setCourierOrder] = useState<Order | null>(null);
  const bulkUpdate = useBulkUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const bulkDeleteOrders = useBulkDeleteOrders();

  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.product_name.toLowerCase().includes(q) ||
      (o.address ?? "").toLowerCase().includes(q) ||
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

  function handleDelete() {
    if (!deleteId) return;
    deleteOrder.mutate(deleteId, {
      onSuccess: () => { toast.success("অর্ডার মুছে ফেলা হয়েছে"); setDeleteId(null); },
      onError:   () => toast.error("মুছতে সমস্যা হয়েছে"),
    });
  }

  function handleBulkDelete() {
    const ids = Array.from(selected);
    bulkDeleteOrders.mutate(ids, {
      onSuccess: () => { toast.success(`${ids.length}টি অর্ডার মুছে ফেলা হয়েছে`); setSelected(new Set()); setBulkDeleteConfirm(false); },
      onError:   () => toast.error("মুছতে সমস্যা হয়েছে"),
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="নাম, ফোন, পণ্য বা ঠিকানা..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      {selected.size > 0 && (
        <BulkActionBar count={selected.size} onApply={handleBulkApply} onDelete={() => setBulkDeleteConfirm(true)} onClear={() => setSelected(new Set())} isPending={bulkUpdate.isPending || bulkDeleteOrders.isPending} />
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
                {["তারিখ", "গ্রাহক", "পণ্য", "ঠিকানা", "bKash তথ্য", "ডেলিভারি", "মোট", "স্ট্যাটাস", "অ্যাকশন"].map((h) => (
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
                    <td className="px-4 py-3">
                      {order.bkash_txn_id ? (
                        <div className="space-y-0.5">
                          <div className="text-[11px]"><span className="text-muted-foreground">TxnID: </span><span className="font-mono font-bold">{order.bkash_txn_id}</span></div>
                          {order.bkash_number && <div className="text-[11px]"><span className="text-muted-foreground">নম্বর: </span><span className="font-mono">{order.bkash_number}</span></div>}
                        </div>
                      ) : <span className="text-xs italic text-muted-foreground">নেই</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {order.shipping_type
                        ? <>{SHIPPING_LABELS[order.shipping_type]}<div className="text-foreground">+৳{order.shipping_cost}</div></>
                        : <span className="italic">ফ্রি</span>}
                    </td>
                    <td className="px-4 py-3 font-heading font-bold text-accent">৳{order.total_price.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANTS[order.status]}>{STATUS_LABELS[order.status]}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {nextStatus && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAdvance(order)}>
                            {STATUS_LABELS[nextStatus]}
                          </Button>
                        )}
                        {/* Courier button / tracking badge */}
                        {(order.status === "confirmed" || order.status === "shipped") && (
                          order.courier_tracking_code ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                              <Truck className="h-3 w-3" /> {order.courier_tracking_code}
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-green-400 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                              onClick={() => setCourierOrder(order)}
                            >
                              <Truck className="mr-1 h-3 w-3" /> কুরিয়ার
                            </Button>
                          )
                        )}
                        {order.status !== "cancelled" && order.status !== "delivered" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => onCancel(order)}>
                            বাতিল
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(order.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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

      {/* Courier dialog */}
      <CourierDialog order={courierOrder} open={!!courierOrder} onClose={() => setCourierOrder(null)} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>অর্ডার মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই অ্যাকশন পূর্বাবস্থায় ফেরানো যাবে না।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete} disabled={deleteOrder.isPending}>
              {deleteOrder.isPending ? "মুছছে..." : "মুছে ফেলুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selected.size}টি অর্ডার মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই অ্যাকশন পূর্বাবস্থায় ফেরানো যাবে না।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleBulkDelete} disabled={bulkDeleteOrders.isPending}>
              {bulkDeleteOrders.isPending ? "মুছছে..." : "মুছে ফেলুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Admin Assigned tab ────────────────────────────────────────────────────────

function AdminAssignedTab({ orders, onAdvance, onCancel }: { orders: Order[]; onAdvance: (o: Order) => void; onCancel: (o: Order) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const bulkUpdate = useBulkUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const bulkDeleteOrders = useBulkDeleteOrders();

  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.product_name.toLowerCase().includes(q)
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

  function handleDelete() {
    if (!deleteId) return;
    deleteOrder.mutate(deleteId, {
      onSuccess: () => { toast.success("অর্ডার মুছে ফেলা হয়েছে"); setDeleteId(null); },
      onError:   () => toast.error("মুছতে সমস্যা হয়েছে"),
    });
  }

  function handleBulkDelete() {
    const ids = Array.from(selected);
    bulkDeleteOrders.mutate(ids, {
      onSuccess: () => { toast.success(`${ids.length}টি অর্ডার মুছে ফেলা হয়েছে`); setSelected(new Set()); setBulkDeleteConfirm(false); },
      onError:   () => toast.error("মুছতে সমস্যা হয়েছে"),
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="নাম, ফোন বা কোর্স..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      {selected.size > 0 && (
        <BulkActionBar count={selected.size} onApply={handleBulkApply} onDelete={() => setBulkDeleteConfirm(true)} onClear={() => setSelected(new Set())} isPending={bulkUpdate.isPending || bulkDeleteOrders.isPending} />
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UserCheck className="mb-3 h-10 w-10 opacity-30" />
            <p>কোনো অ্যাডমিন অ্যাসাইন কোর্স নেই</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={allChecked} data-state={someChecked && !allChecked ? "indeterminate" : undefined} onCheckedChange={toggleAll} />
                </th>
                {["তারিখ", "ছাত্র", "কোর্স", "স্ট্যাটাস", "মেয়াদ", "অ্যাকশন"].map((h) => (
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
                      <div className="text-xs text-muted-foreground">{order.phone || "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="max-w-[200px] truncate block">{order.product_name}</span>
                    </td>
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
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(order.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>অ্যাসাইনমেন্ট মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই ছাত্রের কোর্স অ্যাক্সেস সরিয়ে দেওয়া হবে।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete} disabled={deleteOrder.isPending}>
              {deleteOrder.isPending ? "মুছছে..." : "মুছে ফেলুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selected.size}টি অ্যাসাইনমেন্ট মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই ছাত্রদের কোর্স অ্যাক্সেস সরিয়ে দেওয়া হবে।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleBulkDelete} disabled={bulkDeleteOrders.isPending}>
              {bulkDeleteOrders.isPending ? "মুছছে..." : "মুছে ফেলুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const { data: orders = [], isLoading, refetch } = useOrders();
  const { mutate: updateStatus } = useUpdateOrderStatus();

  const courseOrders  = orders.filter((o) => o.order_type === "course");
  const siteOrders    = courseOrders.filter((o) => o.bkash_txn_id !== null);
  const adminOrders   = courseOrders.filter((o) => o.bkash_txn_id === null);
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

  const pendingCourse  = siteOrders.filter((o) => o.status === "pending").length;
  const pendingProduct = productOrders.filter((o) => o.status === "pending").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">অর্ডার ম্যানেজমেন্ট</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">কোর্স অর্ডার {siteOrders.length}টি · পণ্য {productOrders.length}টি · অ্যাডমিন অ্যাসাইন {adminOrders.length}টি</p>
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
          <TabsTrigger value="admin" className="gap-2">
            <UserCheck className="h-4 w-4" />
            অ্যাডমিন অ্যাসাইন
            {adminOrders.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{adminOrders.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course">
          <CourseOrdersTab orders={siteOrders} onAdvance={handleAdvance} onCancel={handleCancel} />
        </TabsContent>
        <TabsContent value="product">
          <ProductOrdersTab orders={productOrders} onAdvance={handleAdvance} onCancel={handleCancel} />
        </TabsContent>
        <TabsContent value="admin">
          <AdminAssignedTab orders={adminOrders} onAdvance={handleAdvance} onCancel={handleCancel} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
