import { useState } from "react";
import { Bell, Plus, Pencil, Trash2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { sendNoticeEmail } from "@/lib/email";
import { RichEditor } from "@/components/RichEditor";
import {
  useAdminNotices, useUpsertNotice, useDeleteNotice,
} from "@/hooks/useNotices";
import type { Notice, BadgeVariant } from "@/hooks/useNotices";

const BADGE_VARIANTS: { value: BadgeVariant; label: string }[] = [
  { value: "default",     label: "নীল (নতুন / ইভেন্ট)" },
  { value: "secondary",   label: "ধূসর (ঘোষণা / আপডেট)" },
  { value: "destructive", label: "লাল (জরুরি)" },
  { value: "outline",     label: "আউটলাইন" },
];

type FormData = {
  id?: string;
  title: string;
  content: string;
  badge: string;
  badge_variant: BadgeVariant;
  is_published: boolean;
};

const empty: FormData = {
  title: "", content: "", badge: "ঘোষণা", badge_variant: "secondary", is_published: true,
};

function toForm(n: Notice): FormData {
  return { id: n.id, title: n.title, content: n.content, badge: n.badge, badge_variant: n.badge_variant, is_published: n.is_published };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminNotices() {
  const { data: notices = [], isLoading, error, refetch } = useAdminNotices();
  const upsert = useUpsertNotice();
  const del = useDeleteNotice();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<FormData>(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openNew() { setForm(empty); setSheetOpen(true); }
  function openEdit(n: Notice) { setForm(toForm(n)); setSheetOpen(true); }
  function set<K extends keyof FormData>(k: K, v: FormData[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("শিরোনাম প্রয়োজন"); return; }
    const isNew = !form.id;
    try {
      await upsert.mutateAsync(form);
      toast.success(isNew ? "নোটিশ যোগ হয়েছে" : "নোটিশ আপডেট হয়েছে");
      if (isNew && form.is_published) {
        sendNoticeEmail({ title: form.title, content: form.content });
      }
      setSheetOpen(false);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await del.mutateAsync(deleteId);
      toast.success("নোটিশ মুছে ফেলা হয়েছে");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "মুছতে সমস্যা হয়েছে");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">নোটিশ ম্যানেজমেন্ট</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">মোট {notices.length}টি নোটিশ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> রিফ্রেশ
          </Button>
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> নতুন নোটিশ
          </Button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">লোড হচ্ছে...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm font-medium text-destructive">ডেটা লোড হয়নি</p>
            <p className="text-xs text-muted-foreground">
              <code className="rounded bg-muted px-1 py-0.5">supabase_notices_migration.sql</code> রান করুন
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>আবার চেষ্টা করুন</Button>
          </div>
        ) : notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Bell className="mb-3 h-10 w-10 opacity-30" />
            <p>কোনো নোটিশ নেই</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {["শিরোনাম", "ব্যাজ", "তারিখ", "স্ট্যাটাস", "অ্যাকশন"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {notices.map((n) => (
                <tr key={n.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground line-clamp-1">{n.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={n.badge_variant}>{n.badge}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(n.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {n.is_published
                      ? <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">প্রকাশিত</Badge>
                      : <Badge variant="secondary">ড্রাফট</Badge>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(n)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(n.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex w-full max-w-2xl flex-col overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{form.id ? "নোটিশ সম্পাদনা" : "নতুন নোটিশ"}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 flex-1 space-y-5 pb-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs">শিরোনাম *</Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="নোটিশের শিরোনাম লিখুন"
              />
            </div>

            {/* Badge */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">ব্যাজ লেবেল</Label>
                <Input
                  value={form.badge}
                  onChange={(e) => set("badge", e.target.value)}
                  placeholder="জরুরি, নতুন, ঘোষণা..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">ব্যাজ রঙ</Label>
                <select
                  value={form.badge_variant}
                  onChange={(e) => set("badge_variant", e.target.value as BadgeVariant)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {BADGE_VARIANTS.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rich content editor */}
            <div className="space-y-1.5">
              <Label className="text-xs">বিষয়বস্তু</Label>
              <RichEditor
                value={form.content}
                onChange={(html) => set("content", html)}
                placeholder="নোটিশের বিষয়বস্তু লিখুন..."
              />
            </div>

            {/* Published */}
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => set("is_published", e.target.checked)}
                className="h-4 w-4 rounded border-input accent-accent"
              />
              <span className="text-sm">প্রকাশিত (সবাই দেখতে পাবে)</span>
            </label>
          </div>

          <SheetFooter className="gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              <X className="mr-2 h-4 w-4" /> বাতিল
            </Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>
              {upsert.isPending ? "সংরক্ষণ হচ্ছে..." : form.id ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>নোটিশ মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই অ্যাকশন পূর্বাবস্থায় ফেরানো যাবে না।</AlertDialogDescription>
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
