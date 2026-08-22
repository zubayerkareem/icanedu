import { useState } from "react";
import { CreditCard, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAdminCadetCourses } from "@/hooks/useCadetNotifications";
import {
  useAdminCadetCourseEnrollments,
  useBulkConfirmCadetPayment,
  useUpdateSingleCadetPaymentStatus,
  type CadetEnrollmentRow,
} from "@/hooks/useCadetPayments";
import { isPaymentDue } from "@/lib/courses/types";

type Filter = "all" | "due" | "complete";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" });
}

export default function CadetPayments() {
  const { data: cadetCourses = [], isLoading: loadingCourses } = useAdminCadetCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedCourse = cadetCourses.find((c) => c.id === selectedCourseId);
  const { data: enrollments = [], isLoading: loadingEnrollments } = useAdminCadetCourseEnrollments(selectedCourseId);
  const bulkConfirm = useBulkConfirmCadetPayment();
  const updateSingle = useUpdateSingleCadetPaymentStatus();

  const rows = enrollments.map((r) => ({ ...r, due: isPaymentDue(r) }));
  const filtered = rows.filter((r) => filter === "all" ? true : filter === "due" ? r.due : !r.due);
  const dueCount = rows.filter((r) => r.due).length;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));
  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) filtered.forEach((r) => next.delete(r.id));
      else filtered.forEach((r) => next.add(r.id));
      return next;
    });
  }

  function selectCourse(id: string | null) {
    setSelectedCourseId(id);
    setSelectedIds(new Set());
    setFilter("all");
  }

  async function handleBulkConfirm() {
    try {
      await bulkConfirm.mutateAsync({
        orderIds: [...selectedIds],
        monthly: selectedCourse?.has_monthly_fee === true,
      });
      toast.success(`${selectedIds.size} জনের পেমেন্ট নিশ্চিত করা হয়েছে`);
      setSelectedIds(new Set());
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে");
    }
  }

  async function handleStatusChange(orderId: string, blocked: boolean) {
    try {
      await updateSingle.mutateAsync({
        orderId,
        blocked,
        monthly: selectedCourse?.has_monthly_fee === true,
      });
      toast.success(blocked ? "অ্যাক্সেস বন্ধ করা হয়েছে" : "অ্যাক্সেস চালু করা হয়েছে");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-cyan-600" /> ক্যাডেট পেমেন্ট
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          ক্যাডেট কোর্সের শিক্ষার্থীদের পেমেন্ট স্ট্যাটাস দেখুন এবং নিশ্চিত করুন
        </p>
      </div>

      {/* Course selector */}
      {loadingCourses ? (
        <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
      ) : cadetCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          <CreditCard className="mx-auto mb-3 h-10 w-10 opacity-20" />
          <p className="text-sm">কোনো ক্যাডেট কোর্স নেই।</p>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Select value={selectedCourseId ?? ""} onValueChange={(v) => selectCourse(v || null)}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="ক্যাডেট কোর্স বেছে নিন" />
            </SelectTrigger>
            <SelectContent>
              {cadetCourses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCourseId && (
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => selectCourse(null)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {selectedCourseId && (
        <div className="space-y-4">
          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            {([
              { key: "all", label: `সব (${rows.length})` },
              { key: "due", label: `বাকি (${dueCount})` },
              { key: "complete", label: `সম্পন্ন (${rows.length - dueCount})` },
            ] as { key: Filter; label: string }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.key
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
              <span className="text-sm font-medium text-foreground">{selectedIds.size} জন নির্বাচিত</span>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleBulkConfirm}
                disabled={bulkConfirm.isPending}
              >
                <CheckCircle2 className="h-4 w-4" />
                {bulkConfirm.isPending ? "নিশ্চিত হচ্ছে..." : "পেমেন্ট নিশ্চিত করুন"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Table */}
          {loadingEnrollments ? (
            <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground rounded-lg border border-dashed border-border">
              কোনো শিক্ষার্থী নেই।
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="w-10 px-3 py-2">
                      <Checkbox checked={allFilteredSelected} onCheckedChange={toggleSelectAll} />
                    </th>
                    <th className="px-3 py-2 text-left">নাম</th>
                    <th className="px-3 py-2 text-left">ইমেইল</th>
                    <th className="px-3 py-2 text-left">এক্সেস</th>
                    <th className="px-3 py-2 text-left">পরবর্তী তারিখ</th>
                    <th className="px-3 py-2 text-left">ভর্তির তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r: CadetEnrollmentRow & { due: boolean }) => (
                    <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-3 py-2">
                        <Checkbox checked={selectedIds.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} />
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground">{r.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.email ?? "—"}</td>
                      <td className="px-3 py-2">
                        <Select
                          value={r.due ? "no" : "yes"}
                          onValueChange={(v) => handleStatusChange(r.id, v === "no")}
                          disabled={updateSingle.isPending}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> হ্যাঁ (এক্সেস আছে)
                              </span>
                            </SelectItem>
                            <SelectItem value="no">
                              <span className="flex items-center gap-1.5">
                                🚫 না (এক্সেস বন্ধ)
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {r.payment_due_date ? formatDate(r.payment_due_date) : "—"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{formatDate(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
