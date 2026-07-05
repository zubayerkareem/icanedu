import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Plus, Pencil, Trash2, RefreshCw, Search,
  Youtube, FileDown, GripVertical, Save, ListOrdered, List,
} from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAdminCourses, useDeleteCourse } from "@/hooks/useAdminCourses";
import type { Course } from "@/lib/courses/types";

// ─── Course Order hooks & components ─────────────────────────────────────────

function useAllCoursesForOrder() {
  return useQuery<Course[]>({
    queryKey: ["admin_courses_order"],
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, thumbnail_url, category, display_order, is_published")
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Course[];
    },
  });
}

function useSaveCourseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (courses: Course[]) => {
      const updates = courses.map((c, idx) =>
        supabase.from("courses").update({ display_order: idx + 1 }).eq("id", c.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_courses_order"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["home_courses"] });
      toast.success("কোর্সের ক্রম সেভ হয়েছে");
    },
    onError: () => toast.error("সেভ করতে ব্যর্থ হয়েছে"),
  });
}

function SortableCourseRow({ course, index }: { course: Course; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="w-6 shrink-0 text-center text-sm font-bold text-muted-foreground">
        {index + 1}
      </span>
      {course.thumbnail_url ? (
        <img src={course.thumbnail_url} alt={course.title} className="h-10 w-16 rounded-md object-cover shrink-0" />
      ) : (
        <div className="h-10 w-16 rounded-md bg-muted shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground text-sm">{course.title}</p>
        {course.category && <p className="text-xs text-muted-foreground truncate">{course.category}</p>}
      </div>
      <span className={[
        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        course.is_published
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-muted text-muted-foreground",
      ].join(" ")}>
        {course.is_published ? "Published" : "Draft"}
      </span>
    </div>
  );
}

function CourseOrderPanel() {
  const { data: dbCourses = [], isLoading } = useAllCoursesForOrder();
  const [courses, setCourses] = useState<Course[]>([]);
  const [dirty, setDirty] = useState(false);
  const { mutate: saveOrder, isPending } = useSaveCourseOrder();

  const displayList = dirty ? courses : dbCourses;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = displayList.findIndex((c) => c.id === active.id);
    const newIndex = displayList.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(displayList, oldIndex, newIndex);
    setCourses(reordered);
    setDirty(true);
  }

  function handleSave() {
    saveOrder(displayList, { onSuccess: () => setDirty(false) });
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          টেনে সরিয়ে সাজান — হোমপেজ ও কোর্স পেজে এই ক্রমে দেখাবে।
        </p>
        <Button onClick={handleSave} disabled={!dirty || isPending} size="sm" className="gap-2">
          <Save className="h-4 w-4" />
          {isPending ? "সেভ হচ্ছে…" : "সেভ করুন"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">কোনো কোর্স পাওয়া যায়নি।</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayList.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {displayList.map((course, idx) => (
                <SortableCourseRow key={course.id} course={course} index={idx} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {dirty && (
        <p className="text-xs text-amber-600 text-center">
          পরিবর্তন সেভ হয়নি — উপরে "সেভ করুন" বাটনে ক্লিক করুন।
        </p>
      )}
    </div>
  );
}

export default function AdminCourses() {
  const { data: courses = [], isLoading, error, refetch } = useAdminCourses();
  const deleteCourse = useDeleteCourse();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"list" | "order">("list");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = courses.filter((c) => {
    const q = search.trim().toLowerCase();
    return !q || c.title.toLowerCase().includes(q) || (c.category ?? "").toLowerCase().includes(q);
  });

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
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setTab("list")}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
                tab === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted",
              ].join(" ")}
            >
              <List className="h-4 w-4" /> তালিকা
            </button>
            <button
              onClick={() => setTab("order")}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-l border-border",
                tab === "order" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted",
              ].join(" ")}
            >
              <ListOrdered className="h-4 w-4" /> ক্রম নির্ধারণ
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> রিফ্রেশ
          </Button>
          <Button size="sm" onClick={() => navigate("/admin/courses/new")}>
            <Plus className="mr-2 h-4 w-4" /> নতুন কোর্স
          </Button>
        </div>
      </div>

      {tab === "order" && <CourseOrderPanel />}

      {tab === "list" && (
        <>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/courses/${c.id}/edit`)}>
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
        </>
      )}
    </div>
  );
}
