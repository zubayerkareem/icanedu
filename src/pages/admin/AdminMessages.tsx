import { useState, useMemo } from "react";
import { MessageSquare, Plus, Trash2, Send, Search, Users, CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useAdminMessages, useSendAdminMessage, useDeleteAdminMessage,
} from "@/hooks/useAdminMessages";
import { useStudents } from "@/hooks/useStudents";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "এইমাত্র";
  if (m < 60) return `${m} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ঘণ্টা আগে`;
  return `${Math.floor(h / 24)} দিন আগে`;
}

export default function AdminMessages() {
  const { data: messages = [], isLoading } = useAdminMessages();
  const { data: students = [] } = useStudents();
  const send = useSendAdminMessage();
  const del = useDeleteAdminMessage();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(messages.length / PAGE_SIZE);
  const pagedMessages = messages.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Compose form state
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const studentList = useMemo(
    () => students.filter((s) => s.role !== "admin"),
    [students]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return studentList;
    return studentList.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [studentList, search]);

  function toggleStudent(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setSelectAll(false);
  }

  function toggleSelectAll() {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(studentList.map((s) => s.id)));
      setSelectAll(true);
    }
  }

  function resetForm() {
    setBody("");
    setSearch("");
    setSelected(new Set());
    setSelectAll(false);
  }

  async function handleSend() {
    if (!body.trim()) { toast.error("মেসেজ লিখুন।"); return; }
    if (selected.size === 0) { toast.error("কমপক্ষে একজন শিক্ষার্থী নির্বাচন করুন।"); return; }
    try {
      await send.mutateAsync({ body: body.trim(), recipientIds: [...selected] });
      toast.success(`${selected.size} জনকে মেসেজ পাঠানো হয়েছে।`);
      resetForm();
      setSheetOpen(false);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "পাঠাতে সমস্যা হয়েছে।");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await del.mutateAsync(deleteId);
      toast.success("মেসেজ মুছে ফেলা হয়েছে।");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "মুছতে সমস্যা হয়েছে।");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">মেসেজ পাঠান</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            শিক্ষার্থীদের সরাসরি মেসেজ পাঠান
          </p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setSheetOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> নতুন মেসেজ
        </Button>
      </div>

      {/* Messages table */}
      <div className="mt-5 overflow-x-auto rounded-lg border border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">লোড হচ্ছে...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <MessageSquare className="mb-3 h-10 w-10 opacity-30" />
            <p>কোনো মেসেজ পাঠানো হয়নি।</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {["সময়", "মেসেজ", "প্রাপক", "অ্যাকশন"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {pagedMessages.map((msg) => (
                <tr key={msg.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {timeAgo(msg.created_at)}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="line-clamp-2 text-sm text-foreground">{msg.body}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {msg.recipient_count ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(msg.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, messages.length)} / {messages.length}টি
          </p>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="h-7 w-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2 text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
            <Button size="icon" variant="outline" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Compose sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 py-5 border-b border-border">
            <SheetTitle className="font-heading text-lg">নতুন মেসেজ</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Message body */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">মেসেজ</label>
              <Textarea
                placeholder="মেসেজ লিখুন (টেক্সট এবং লিংক দেওয়া যাবে)..."
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{body.length} অক্ষর</p>
            </div>

            {/* Student picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  শিক্ষার্থী নির্বাচন করুন
                </label>
                <span className="text-xs text-muted-foreground">
                  {selected.size} জন নির্বাচিত
                </span>
              </div>

              {/* Select all toggle */}
              <button
                onClick={toggleSelectAll}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {selectAll
                  ? <CheckSquare className="h-4 w-4 text-accent shrink-0" />
                  : <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                }
                সবাইকে নির্বাচন করুন ({studentList.length} জন)
              </button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>

              {/* Student list */}
              <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                {filtered.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
                ) : (
                  filtered.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggleStudent(s.id)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left"
                    >
                      {selected.has(s.id)
                        ? <CheckSquare className="h-4 w-4 text-accent shrink-0" />
                        : <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                      }
                      {s.avatar_url ? (
                        <img src={s.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-muted shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {(s.full_name ?? s.email ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {s.full_name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4">
            <Button
              className="w-full gap-2"
              onClick={handleSend}
              disabled={send.isPending || !body.trim() || selected.size === 0}
            >
              <Send className="h-4 w-4" />
              {send.isPending ? "পাঠানো হচ্ছে…" : `পাঠান (${selected.size} জন)`}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>মেসেজ মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              মুছে ফেললে শিক্ষার্থীরা আর এই মেসেজটি দেখতে পাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={del.isPending}
            >
              {del.isPending ? "মুছছে..." : "মুছে ফেলুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
