import { useState, useEffect } from "react";
import { GraduationCap, Plus, Trash2, ExternalLink, Send, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RichEditor, RichContent } from "@/components/RichEditor";
import { toast } from "sonner";
import {
  useAdminCadetCourses,
  useCadetNotifications,
  useSendCadetNotification,
  useDeleteCadetNotification,
} from "@/hooks/useCadetNotifications";
import { useQueryClient } from "@tanstack/react-query";

// ─── Notification compose sheet ───────────────────────────────────────────────

function ComposeSheet({
  open,
  onClose,
  courseId,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
}) {
  const send = useSendCadetNotification();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [classLink, setClassLink] = useState("");

  async function handleSend() {
    if (!title.trim()) {
      toast.error("শিরোনাম লিখুন");
      return;
    }
    try {
      await send.mutateAsync({
        course_id: courseId,
        title: title.trim(),
        body: body || undefined,
        class_link: classLink.trim() || undefined,
      });
      toast.success("নোটিফিকেশন পাঠানো হয়েছে");
      setTitle("");
      setBody("");
      setClassLink("");
      onClose();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে");
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>নতুন নোটিফিকেশন</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <Label>শিরোনাম *</Label>
            <Input
              placeholder="নোটিফিকেশনের বিষয়"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>ক্লাস লিংক (ঐচ্ছিক)</Label>
            <Input
              placeholder="https://meet.google.com/..."
              value={classLink}
              onChange={(e) => setClassLink(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>বিস্তারিত (ঐচ্ছিক)</Label>
            <div className="rounded-lg border border-border overflow-hidden">
              <RichEditor
                value={body}
                onChange={setBody}
                placeholder="নোটিশ বা বার্তা লিখুন..."
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSend} disabled={send.isPending} className="gap-2">
              <Send className="h-4 w-4" />
              {send.isPending ? "পাঠানো হচ্ছে..." : "পাঠান"}
            </Button>
            <Button variant="outline" onClick={onClose}>বাতিল</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Cadet URL config panel ───────────────────────────────────────────────────

function UrlConfigPanel({ courseId }: { courseId: string }) {
  const { data: courses = [] } = useAdminCadetCourses();
  const course = courses.find((c) => c.id === courseId);
  const qc = useQueryClient();

  const [assignment, setAssignment] = useState("");
  const [homework, setHomework] = useState("");
  const [attendance, setAttendance] = useState("");

  // Sync fields when course data loads or courseId changes
  useEffect(() => {
    if (course) {
      setAssignment(course.cadet_assignment_url ?? "");
      setHomework(course.cadet_homework_url ?? "");
      setAttendance(course.cadet_attendance_url ?? "");
    }
  }, [course?.id, course?.cadet_assignment_url, course?.cadet_homework_url, course?.cadet_attendance_url]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!course) return;
    try {
      const { error } = await supabase.from("courses").update({
        cadet_assignment_url: assignment.trim() || null,
        cadet_homework_url: homework.trim() || null,
        cadet_attendance_url: attendance.trim() || null,
      }).eq("id", courseId);
      if (error) throw error;
      toast.success("লিংক সেভ হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin_cadet_courses"] });
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে");
    }
  }

  return (
    <div className="rounded-xl border border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950/30 p-4 space-y-3">
      <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
        শিক্ষার্থী বাটন লিংক
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">এসাইনমেন্ট</Label>
          <Input
            placeholder="https://..."
            value={assignment}
            onChange={(e) => setAssignment(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">হোম ওয়ার্ক</Label>
          <Input
            placeholder="https://..."
            value={homework}
            onChange={(e) => setHomework(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">এটেন্ডেন্স</Label>
          <Input
            placeholder="https://..."
            value={attendance}
            onChange={(e) => setAttendance(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>
      <Button size="sm" onClick={handleSave}>সেভ করুন</Button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CadetAdmin() {
  const { data: cadetCourses = [], isLoading: loadingCourses } = useAdminCadetCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; courseId: string } | null>(null);

  const { data: notifications = [], isLoading: loadingNotifs } = useCadetNotifications(selectedCourseId);
  const deleteNotif = useDeleteCadetNotification();

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteNotif.mutateAsync(deleteTarget);
      toast.success("নোটিফিকেশন মুছে ফেলা হয়েছে");
    } catch {
      toast.error("সমস্যা হয়েছে");
    } finally {
      setDeleteTarget(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("bn-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-cyan-600" /> ক্যাডেট কোর্স
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          ক্যাডেট কোর্সের নোটিফিকেশন পাঠান এবং বাটন লিংক কনফিগার করুন
        </p>
      </div>

      {/* Course selector */}
      {loadingCourses ? (
        <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
      ) : cadetCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 opacity-20" />
          <p className="text-sm">কোনো ক্যাডেট কোর্স নেই।</p>
          <p className="text-xs mt-1">
            কোর্স এডিটরে কোর্স টাইপ "ক্যাডেট কোর্স" সেট করুন।
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Select
            value={selectedCourseId ?? ""}
            onValueChange={(v) => setSelectedCourseId(v || null)}
          >
            <SelectTrigger className="w-72">
              <SelectValue placeholder="ক্যাডেট কোর্স বেছে নিন" />
            </SelectTrigger>
            <SelectContent>
              {cadetCourses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCourseId && (
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSelectedCourseId(null)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Course detail */}
      {selectedCourseId && (
        <>
          {/* URL config */}
          <UrlConfigPanel courseId={selectedCourseId} />

          {/* Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">নোটিফিকেশন</h2>
              <Button size="sm" onClick={() => setComposeOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> নতুন নোটিফিকেশন
              </Button>
            </div>

            {loadingNotifs ? (
              <p className="text-sm text-muted-foreground py-4">লোড হচ্ছে...</p>
            ) : notifications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
                এখনো কোনো নোটিফিকেশন পাঠানো হয়নি
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(n.created_at)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget({ id: n.id, courseId: selectedCourseId })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {n.class_link && (
                      <a
                        href={n.class_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" /> ক্লাস লিংক
                      </a>
                    )}

                    {n.body && (
                      <div className="mt-2 text-sm border-t border-border pt-2">
                        <RichContent html={n.body} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Compose sheet */}
      {selectedCourseId && (
        <ComposeSheet
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          courseId={selectedCourseId}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>নোটিফিকেশন মুছুন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই নোটিফিকেশনটি স্থায়ীভাবে মুছে ফেলা হবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              মুছুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
