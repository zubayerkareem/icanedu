import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Brain, Plus, X, GripVertical, Trash2, Save, Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RichEditor } from "@/components/RichEditor";
import { ImageUpload, FileUpload } from "@/components/admin/ImageUpload";
import { IconPicker } from "@/components/admin/IconPicker";
import { toast } from "sonner";
import { useCourse } from "@/hooks/useCourse";
import { useUpsertCourse } from "@/hooks/useAdminCourses";
import type {
  Course, Module, Lesson, LessonType, IconListItem, Coupon, CourseVideo, CourseResource,
  ISSBModuleConfig,
} from "@/lib/courses/types";
import { ISSB_ELEMENT_DEFS } from "@/lib/courses/types";
import { ISSBCourseEditor } from "@/components/admin/ISSBCourseEditor";

const uid = () => Math.random().toString(36).slice(2, 10);

const LESSON_TYPES: { value: LessonType; label: string }[] = [
  { value: "video", label: "ভিডিও" },
  { value: "pdf", label: "PDF" },
  { value: "quiz", label: "কুইজ" },
  { value: "assignment", label: "অ্যাসাইনমেন্ট" },
  { value: "text", label: "টেক্সট" },
];

type Form = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  duration: string;
  total_lessons: string;
  thumbnail_url: string;
  short_description: string;
  long_description: string;
  teacher_name: string;
  teacher_avatar: string;
  teacher_short_bio: string;
  teacher_long_bio: string;
  price: string;
  discount_price: string;
  discount_ends_at: string;
  is_published: boolean;
  highlight_items: IconListItem[];
  feature_items: IconListItem[];
  coupons: Coupon[];
  modules: Module[];
  videos: CourseVideo[];
  resources: CourseResource[];
};

const emptyForm: Form = {
  title: "", slug: "", category: "", duration: "", total_lessons: "",
  thumbnail_url: "", short_description: "", long_description: "",
  teacher_name: "", teacher_avatar: "", teacher_short_bio: "", teacher_long_bio: "",
  price: "", discount_price: "", discount_ends_at: "", is_published: true,
  highlight_items: [], feature_items: [], coupons: [], modules: [], videos: [], resources: [],
};

function fromCourse(c: Course): Form {
  return {
    id: c.id,
    title: c.title ?? "",
    slug: c.slug ?? "",
    category: c.category ?? "",
    duration: c.duration ?? "",
    total_lessons: c.total_lessons != null ? String(c.total_lessons) : "",
    thumbnail_url: c.thumbnail_url ?? "",
    short_description: c.short_description ?? "",
    long_description: c.long_description ?? "",
    teacher_name: c.teacher_name ?? c.teacher?.name ?? "",
    teacher_avatar: c.teacher_avatar ?? c.teacher?.avatar ?? "",
    teacher_short_bio: c.teacher_short_bio ?? c.teacher?.short_bio ?? "",
    teacher_long_bio: c.teacher_long_bio ?? c.teacher?.long_bio ?? "",
    price: c.price != null ? String(c.price) : "",
    discount_price: c.discount_price != null ? String(c.discount_price) : "",
    discount_ends_at: c.discount_ends_at ? c.discount_ends_at.slice(0, 10) : "",
    is_published: c.is_published ?? true,
    highlight_items: c.highlight_items ?? [],
    feature_items: c.feature_items ?? [],
    coupons: c.coupons ?? [],
    modules: c.modules ?? [],
    videos: c.videos ?? [],
    resources: c.resources ?? [],
  };
}

export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourse(id);
  const upsert = useUpsertCourse();

  const [form, setForm] = useState<Form>(emptyForm);

  useEffect(() => {
    if (isEdit && course) setForm(fromCourse(course));
  }, [isEdit, course]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // ── Icon lists ──────────────────────────────────────────────
  function addIconItem(key: "highlight_items" | "feature_items") {
    setForm((f) => ({ ...f, [key]: [...f[key], { id: uid(), icon: "CheckCircle2", text: "" }] }));
  }
  function setIconItem(key: "highlight_items" | "feature_items", idx: number, patch: Partial<IconListItem>) {
    setForm((f) => ({ ...f, [key]: f[key].map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  }
  function removeIconItem(key: "highlight_items" | "feature_items", idx: number) {
    setForm((f) => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));
  }

  // ── Coupons ─────────────────────────────────────────────────
  function addCoupon() {
    setForm((f) => ({ ...f, coupons: [...f.coupons, { code: "", type: "percent", value: 0 }] }));
  }
  function setCoupon(idx: number, patch: Partial<Coupon>) {
    setForm((f) => ({ ...f, coupons: f.coupons.map((c, i) => (i === idx ? { ...c, ...patch } : c)) }));
  }
  function removeCoupon(idx: number) {
    setForm((f) => ({ ...f, coupons: f.coupons.filter((_, i) => i !== idx) }));
  }

  // ── Modules ─────────────────────────────────────────────────
  function addModule() {
    setForm((f) => ({ ...f, modules: [...f.modules, { id: uid(), title: "", lessons: [], total_duration: "" }] }));
  }
  function addISSBModule() {
    setForm((f) => ({
      ...f,
      modules: [...f.modules, {
        id: uid(), title: "ISSB প্র্যাকটিস মডিউল", lessons: [], type: "issb" as const,
        issb: { iq: true, wat: true, ist: true, extempore: true, ppdt: true, pictureStory: true, incompleteStory: true },
      }],
    }));
  }
  function setModule(mi: number, patch: Partial<Module>) {
    setForm((f) => ({ ...f, modules: f.modules.map((m, i) => (i === mi ? { ...m, ...patch } : m)) }));
  }
  function removeModule(mi: number) {
    setForm((f) => ({ ...f, modules: f.modules.filter((_, i) => i !== mi) }));
  }
  function addLesson(mi: number) {
    setForm((f) => ({
      ...f,
      modules: f.modules.map((m, i) =>
        i === mi ? { ...m, lessons: [...m.lessons, { id: uid(), title: "", type: "video" as LessonType }] } : m
      ),
    }));
  }
  function setLesson(mi: number, li: number, patch: Partial<Lesson>) {
    setForm((f) => ({
      ...f,
      modules: f.modules.map((m, i) =>
        i === mi ? { ...m, lessons: m.lessons.map((l, j) => (j === li ? { ...l, ...patch } : l)) } : m
      ),
    }));
  }
  function removeLesson(mi: number, li: number) {
    setForm((f) => ({
      ...f,
      modules: f.modules.map((m, i) =>
        i === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m
      ),
    }));
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("কোর্সের শিরোনাম প্রয়োজন");
      return;
    }
    const lessonCount = form.modules.reduce((n, m) => n + m.lessons.length, 0);
    try {
      await upsert.mutateAsync({
        id: form.id,
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        category: form.category.trim() || undefined,
        thumbnail_url: form.thumbnail_url || undefined,
        duration: form.duration.trim() || undefined,
        price: form.price ? Number(form.price) : undefined,
        discount_price: form.discount_price ? Number(form.discount_price) : undefined,
        discount_ends_at: form.discount_ends_at ? new Date(form.discount_ends_at).toISOString() : undefined,
        short_description: form.short_description.trim() || undefined,
        long_description: form.long_description || undefined,
        total_lessons: form.total_lessons ? Number(form.total_lessons) : lessonCount,
        teacher_name: form.teacher_name.trim() || undefined,
        teacher_avatar: form.teacher_avatar || undefined,
        teacher_short_bio: form.teacher_short_bio.trim() || undefined,
        teacher_long_bio: form.teacher_long_bio.trim() || undefined,
        highlight_items: form.highlight_items.filter((h) => h.text.trim()),
        feature_items: form.feature_items.filter((h) => h.text.trim()),
        coupons: form.coupons.filter((c) => c.code.trim()).map((c) => ({ ...c, code: c.code.trim().toUpperCase() })),
        modules: form.modules,
        videos: form.videos,
        resources: form.resources,
        is_published: form.is_published,
      });
      toast.success(isEdit ? "কোর্স আপডেট হয়েছে" : "নতুন কোর্স যোগ হয়েছে");
      navigate("/admin/courses");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে");
    }
  }

  if (isEdit && isLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">লোড হচ্ছে...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to="/admin/courses"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="font-heading text-lg font-bold text-foreground">
            {isEdit ? "কোর্স সম্পাদনা" : "নতুন কোর্স"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={form.is_published} onCheckedChange={(v) => set("is_published", v)} />
            প্রকাশিত
          </label>
          <Button size="sm" onClick={handleSave} disabled={upsert.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {upsert.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="mb-6 flex w-full flex-wrap justify-start">
          <TabsTrigger value="basic">মূল তথ্য</TabsTrigger>
          <TabsTrigger value="pricing">মূল্য ও কুপন</TabsTrigger>
          <TabsTrigger value="overview">ওভারভিউ</TabsTrigger>
          <TabsTrigger value="curriculum">কারিকুলাম</TabsTrigger>
          <TabsTrigger value="media">মিডিয়া</TabsTrigger>
        </TabsList>

        {/* ─── BASIC ─── */}
        <TabsContent value="basic" className="space-y-5">
          <Field label="শিরোনাম *">
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="কোর্সের নাম" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug (URL)">
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated" />
            </Field>
            <Field label="ক্যাটাগরি">
              <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="ISSB, Cadet..." />
            </Field>
            <Field label="সময়কাল">
              <Input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="৮ সপ্তাহ / ৪৮ দিন" />
            </Field>
            <Field label="মোট লেসন (খালি = স্বয়ংক্রিয়)">
              <Input type="number" value={form.total_lessons} onChange={(e) => set("total_lessons", e.target.value)} placeholder="104" />
            </Field>
          </div>
          <Field label="কোর্স ইমেজ (সরাসরি আপলোড)">
            <ImageUpload value={form.thumbnail_url} onChange={(url) => set("thumbnail_url", url)} folder="thumbnails" />
          </Field>
          <Field label="সংক্ষিপ্ত বিবরণ">
            <textarea
              value={form.short_description}
              onChange={(e) => set("short_description", e.target.value)}
              rows={3}
              placeholder="৮ সপ্তাহে সম্পূর্ণ ISSB প্রস্তুতি..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>

          <div className="rounded-lg border border-border p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">শিক্ষক</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="নাম">
                <Input value={form.teacher_name} onChange={(e) => set("teacher_name", e.target.value)} placeholder="মেজর (অব.) আরিফ হোসেন" />
              </Field>
              <Field label="সংক্ষিপ্ত পরিচয়">
                <Input value={form.teacher_short_bio} onChange={(e) => set("teacher_short_bio", e.target.value)} placeholder="ISSB পরামর্শদাতা" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="ছবি (আপলোড)">
                <ImageUpload value={form.teacher_avatar} onChange={(url) => set("teacher_avatar", url)} folder="thumbnails" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="বিস্তারিত পরিচয়">
                <textarea
                  value={form.teacher_long_bio}
                  onChange={(e) => set("teacher_long_bio", e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>
            </div>
          </div>
        </TabsContent>

        {/* ─── PRICING & COUPONS ─── */}
        <TabsContent value="pricing" className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="মূল্য (৳)">
              <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="9000" />
            </Field>
            <Field label="ছাড়ের মূল্য (৳)">
              <Input type="number" value={form.discount_price} onChange={(e) => set("discount_price", e.target.value)} placeholder="ঐচ্ছিক" />
            </Field>
            <Field label="ছাড় শেষ হবে">
              <Input type="date" value={form.discount_ends_at} onChange={(e) => set("discount_ends_at", e.target.value)} />
            </Field>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Ticket className="h-4 w-4" /> কুপন কোড
              </p>
              <Button variant="outline" size="sm" onClick={addCoupon}>
                <Plus className="mr-2 h-4 w-4" /> কুপন
              </Button>
            </div>
            <div className="space-y-3">
              {form.coupons.length === 0 && (
                <p className="text-sm text-muted-foreground">কোনো কুপন নেই</p>
              )}
              {form.coupons.map((c, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 rounded-md border border-border p-3 sm:grid-cols-6 sm:items-end">
                  <Field label="কোড">
                    <Input value={c.code} onChange={(e) => setCoupon(i, { code: e.target.value })} placeholder="SAVE20" />
                  </Field>
                  <Field label="ধরন">
                    <Select value={c.type} onValueChange={(v) => setCoupon(i, { type: v as Coupon["type"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">শতকরা (%)</SelectItem>
                        <SelectItem value="fixed">নির্দিষ্ট (৳)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="মান">
                    <Input type="number" value={c.value || ""} onChange={(e) => setCoupon(i, { value: Number(e.target.value) })} placeholder="20" />
                  </Field>
                  <Field label="মেয়াদ">
                    <Input type="date" value={c.expires_at ? c.expires_at.slice(0, 10) : ""} onChange={(e) => setCoupon(i, { expires_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
                  </Field>
                  <Field label="সর্বোচ্চ ব্যবহার">
                    <Input type="number" value={c.max_uses ?? ""} onChange={(e) => setCoupon(i, { max_uses: e.target.value ? Number(e.target.value) : undefined })} placeholder="∞" />
                  </Field>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">ব্যবহৃত: {c.used_count ?? 0}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeCoupon(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ─── OVERVIEW ─── */}
        <TabsContent value="overview" className="space-y-6">
          <Field label="কোর্স সম্পর্কে বিস্তারিত">
            <RichEditor value={form.long_description} onChange={(html) => set("long_description", html)} placeholder="বিস্তারিত লিখুন..." />
          </Field>

          <IconListEditor
            label='"কোর্সটি যে কারণে আলাদা" তালিকা'
            items={form.highlight_items}
            onAdd={() => addIconItem("highlight_items")}
            onChange={(idx, patch) => setIconItem("highlight_items", idx, patch)}
            onRemove={(idx) => removeIconItem("highlight_items", idx)}
            placeholder="১০৪ ঘণ্টা ক্লাস"
          />

          <IconListEditor
            label='"কোর্সে যা যা পাচ্ছেন" তালিকা'
            items={form.feature_items}
            onAdd={() => addIconItem("feature_items")}
            onChange={(idx, patch) => setIconItem("feature_items", idx, patch)}
            onRemove={(idx) => removeIconItem("feature_items", idx)}
            placeholder="৪৮ ভিডিও লেসন"
          />
        </TabsContent>

        {/* ─── CURRICULUM ─── */}
        <TabsContent value="curriculum" className="space-y-4">
          {form.modules.map((m, mi) => (
            <div key={m.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-sm font-bold text-accent">{mi + 1}</span>
                <Input
                  value={m.title}
                  onChange={(e) => setModule(mi, { title: e.target.value })}
                  placeholder={m.type === "issb" ? "ISSB মডিউলের শিরোনাম" : "মডিউলের শিরোনাম"}
                  className="flex-1"
                />
                {m.type !== "issb" && (
                  <Input
                    value={m.total_duration ?? ""}
                    onChange={(e) => setModule(mi, { total_duration: e.target.value })}
                    placeholder="১ ঘণ্টা ২০ মিনিট"
                    className="w-40"
                  />
                )}
                {m.type === "issb" && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                    <Brain className="h-3 w-3" /> ISSB
                  </span>
                )}
                <label className="flex shrink-0 items-center gap-1.5 text-xs">
                  <Switch checked={!!m.isFree} onCheckedChange={(v) => setModule(mi, { isFree: v })} />
                  ফ্রি
                </label>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeModule(mi)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* ISSB Module: element visibility toggles + full content editor */}
              {m.type === "issb" && (
                <div className="mt-3 pl-9 space-y-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">কোর্স কারিকুলামে দেখানো হবে</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {ISSB_ELEMENT_DEFS.map((el) => (
                        <label key={el.key} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs cursor-pointer hover:bg-muted/50">
                          <input
                            type="checkbox"
                            checked={!!(m.issb as ISSBModuleConfig | undefined)?.[el.key]}
                            onChange={(e) => setModule(mi, {
                              issb: { ...(m.issb ?? { iq: false, wat: false, ist: false, extempore: false, ppdt: false, pictureStory: false, incompleteStory: false }), [el.key]: e.target.checked } as ISSBModuleConfig,
                            })}
                            className="accent-accent"
                          />
                          {el.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {form.id ? (
                    <ISSBCourseEditor courseId={form.id} />
                  ) : (
                    <p className="rounded-md border border-dashed border-border px-4 py-3 text-xs text-muted-foreground text-center">
                      ISSB কন্টেন্ট যোগ করতে প্রথমে কোর্সটি সেভ করুন।
                    </p>
                  )}
                </div>
              )}

              {/* Regular module: Lessons */}
              {m.type !== "issb" && (
              <div className="mt-3 space-y-2 pl-9">
                {m.lessons.map((l, li) => (
                  <div key={l.id} className="rounded-md border border-border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        value={l.title}
                        onChange={(e) => setLesson(mi, li, { title: e.target.value })}
                        placeholder="লেসনের শিরোনাম"
                        className="min-w-[160px] flex-1"
                      />
                      <Select value={l.type} onValueChange={(v) => setLesson(mi, li, { type: v as LessonType })}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LESSON_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input
                        value={l.duration ?? ""}
                        onChange={(e) => setLesson(mi, li, { duration: e.target.value })}
                        placeholder="০৮:১২ / ১০ প্রশ্ন"
                        className="w-28"
                      />
                      <label className="flex items-center gap-1.5 text-xs">
                        <Switch checked={!!l.isFree} onCheckedChange={(v) => setLesson(mi, li, { isFree: v })} />
                        ফ্রি
                      </label>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeLesson(mi, li)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* type-conditional content */}
                    <div className="mt-2">
                      {l.type === "video" && (
                        <Input
                          value={l.video_url ?? ""}
                          onChange={(e) => setLesson(mi, li, { video_url: e.target.value })}
                          placeholder="https://youtube.com/watch?v=... বা https://vimeo.com/..."
                        />
                      )}
                      {l.type === "pdf" && (
                        <FileUpload value={l.pdf_url} onChange={(url) => setLesson(mi, li, { pdf_url: url })} />
                      )}
                      {(l.type === "text" || l.type === "quiz" || l.type === "assignment") && (
                        <RichEditor
                          value={l.content ?? ""}
                          onChange={(html) => setLesson(mi, li, { content: html })}
                          placeholder={l.type === "text" ? "লেসন কন্টেন্ট..." : "নির্দেশনা / প্রশ্ন..."}
                        />
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addLesson(mi)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> লেসন যোগ করুন
                </Button>
              </div>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={addModule} className="flex-1">
              <Plus className="mr-2 h-4 w-4" /> সাধারণ মডিউল যোগ
            </Button>
            <Button variant="outline" onClick={addISSBModule} className="flex-1 border-accent/40 text-accent hover:bg-accent/10">
              <Brain className="mr-2 h-4 w-4" /> ISSB মডিউল যোগ
            </Button>
          </div>
        </TabsContent>

        {/* ─── MEDIA (legacy global videos/resources) ─── */}
        <TabsContent value="media" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            কোর্স পেজের আলাদা "ভিডিও লেসন" ও "রিসোর্স শিট" সেকশন (ঐচ্ছিক)। কারিকুলামের লেসন এর সাথে আলাদা।
          </p>

          <div className="rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ভিডিও</p>
              <Button variant="outline" size="sm" onClick={() => set("videos", [...form.videos, { id: uid(), title: "", url: "" }])}>
                <Plus className="mr-2 h-4 w-4" /> ভিডিও
              </Button>
            </div>
            <div className="space-y-2">
              {form.videos.map((v, i) => (
                <div key={v.id} className="flex items-start gap-2 rounded-md border border-border p-3">
                  <div className="flex-1 space-y-2">
                    <Input value={v.title} onChange={(e) => set("videos", form.videos.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} placeholder="ভিডিওর শিরোনাম" />
                    <Input value={v.url} onChange={(e) => set("videos", form.videos.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} placeholder="https://youtube.com/..." />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => set("videos", form.videos.filter((_, j) => j !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">রিসোর্স শিট (PDF আপলোড)</p>
              <Button variant="outline" size="sm" onClick={() => set("resources", [...form.resources, { id: uid(), title: "", url: "", type: "pdf" }])}>
                <Plus className="mr-2 h-4 w-4" /> রিসোর্স
              </Button>
            </div>
            <div className="space-y-2">
              {form.resources.map((r, i) => (
                <div key={r.id} className="flex items-start gap-2 rounded-md border border-border p-3">
                  <div className="flex-1 space-y-2">
                    <Input value={r.title} onChange={(e) => set("resources", form.resources.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} placeholder="ফাইলের নাম" />
                    <FileUpload value={r.url} onChange={(url) => set("resources", form.resources.map((x, j) => j === i ? { ...x, url } : x))} />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => set("resources", form.resources.filter((_, j) => j !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
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

function IconListEditor({
  label, items, onAdd, onChange, onRemove, placeholder,
}: {
  label: string;
  items: IconListItem[];
  onAdd: () => void;
  onChange: (idx: number, patch: Partial<IconListItem>) => void;
  onRemove: (idx: number) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" /> আইটেম
        </Button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">কোনো আইটেম নেই</p>}
        {items.map((it, i) => (
          <div key={it.id} className="flex items-center gap-2">
            <IconPicker value={it.icon} onChange={(name) => onChange(i, { icon: name })} />
            <Input value={it.text} onChange={(e) => onChange(i, { text: e.target.value })} placeholder={placeholder} className="flex-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(i)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
