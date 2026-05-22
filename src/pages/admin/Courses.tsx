import { useState } from "react";
import {
  BookOpen, Plus, Pencil, Trash2, RefreshCw, Search, X, GripVertical,
  Youtube, FileDown,
} from "lucide-react";
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
import { useAdminCourses, useUpsertCourse, useDeleteCourse } from "@/hooks/useAdminCourses";
import type { Course, CourseVideo, CourseResource } from "@/lib/courses/types";

type FormData = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  thumbnail_url: string;
  duration: string;
  price: string;
  discount_price: string;
  short_description: string;
  long_description: string;
  total_lessons: string;
  teacher_name: string;
  teacher_short_bio: string;
  teacher_long_bio: string;
  highlights: string;
  is_published: boolean;
  videos: CourseVideo[];
  resources: CourseResource[];
};

const empty: FormData = {
  title: "", slug: "", category: "", thumbnail_url: "", duration: "",
  price: "", discount_price: "", short_description: "", long_description: "",
  total_lessons: "", teacher_name: "", teacher_short_bio: "", teacher_long_bio: "",
  highlights: "", is_published: true, videos: [], resources: [],
};

function toFormData(c: Course): FormData {
  return {
    id: c.id,
    title: c.title,
    slug: c.slug ?? "",
    category: c.category ?? "",
    thumbnail_url: c.thumbnail_url ?? "",
    duration: c.duration ?? "",
    price: c.price != null ? String(c.price) : "",
    discount_price: c.discount_price != null ? String(c.discount_price) : "",
    short_description: c.short_description ?? "",
    long_description: c.long_description ?? "",
    total_lessons: c.total_lessons != null ? String(c.total_lessons) : "",
    teacher_name: c.teacher_name ?? c.teacher?.name ?? "",
    teacher_short_bio: c.teacher_short_bio ?? c.teacher?.short_bio ?? "",
    teacher_long_bio: c.teacher_long_bio ?? c.teacher?.long_bio ?? "",
    highlights: (c.highlights ?? []).join("\n"),
    is_published: (c as Course & { is_published?: boolean }).is_published ?? true,
    videos: c.videos ?? [],
    resources: c.resources ?? [],
  };
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AdminCourses() {
  const { data: courses = [], isLoading, error, refetch } = useAdminCourses();
  const upsert = useUpsertCourse();
  const deleteCourse = useDeleteCourse();

  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<FormData>(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = courses.filter((c) => {
    const q = search.trim().toLowerCase();
    return !q || c.title.toLowerCase().includes(q) || (c.category ?? "").toLowerCase().includes(q);
  });

  function openNew() { setForm(empty); setSheetOpen(true); }
  function openEdit(course: Course) { setForm(toFormData(course)); setSheetOpen(true); }
  function set(field: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Videos
  function addVideo() {
    setForm((f) => ({ ...f, videos: [...f.videos, { id: uid(), title: "", url: "" }] }));
  }
  function setVideo(idx: number, field: keyof CourseVideo, value: string) {
    setForm((f) => {
      const videos = f.videos.map((v, i) => i === idx ? { ...v, [field]: value } : v);
      return { ...f, videos };
    });
  }
  function removeVideo(idx: number) {
    setForm((f) => ({ ...f, videos: f.videos.filter((_, i) => i !== idx) }));
  }

  // Resources
  function addResource() {
    setForm((f) => ({ ...f, resources: [...f.resources, { id: uid(), title: "", url: "", type: "pdf" }] }));
  }
  function setResource(idx: number, field: keyof CourseResource, value: string) {
    setForm((f) => {
      const resources = f.resources.map((r, i) => i === idx ? { ...r, [field]: value } : r);
      return { ...f, resources };
    });
  }
  function removeResource(idx: number) {
    setForm((f) => ({ ...f, resources: f.resources.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("কোর্সের শিরোনাম প্রয়োজন"); return; }
    try {
      await upsert.mutateAsync({
        id: form.id,
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        category: form.category.trim() || undefined,
        thumbnail_url: form.thumbnail_url.trim() || undefined,
        duration: form.duration.trim() || undefined,
        price: form.price ? Number(form.price) : undefined,
        discount_price: form.discount_price ? Number(form.discount_price) : undefined,
        short_description: form.short_description.trim() || undefined,
        long_description: form.long_description.trim() || undefined,
        total_lessons: form.total_lessons ? Number(form.total_lessons) : 0,
        teacher_name: form.teacher_name.trim() || undefined,
        teacher_short_bio: form.teacher_short_bio.trim() || undefined,
        teacher_long_bio: form.teacher_long_bio.trim() || undefined,
        highlights: form.highlights.split("\n").map((h) => h.trim()).filter(Boolean),
        is_published: form.is_published,
        videos: form.videos.filter((v) => v.title.trim() && v.url.trim()),
        resources: form.resources.filter((r) => r.title.trim() && r.url.trim()),
      });
      toast.success(form.id ? "কোর্স আপডেট হয়েছে" : "নতুন কোর্স যোগ হয়েছে");
      setSheetOpen(false);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteCourse.mutateAsync(deleteId);
      toast.success("কোর্স মুছে ফেলা হয়েছে");
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
          <h1 className="font-heading text-2xl font-bold text-foreground">কোর্স ম্যানেজমেন্ট</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">মোট {courses.length}টি কোর্স</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> রিফ্রেশ
          </Button>
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> নতুন কোর্স
          </Button>
        </div>
      </div>

      <div className="relative mt-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="শিরোনাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">লোড হচ্ছে...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm font-medium text-destructive">ডেটা লোড হয়নি</p>
            <div className="max-w-sm rounded-md border border-border bg-muted/50 p-4 text-left text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">সমাধান:</p>
              <p className="mt-1">Supabase SQL Editor-এ নিচের ফাইলটি রান করুন:</p>
              <code className="mt-2 block rounded bg-muted px-2 py-1.5 text-[11px]">supabase_courses_migration.sql</code>
              <p className="mt-2 text-[11px]">Error: {(error as Error)?.message}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>আবার চেষ্টা করুন</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BookOpen className="mb-3 h-10 w-10 opacity-30" />
            <p>কোনো কোর্স পাওয়া যায়নি</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {["কোর্স", "ক্যাটাগরি", "মূল্য", "মিডিয়া", "স্ট্যাটাস", "অ্যাকশন"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filtered.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.thumbnail_url ? (
                        <img src={c.thumbnail_url} alt={c.title} className="h-10 w-16 rounded object-cover shrink-0" />
                      ) : (
                        <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded bg-muted">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.teacher_name ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.category ?? "—"}</td>
                  <td className="px-4 py-3">
                    {c.discount_price ? (
                      <div>
                        <span className="font-medium text-foreground">৳{c.discount_price}</span>
                        <span className="ml-1 text-xs line-through text-muted-foreground">৳{c.price}</span>
                      </div>
                    ) : (
                      <span className="font-medium text-foreground">{c.price ? `৳${c.price}` : "ফ্রি"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {(c.videos?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-1"><Youtube className="h-3 w-3" />{c.videos!.length}</span>
                      )}
                      {(c.resources?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-1"><FileDown className="h-3 w-3" />{c.resources!.length}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {(c as Course & { is_published?: boolean }).is_published !== false ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">প্রকাশিত</Badge>
                    ) : (
                      <Badge variant="secondary">ড্রাফট</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(c.id)}>
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

      {/* Add / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{form.id ? "কোর্স সম্পাদনা" : "নতুন কোর্স যোগ করুন"}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6 pb-4">
            {/* Basic info */}
            <Section label="মূল তথ্য">
              <Field label="শিরোনাম *">
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="কোর্সের নাম" />
              </Field>
              <Field label="Slug (URL)">
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated" />
              </Field>
              <Field label="ক্যাটাগরি">
                <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="ISSB, BCS, Cadet..." />
              </Field>
              <Field label="থাম্বনেইল URL">
                <Input value={form.thumbnail_url} onChange={(e) => set("thumbnail_url", e.target.value)} placeholder="https://..." />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="মূল্য (৳)">
                  <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="2500" />
                </Field>
                <Field label="ছাড়ের মূল্য">
                  <Input type="number" value={form.discount_price} onChange={(e) => set("discount_price", e.target.value)} placeholder="ঐচ্ছিক" />
                </Field>
                <Field label="সময়কাল">
                  <Input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="২০ ঘণ্টা" />
                </Field>
              </div>
              <Field label="মোট লেসন">
                <Input type="number" value={form.total_lessons} onChange={(e) => set("total_lessons", e.target.value)} placeholder="32" />
              </Field>
            </Section>

            {/* Descriptions */}
            <Section label="বিবরণ">
              <Field label="সংক্ষিপ্ত বিবরণ">
                <Textarea value={form.short_description} onChange={(v) => set("short_description", v)} rows={2} placeholder="এক-দুই লাইনের বিবরণ..." />
              </Field>
              <Field label="বিস্তারিত বিবরণ">
                <Textarea value={form.long_description} onChange={(v) => set("long_description", v)} rows={4} placeholder="বিস্তারিত বিবরণ..." />
              </Field>
              <Field label="হাইলাইট (প্রতিটি লাইনে একটি)">
                <Textarea value={form.highlights} onChange={(v) => set("highlights", v)} rows={3} placeholder={"বাস্তব প্রজেক্ট-ভিত্তিক শেখা\nআজীবন অ্যাক্সেস\nসার্টিফিকেট প্রদান"} />
              </Field>
            </Section>

            {/* Videos */}
            <Section label="ভিডিও">
              <p className="text-xs text-muted-foreground">YouTube বা Vimeo URL দিন। কোর্স পেজে embedded player দেখাবে।</p>
              <div className="space-y-2">
                {form.videos.map((v, i) => (
                  <div key={v.id} className="flex items-start gap-2 rounded-md border border-border p-3">
                    <GripVertical className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 space-y-2">
                      <Input value={v.title} onChange={(e) => setVideo(i, "title", e.target.value)} placeholder="ভিডিওর শিরোনাম" />
                      <Input value={v.url} onChange={(e) => setVideo(i, "url", e.target.value)} placeholder="https://youtube.com/watch?v=... বা https://vimeo.com/..." />
                      <Input value={v.description ?? ""} onChange={(e) => setVideo(i, "description", e.target.value)} placeholder="সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeVideo(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addVideo} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> ভিডিও যোগ করুন
              </Button>
            </Section>

            {/* Resources */}
            <Section label="রিসোর্স শিট">
              <p className="text-xs text-muted-foreground">PDF বা ফাইল লিংক দিন। শিক্ষার্থীরা ডাউনলোড করতে পারবে।</p>
              <div className="space-y-2">
                {form.resources.map((r, i) => (
                  <div key={r.id} className="flex items-start gap-2 rounded-md border border-border p-3">
                    <GripVertical className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 space-y-2">
                      <Input value={r.title} onChange={(e) => setResource(i, "title", e.target.value)} placeholder="ফাইলের নাম" />
                      <Input value={r.url} onChange={(e) => setResource(i, "url", e.target.value)} placeholder="https://... (Google Drive, PDF link)" />
                      <Input value={r.type ?? ""} onChange={(e) => setResource(i, "type", e.target.value)} placeholder="ফাইল ধরন: pdf, doc, sheet (ঐচ্ছিক)" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeResource(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addResource} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> রিসোর্স যোগ করুন
              </Button>
            </Section>

            {/* Teacher */}
            <Section label="শিক্ষক">
              <Field label="শিক্ষকের নাম">
                <Input value={form.teacher_name} onChange={(e) => set("teacher_name", e.target.value)} placeholder="ড. নাহিদ সুলতান" />
              </Field>
              <Field label="সংক্ষিপ্ত পরিচয়">
                <Input value={form.teacher_short_bio} onChange={(e) => set("teacher_short_bio", e.target.value)} placeholder="মনোবিজ্ঞানী, ISSB পরামর্শদাতা" />
              </Field>
              <Field label="বিস্তারিত পরিচয়">
                <Textarea value={form.teacher_long_bio} onChange={(v) => set("teacher_long_bio", v)} rows={3} placeholder="শিক্ষকের বিস্তারিত পরিচয়..." />
              </Field>
            </Section>

            {/* Settings */}
            <Section label="সেটিংস">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => set("is_published", e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-accent"
                />
                <span className="text-sm">প্রকাশিত (পাবলিক দেখতে পাবে)</span>
              </label>
            </Section>
          </div>

          <SheetFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              <X className="mr-2 h-4 w-4" /> বাতিল
            </Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>
              {upsert.isPending ? "সংরক্ষণ হচ্ছে..." : form.id ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>কোর্স মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই অ্যাকশন পূর্বাবস্থায় ফেরানো যাবে না।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteCourse.isPending}
            >
              {deleteCourse.isPending ? "মুছছে..." : "মুছে ফেলুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Textarea({ value, onChange, rows, placeholder }: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows ?? 3}
      placeholder={placeholder}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}
