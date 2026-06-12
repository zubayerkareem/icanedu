import { useState } from "react";
import {
  Users, Search, RefreshCw, ShieldCheck, GraduationCap, Trash2,
  KeyRound, BookOpen, ChevronDown, ChevronRight, Plus, Ban,
  CalendarDays, UserPlus, Save, Eye, EyeOff, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useStudents, useDeleteStudent, useResetStudentPassword } from "@/hooks/useStudents";
import {
  useStudentCourseOrders,
  useAllCoursesForSelect,
  useAdminEnrollStudent,
  useAdminRevokeEnrollment,
  useAdminUpdateValidity,
  useAdminCreateStudent,
} from "@/hooks/useAdminEnrollments";
import type { Order } from "@/hooks/useOrders";

// ─── Validity badge ────────────────────────────────────────────────────────────

function ValidityBadge({ order }: { order: Order }) {
  if (order.status === "cancelled")
    return <Badge variant="destructive" className="text-[10px]">বাতিল</Badge>;
  if (!order.valid_until)
    return <Badge className="text-[10px] bg-green-100 text-green-700 border-0">আজীবন</Badge>;
  const exp = new Date(order.valid_until);
  const now = new Date();
  if (exp <= now)
    return <Badge variant="destructive" className="text-[10px]">মেয়াদ শেষ</Badge>;
  const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
  return (
    <Badge className={`text-[10px] border-0 ${days < 7 ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
      {exp.toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" })} পর্যন্ত
    </Badge>
  );
}

// ─── Enrollment panel ──────────────────────────────────────────────────────────

function EnrollmentPanel({ userId }: { userId: string }) {
  const { data: orders = [], isLoading } = useStudentCourseOrders(userId);
  const { data: courses = [] } = useAllCoursesForSelect();
  const enroll = useAdminEnrollStudent();
  const revoke = useAdminRevokeEnrollment();
  const updateValidity = useAdminUpdateValidity();

  const [courseId, setCourseId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newValidity, setNewValidity] = useState("");

  async function handleEnroll() {
    const course = courses.find((c) => c.id === courseId);
    if (!course) { toast.error("কোর্স বেছে নিন"); return; }
    try {
      await enroll.mutateAsync({ email: "", courseId: course.id, courseName: course.title, validUntil: validUntil || null });
      toast.success("কোর্স অ্যাসাইন হয়েছে");
      setCourseId(""); setValidUntil("");
    } catch (e: unknown) { toast.error((e as Error)?.message); }
  }

  async function handleRevoke(orderId: string) {
    try {
      await revoke.mutateAsync(orderId);
      toast.success("অ্যাক্সেস বাতিল হয়েছে");
    } catch { toast.error("সমস্যা হয়েছে"); }
  }

  async function handleSaveValidity(orderId: string, validity: string | null) {
    try {
      await updateValidity.mutateAsync({ orderId, validUntil: validity });
      toast.success("মেয়াদ আপডেট হয়েছে");
      setEditingId(null);
    } catch { toast.error("সমস্যা হয়েছে"); }
  }

  return (
    <div className="border-t border-border bg-muted/30 px-4 py-4 space-y-4">
      {/* Enrolled courses */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">এনরোলড কোর্স</p>
        {isLoading && <p className="text-xs text-muted-foreground">লোড হচ্ছে...</p>}
        {!isLoading && orders.length === 0 && (
          <p className="text-xs text-muted-foreground italic">কোনো কোর্স নেই</p>
        )}
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{o.product_name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <ValidityBadge order={o} />
                    <span className="text-[10px] text-muted-foreground">
                      ভর্তি: {new Date(o.created_at).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                </div>
                {o.status !== "cancelled" && (
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      title="মেয়াদ পরিবর্তন"
                      onClick={() => {
                        setEditingId(editingId === o.id ? null : o.id);
                        setNewValidity(o.valid_until ? o.valid_until.slice(0, 10) : "");
                      }}
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                      title="অ্যাক্সেস বাতিল"
                      onClick={() => handleRevoke(o.id)}
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {editingId === o.id && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
                  <Input
                    type="date"
                    value={newValidity}
                    onChange={(e) => setNewValidity(e.target.value)}
                    className="h-7 text-xs w-36"
                  />
                  <Button size="sm" className="h-7 text-xs px-2" onClick={() => handleSaveValidity(o.id, newValidity || null)}>
                    <Save className="mr-1 h-3 w-3" /> সেভ
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleSaveValidity(o.id, null)}>
                    আজীবন করুন
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add course */}
      <div className="rounded-lg border border-dashed border-border p-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">নতুন কোর্স যোগ করুন</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">কোর্স</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="কোর্স বেছে নিন" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">মেয়াদ (খালি = আজীবন)</Label>
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="h-8 text-xs" />
          </div>
        </div>
        <Button size="sm" className="h-7 text-xs" onClick={handleEnroll} disabled={!courseId || enroll.isPending}>
          <Plus className="mr-1 h-3 w-3" />
          {enroll.isPending ? "যোগ হচ্ছে..." : "কোর্স অ্যাসাইন করুন"}
        </Button>
      </div>
    </div>
  );
}

// ─── Create student dialog ─────────────────────────────────────────────────────

function CreateStudentDialog() {
  const createStudent = useAdminCreateStudent();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  async function handleCreate() {
    if (!email.trim()) { toast.error("ইমেইল দিন"); return; }
    if (password.length < 6) { toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর"); return; }
    try {
      await createStudent.mutateAsync({ email, password });
      toast.success(`${email} — অ্যাকাউন্ট তৈরি হয়েছে`);
      setEmail(""); setPassword(""); setOpen(false);
    } catch (e: unknown) { toast.error((e as Error)?.message); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="mr-2 h-4 w-4" /> নতুন শিক্ষার্থী
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন শিক্ষার্থী তৈরি করুন</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>ইমেইল</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@gmail.com" />
          </div>
          <div className="space-y-1.5">
            <Label>পাসওয়ার্ড</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষর"
                className="pr-9"
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPw((s) => !s)}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button className="w-full" onClick={handleCreate} disabled={createStudent.isPending}>
            <UserPlus className="mr-2 h-4 w-4" />
            {createStudent.isPending ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Quick enroll dialog ───────────────────────────────────────────────────────

function QuickEnrollDialog() {
  const { data: courses = [] } = useAllCoursesForSelect();
  const enroll = useAdminEnrollStudent();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState("");
  const [validUntil, setValidUntil] = useState("");

  async function handleSubmit() {
    if (!email.trim()) { toast.error("ইমেইল দিন"); return; }
    const course = courses.find((c) => c.id === courseId);
    if (!course) { toast.error("কোর্স বেছে নিন"); return; }
    try {
      await enroll.mutateAsync({ email, courseId: course.id, courseName: course.title, validUntil: validUntil || null });
      toast.success(`${email} — কোর্স অ্যাসাইন হয়েছে`);
      setEmail(""); setCourseId(""); setValidUntil(""); setOpen(false);
    } catch (e: unknown) { toast.error((e as Error)?.message); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <BookOpen className="mr-2 h-4 w-4" /> কোর্স অ্যাসাইন
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>কোর্স অ্যাসাইন করুন</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>শিক্ষার্থীর ইমেইল</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@gmail.com" />
          </div>
          <div className="space-y-1.5">
            <Label>কোর্স</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger><SelectValue placeholder="কোর্স বেছে নিন" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>মেয়াদ <span className="text-muted-foreground text-xs">(খালি রাখলে আজীবন)</span></Label>
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={enroll.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            {enroll.isPending ? "অ্যাসাইন হচ্ছে..." : "অ্যাসাইন করুন"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminStudents() {
  const { data: students = [], isLoading, error, refetch } = useStudents();
  const deleteStudent = useDeleteStudent();
  const resetPassword = useResetStudentPassword();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "student">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      (s.full_name ?? "").toLowerCase().includes(q) ||
      (s.phone ?? "").includes(q) ||
      (s.email ?? "").toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q);
    const matchRole = filterRole === "all" || s.role === filterRole;
    return matchSearch && matchRole;
  });

  const counts = {
    all:     students.length,
    student: students.filter((s) => s.role === "student").length,
    admin:   students.filter((s) => s.role === "admin").length,
  };

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteStudent.mutateAsync(deleteId);
      toast.success("ব্যবহারকারী মুছে ফেলা হয়েছে");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "মুছতে সমস্যা হয়েছে");
    } finally {
      setDeleteId(null);
    }
  }

  async function handleResetPassword(userId: string, name: string | null) {
    try {
      await resetPassword.mutateAsync(userId);
      toast.success(`${name ?? "ব্যবহারকারী"}-কে পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে`);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "রিসেট ব্যর্থ হয়েছে");
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">শিক্ষার্থী</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">মোট {students.length} জন নিবন্ধিত</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> রিফ্রেশ
          </Button>
          <CreateStudentDialog />
          <QuickEnrollDialog />
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="নাম, ফোন বা ইমেইল..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "student", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filterRole === r
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              ].join(" ")}
            >
              {r === "all" ? "সব" : r === "admin" ? "অ্যাডমিন" : "শিক্ষার্থী"}{" "}
              <span className="opacity-70">({counts[r]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Student list */}
      <div className="rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">লোড হচ্ছে...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm font-medium text-destructive">ডেটা লোড হয়নি</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Supabase profiles টেবিলের RLS policy চেক করুন।
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>আবার চেষ্টা করুন</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="mb-3 h-10 w-10 opacity-20" />
            <p className="text-sm">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="divide-y divide-border bg-card">
            {filtered.map((s) => (
              <div key={s.id}>
                {/* Row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => toggleExpand(s.id)}
                >
                  <span className="shrink-0 text-muted-foreground">
                    {expanded === s.id
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />}
                  </span>

                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={s.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-accent/10 text-sm font-semibold text-accent">
                      {(s.full_name ?? "?")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.full_name ?? <span className="italic text-muted-foreground">নাম নেই</span>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{s.email ?? "—"}</p>
                  </div>

                  <div className="hidden md:block text-xs text-muted-foreground shrink-0 w-28 truncate">
                    {s.phone ?? "—"}
                  </div>

                  <div className="shrink-0">
                    {s.role === "admin" ? (
                      <Badge className="gap-1 bg-accent/10 text-accent border-0 text-[10px]">
                        <ShieldCheck className="h-3 w-3" /> অ্যাডমিন
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <GraduationCap className="h-3 w-3" /> শিক্ষার্থী
                      </Badge>
                    )}
                  </div>

                  {/* Actions — stop propagation so clicks don't toggle expand */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      title="পাসওয়ার্ড রিসেট"
                      disabled={resetPassword.isPending}
                      onClick={() => handleResetPassword(s.id, s.full_name)}
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      title="মুছুন"
                      onClick={() => setDeleteId(s.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Enrollment panel */}
                {expanded === s.id && <EnrollmentPanel userId={s.id} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ব্যবহারকারী মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই ব্যবহারকারীর অ্যাকাউন্ট এবং সমস্ত ডেটা স্থায়ীভাবে মুছে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteStudent.isPending}
            >
              {deleteStudent.isPending ? "মুছছে..." : "স্থায়ীভাবে মুছুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
