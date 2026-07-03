import { useState } from "react";
import { GripVertical, Save } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Course } from "@/lib/courses/types";

// ─── Fetch all courses (published + unpublished) for ordering ────────────────

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

// ─── Save order mutation ─────────────────────────────────────────────────────

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

// ─── Single sortable row ─────────────────────────────────────────────────────

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
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Serial number */}
      <span className="w-6 shrink-0 text-center text-sm font-bold text-muted-foreground">
        {index + 1}
      </span>

      {/* Thumbnail */}
      {course.thumbnail_url ? (
        <img
          src={course.thumbnail_url}
          alt={course.title}
          className="h-10 w-16 rounded-md object-cover shrink-0"
        />
      ) : (
        <div className="h-10 w-16 rounded-md bg-muted shrink-0" />
      )}

      {/* Title + category */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground text-sm">{course.title}</p>
        {course.category && (
          <p className="text-xs text-muted-foreground truncate">{course.category}</p>
        )}
      </div>

      {/* Published badge */}
      <span
        className={[
          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
          course.is_published
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {course.is_published ? "Published" : "Draft"}
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CourseOrder() {
  const { data: dbCourses = [], isLoading } = useAllCoursesForOrder();
  const [courses, setCourses] = useState<Course[]>([]);
  const [dirty, setDirty] = useState(false);
  const { mutate: saveOrder, isPending } = useSaveCourseOrder();

  // Sync DB → local list (only when not dirty so we don't overwrite user's unsaved drag)
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
    saveOrder(displayList, {
      onSuccess: () => setDirty(false),
    });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground">কোর্সের ক্রম নির্ধারণ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            টেনে সরিয়ে সাজান — হোমপেজ ও কোর্স পেজে এই ক্রমে দেখাবে।
          </p>
        </div>
        <Button onClick={handleSave} disabled={!dirty || isPending} className="gap-2">
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
