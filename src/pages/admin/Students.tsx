import { useState, useRef } from "react";
import type { DateRange } from "react-day-picker";
import {
  Users, Search, RefreshCw, ShieldCheck, GraduationCap, Trash2,
  KeyRound, BookOpen, ChevronDown, ChevronRight, Plus, Ban,
  CalendarDays, UserPlus, Save, Eye, EyeOff, X, Upload, FileText,
  CheckCircle2, XCircle, BookOpenCheck,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataPagination } from "@/components/ui/data-pagination";
import { format } from "date-fns";

const PAGE_SIZE = 20;
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
  useAdminDirectEnroll,
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
  const enroll = useAdminDirectEnroll();
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
      await enroll.mutateAsync({ userId, courseId: course.id, courseName: course.title, validUntil: validUntil || null });
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

// ─── CSV Import dialog ─────────────────────────────────────────────────────────

type ImportRow = { full_name: string; email: string; phone: string; password: string; course_id: string; valid_until: string };
type ImportResult = { email: string; success: boolean; error?: string; emailSent?: boolean };

function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: any = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row as ImportRow;
  });
}

function CSVImportDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [csvText, setCsvText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      setRows(parseCSV(text));
      setResults(null);
    };
    reader.readAsText(file);
  }

  function handleTextChange(text: string) {
    setCsvText(text);
    setRows(parseCSV(text));
    setResults(null);
  }

  async function handleImport() {
    if (rows.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/import-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const json = await res.json();
      setResults(json.results ?? []);
      onDone();
      toast.success(`${json.created} জন তৈরি হয়েছে, ${json.emailsSent} টি ইমেইল গেছে`);
    } catch (e: unknown) {
      toast.error("Import failed: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose(o: boolean) {
    if (!o) { setRows([]); setResults(null); setCsvText(""); }
    setOpen(o);
  }

  const created = results?.filter((r) => r.success).length ?? 0;
  const failed = results?.filter((r) => !r.success).length ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="mr-2 h-4 w-4" /> CSV Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CSV থেকে শিক্ষার্থী Import করুন</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Format hint */}
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> CSV ফরম্যাট (প্রথম লাইন header):</p>
            <code className="block text-[11px] bg-background rounded px-2 py-1 border">
              full_name,email,phone,password,course_id,valid_until
            </code>
            <p>course_id ও valid_until (YYYY-MM-DD) অপশনাল — খালি রাখা যাবে।</p>
          </div>

          {/* File upload */}
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">CSV ফাইল drag করুন বা click করে বেছে নিন</p>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {/* Or paste */}
          <div className="space-y-1.5">
            <Label className="text-xs">অথবা সরাসরি paste করুন</Label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={"full_name,email,phone,password\nAhmed Ali,ahmed@gmail.com,01700000000,pass123"}
              value={csvText}
              onChange={(e) => handleTextChange(e.target.value)}
            />
          </div>

          {/* Preview */}
          {rows.length > 0 && !results && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{rows.length} টি রো পাওয়া গেছে — প্রিভিউ:</p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      {["নাম", "ইমেইল", "ফোন", "পাসওয়ার্ড", "Course ID", "Valid Until"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.slice(0, 5).map((r, i) => (
                      <tr key={i} className="bg-card">
                        <td className="px-3 py-1.5 truncate max-w-[120px]">{r.full_name || "—"}</td>
                        <td className="px-3 py-1.5 truncate max-w-[160px]">{r.email}</td>
                        <td className="px-3 py-1.5">{r.phone || "—"}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{"•".repeat(Math.min(r.password.length, 8))}</td>
                        <td className="px-3 py-1.5 truncate max-w-[100px] text-muted-foreground">{r.course_id || "—"}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{r.valid_until || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 5 && (
                  <p className="px-3 py-1.5 text-xs text-muted-foreground bg-muted/30">...আরও {rows.length - 5} টি রো</p>
                )}
              </div>
              <Button className="w-full" onClick={handleImport} disabled={loading}>
                <Upload className="mr-2 h-4 w-4" />
                {loading ? `Import হচ্ছে...` : `${rows.length} জন Import করুন ও ইমেইল পাঠান`}
              </Button>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{created}</p>
                  <p className="text-xs text-green-600">তৈরি হয়েছে</p>
                </div>
                <div className="flex-1 rounded-lg bg-red-50 border border-red-200 p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">{failed}</p>
                  <p className="text-xs text-red-600">ব্যর্থ</p>
                </div>
                <div className="flex-1 rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{results.filter((r) => r.emailSent).length}</p>
                  <p className="text-xs text-blue-600">ইমেইল গেছে</p>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                    {r.success
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      : <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                    <span className="truncate text-muted-foreground">{r.email}</span>
                    {!r.success && <span className="text-red-500 shrink-0">{r.error}</span>}
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setRows([]); setResults(null); setCsvText(""); }}>
                নতুন Import করুন
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
  const { data: students = [] } = useStudents();
  const enroll = useAdminDirectEnroll();
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [validUntil, setValidUntil] = useState("");

  async function handleSubmit() {
    if (!studentId) { toast.error("শিক্ষার্থী বেছে নিন"); return; }
    const course = courses.find((c) => c.id === courseId);
    if (!course) { toast.error("কোর্স বেছে নিন"); return; }
    const student = students.find((s) => s.id === studentId);
    try {
      await enroll.mutateAsync({ userId: studentId, courseId: course.id, courseName: course.title, validUntil: validUntil || null });
      toast.success(`${student?.full_name ?? student?.email ?? "শিক্ষার্থী"} — কোর্স অ্যাসাইন হয়েছে`);
      setStudentId(""); setCourseId(""); setValidUntil(""); setOpen(false);
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
            <Label>শিক্ষার্থী</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue placeholder="শিক্ষার্থী বেছে নিন" /></SelectTrigger>
              <SelectContent>
                {students.filter((s) => s.role === "student").map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name ? `${s.full_name} (${s.email ?? "—"})` : (s.email ?? s.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

// ─── Bulk assign dialog ────────────────────────────────────────────────────────

function BulkAssignDialog({ selectedIds, onDone }: { selectedIds: string[]; onDone: () => void }) {
  const { data: courses = [] } = useAllCoursesForSelect();
  const enroll = useAdminDirectEnroll();
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  async function handleAssign() {
    const course = courses.find((c) => c.id === courseId);
    if (!course) { toast.error("কোর্স বেছে নিন"); return; }
    setProgress({ done: 0, total: selectedIds.length });
    let ok = 0; let fail = 0;
    for (const userId of selectedIds) {
      try {
        await enroll.mutateAsync({ userId, courseId: course.id, courseName: course.title, validUntil: validUntil || null });
        ok++;
      } catch { fail++; }
      setProgress({ done: ok + fail, total: selectedIds.length });
    }
    toast.success(`${ok} জনকে কোর্স দেওয়া হয়েছে${fail ? `, ${fail} টি ব্যর্থ` : ""}`);
    setProgress(null); setCourseId(""); setValidUntil(""); setOpen(false); onDone();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!progress) setOpen(o); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <BookOpenCheck className="mr-2 h-4 w-4" /> কোর্স অ্যাসাইন
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{selectedIds.length} জনকে কোর্স অ্যাসাইন করুন</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>কোর্স</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger><SelectValue placeholder="কোর্স বেছে নিন" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>মেয়াদ <span className="text-muted-foreground text-xs">(খালি = আজীবন)</span></Label>
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          {progress && (
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground text-center">{progress.done} / {progress.total}</p>
            </div>
          )}
          <Button className="w-full" onClick={handleAssign} disabled={!courseId || !!progress}>
            <BookOpenCheck className="mr-2 h-4 w-4" />
            {progress ? "অ্যাসাইন হচ্ছে..." : "অ্যাসাইন করুন"}
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
  const [filterSource, setFilterSource] = useState<"all" | "registered" | "admin_created">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [page, setPage] = useState(1);
  // Reset page when filters change
  const resetPage = () => setPage(1);

  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      (s.full_name ?? "").toLowerCase().includes(q) ||
      (s.phone ?? "").includes(q) ||
      (s.email ?? "").toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q);
    const matchRole = filterRole === "all" || s.role === filterRole;
    const matchSource =
      filterSource === "all" ||
      (filterSource === "registered" && (s.source === "registered" || s.source === null)) ||
      (filterSource === "admin_created" && s.source === "admin_created");

    let matchDate = true;
    if (s.created_at && (dateRange?.from || dateRange?.to)) {
      const created = new Date(s.created_at);
      if (dateRange.from) {
        const from = new Date(dateRange.from); from.setHours(0, 0, 0, 0);
        if (created < from) matchDate = false;
      }
      if (dateRange.to) {
        const to = new Date(dateRange.to); to.setHours(23, 59, 59, 999);
        if (created > to) matchDate = false;
      }
    }

    return matchSearch && matchRole && matchSource && matchDate;
  });

  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds((prev) => { const next = new Set(prev); filtered.forEach((s) => next.delete(s.id)); return next; });
    } else {
      setSelectedIds((prev) => { const next = new Set(prev); filtered.forEach((s) => next.add(s.id)); return next; });
    }
  }

  async function handleBulkResetPassword() {
    const ids = [...selectedIds];
    let ok = 0; let fail = 0;
    for (const id of ids) {
      try { await resetPassword.mutateAsync(id); ok++; } catch { fail++; }
    }
    toast.success(`${ok} জনকে রিসেট ইমেইল পাঠানো হয়েছে${fail ? `, ${fail} টি ব্যর্থ` : ""}`);
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    const ids = [...selectedIds];
    let ok = 0; let fail = 0;
    for (const id of ids) {
      try { await deleteStudent.mutateAsync(id); ok++; } catch { fail++; }
    }
    toast.success(`${ok} জন মুছে ফেলা হয়েছে${fail ? `, ${fail} টি ব্যর্থ` : ""}`);
    setSelectedIds(new Set()); setBulkDeleting(false); setBulkDeleteConfirm(false);
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
          <CSVImportDialog onDone={() => refetch()} />
          <CreateStudentDialog />
          <QuickEnrollDialog />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        {/* Row 1: search + date range */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="নাম, ফোন বা ইমেইল..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="pl-9"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-[190px] justify-start gap-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                {dateRange?.from ? (
                  dateRange.to
                    ? <span>{format(dateRange.from, "dd MMM")} – {format(dateRange.to, "dd MMM yy")}</span>
                    : <span>{format(dateRange.from, "dd MMM yyyy")}</span>
                ) : (
                  <span className="text-muted-foreground">Select Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
          {dateRange?.from && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setDateRange(undefined)}>
              <X className="mr-1 h-3.5 w-3.5" /> Clear Date
            </Button>
          )}
        </div>

        {/* Row 2: role + source filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-1.5">
            {(["all", "student", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => { setFilterRole(r); resetPage(); }}
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
          <div className="h-4 w-px bg-border" />
          <div className="flex gap-1.5">
            {([
              { value: "all", label: "All Users" },
              { value: "registered", label: "Registered" },
              { value: "admin_created", label: "Admin Created" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setFilterSource(opt.value); resetPage(); }}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filterSource === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedIds.size} জন নির্বাচিত</span>
          <div className="flex items-center gap-2 ml-auto">
            <BulkAssignDialog selectedIds={[...selectedIds]} onDone={() => setSelectedIds(new Set())} />
            <Button size="sm" variant="outline" onClick={handleBulkResetPassword} disabled={resetPassword.isPending}>
              <KeyRound className="mr-2 h-4 w-4" /> পাসওয়ার্ড রিসেট
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setBulkDeleteConfirm(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> মুছুন
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
            {/* Select-all header */}
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 border-b border-border">
              <Checkbox
                checked={allFilteredSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="সব নির্বাচন করুন"
              />
              <span className="text-xs text-muted-foreground">সব নির্বাচন ({filtered.length})</span>
            </div>
            {paginated.map((s) => (
              <div key={s.id}>
                {/* Row */}
                <div
                  className={["flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/30", selectedIds.has(s.id) ? "bg-primary/5" : ""].join(" ")}
                  onClick={() => toggleExpand(s.id)}
                >
                  {/* Checkbox — stop expand on click */}
                  <div onClick={(e) => { e.stopPropagation(); toggleSelect(s.id); }} className="shrink-0">
                    <Checkbox checked={selectedIds.has(s.id)} />
                  </div>

                  <span className="shrink-0 text-muted-foreground">
                    {expanded === s.id
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />}
                  </span>

                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={s.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-accent/10 text-sm font-semibold text-accent">
                      {(s.full_name?.trim() || "?")[0].toUpperCase()}
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

      <DataPagination page={safePage} total={filtered.length} pageSize={PAGE_SIZE} onChange={(p) => { setPage(p); setExpanded(null); }} />

      {/* Bulk delete confirmation */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={(o) => !o && setBulkDeleteConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedIds.size} জনকে মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই ব্যবহারকারীদের অ্যাকাউন্ট এবং সমস্ত ডেটা স্থায়ীভাবে মুছে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? "মুছছে..." : "স্থায়ীভাবে মুছুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
