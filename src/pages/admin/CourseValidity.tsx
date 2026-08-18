import { useState, useMemo } from "react";
import { CalendarCheck, Search } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 20;
const ACTIVE_STATUSES = ["confirmed", "shipped", "delivered"];

type QuickFilter = "all" | "expired" | "week" | "month" | "lifetime";

function ValidityBadge({ validUntil }: { validUntil: string | null }) {
  if (!validUntil)
    return <Badge className="bg-green-100 text-green-700 border-green-200">আজীবন</Badge>;
  const exp = new Date(validUntil);
  const daysLeft = Math.floor((exp.getTime() - Date.now()) / 86_400_000);
  if (daysLeft < 0)
    return <Badge variant="destructive">মেয়াদ শেষ</Badge>;
  if (daysLeft <= 7)
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200">{daysLeft} দিন বাকি</Badge>;
  return <Badge className="bg-blue-100 text-blue-700 border-blue-200">{exp.toLocaleDateString("bn-BD", { dateStyle: "medium" })}</Badge>;
}

const QUICK_FILTERS: { value: QuickFilter; label: string }[] = [
  { value: "all", label: "সব" },
  { value: "expired", label: "মেয়াদ শেষ" },
  { value: "week", label: "৭ দিনে শেষ" },
  { value: "month", label: "এই মাসে শেষ" },
  { value: "lifetime", label: "আজীবন" },
];

export default function CourseValidity() {
  const { data: orders = [], isLoading } = useOrders();
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const courseOptions = useMemo(
    () => Array.from(new Set(courseOrders.map((o) => o.product_name))).sort(),
    [courseOrders],
  );

  const courseOrders = useMemo(
    () => orders.filter((o) => o.order_type === "course" && ACTIVE_STATUSES.includes(o.status)),
    [orders]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    const q = search.toLowerCase();

    let result = courseOrders.filter((o) => {
      if (!q) return true;
      return (
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.product_name.toLowerCase().includes(q)
      );
    });

    if (selectedCourse) {
      result = result.filter((o) => o.product_name === selectedCourse);
    }

    if (quickFilter === "expired") {
      result = result.filter((o) => o.valid_until && new Date(o.valid_until) < now);
    } else if (quickFilter === "week") {
      const oneWeek = new Date(now.getTime() + 7 * 86_400_000);
      result = result.filter(
        (o) => o.valid_until && new Date(o.valid_until) >= now && new Date(o.valid_until) <= oneWeek
      );
    } else if (quickFilter === "month") {
      result = result.filter((o) => {
        if (!o.valid_until) return false;
        const exp = new Date(o.valid_until);
        return exp.getFullYear() === now.getFullYear() && exp.getMonth() === now.getMonth();
      });
    } else if (quickFilter === "lifetime") {
      result = result.filter((o) => !o.valid_until);
    } else if (dateFrom || dateTo) {
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo + "T23:59:59") : null;
      result = result.filter((o) => {
        if (!o.valid_until) return false;
        const exp = new Date(o.valid_until);
        if (from && exp < from) return false;
        if (to && exp > to) return false;
        return true;
      });
    }

    result.sort((a, b) => {
      if (!a.valid_until && !b.valid_until) return 0;
      if (!a.valid_until) return 1;
      if (!b.valid_until) return -1;
      return new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime();
    });

    return result;
  }, [courseOrders, search, selectedCourse, quickFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleQuickFilter(f: QuickFilter) {
    setQuickFilter(f);
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarCheck className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-heading">মেয়াদ ফিল্টার</h1>
          <p className="text-sm text-muted-foreground">{filtered.length}টি এনরোলমেন্ট</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleQuickFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                quickFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Course filter dropdown */}
          <select
            value={selectedCourse}
            onChange={(e) => { setSelectedCourse(e.target.value); setPage(1); }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 min-w-[180px]"
          >
            <option value="">সব কোর্স</option>
            {courseOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="নাম, ফোন বা কোর্স দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setQuickFilter("all"); setPage(1); }}
              className="w-40 text-sm"
            />
            <span className="text-muted-foreground text-sm">—</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setQuickFilter("all"); setPage(1); }}
              className="w-40 text-sm"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">লোড হচ্ছে...</div>
      ) : paged.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">কোনো ফলাফল পাওয়া যায়নি</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">ছাত্রের নাম</th>
                <th className="px-4 py-3 text-left font-medium">ফোন</th>
                <th className="px-4 py-3 text-left font-medium">কোর্স</th>
                <th className="px-4 py-3 text-left font-medium">মেয়াদ শেষ</th>
                <th className="px-4 py-3 text-left font-medium">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((o, i) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">
                    {(safePage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{o.customer_name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.phone || "—"}</td>
                  <td className="px-4 py-3">{o.product_name}</td>
                  <td className="px-4 py-3">
                    {o.valid_until
                      ? new Date(o.valid_until).toLocaleDateString("bn-BD", { dateStyle: "medium" })
                      : <span className="text-muted-foreground">আজীবন</span>}
                  </td>
                  <td className="px-4 py-3">
                    <ValidityBadge validUntil={o.valid_until} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length}টি
          </span>
          <div className="flex gap-2">
            <button
              disabled={safePage <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-border px-3 py-1 text-sm disabled:opacity-40 hover:bg-accent transition-colors"
            >
              আগে
            </button>
            <button
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-border px-3 py-1 text-sm disabled:opacity-40 hover:bg-accent transition-colors"
            >
              পরে
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
