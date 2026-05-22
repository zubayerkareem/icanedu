import { useState } from "react";
import { Users, Search, RefreshCw, ShieldCheck, GraduationCap, Trash2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useStudents, useDeleteStudent, useResetStudentPassword } from "@/hooks/useStudents";

export default function AdminStudents() {
  const { data: students = [], isLoading, error, refetch } = useStudents();
  const deleteStudent = useDeleteStudent();
  const resetPassword = useResetStudentPassword();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "student">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">শিক্ষার্থী ও ব্যবহারকারী</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            মোট {students.length} জন নিবন্ধিত ব্যবহারকারী
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> রিফ্রেশ
        </Button>
      </div>

      {/* Role filter */}
      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", "student", "admin"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filterRole === r
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent/20",
            ].join(" ")}
          >
            {r === "all" ? "সব" : r === "admin" ? "অ্যাডমিন" : "শিক্ষার্থী"} ({counts[r]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mt-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="নাম, ফোন, ইমেইল বা ID দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-lg border border-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">লোড হচ্ছে...</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <p className="text-sm font-medium text-destructive">ডেটা লোড হয়নি</p>
            <p className="text-xs">
              Supabase-এ profiles টেবিলের RLS policy চেক করুন।{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[11px]">supabase_students_policy.sql</code>{" "}
              ফাইলটি রান করুন।
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-2">আবার চেষ্টা করুন</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="mb-3 h-10 w-10 opacity-30" />
            <p>কোনো ব্যবহারকারী পাওয়া যায়নি</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {["ব্যবহারকারী", "ইমেইল", "ফোন", "রোল", "অ্যাকশন"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={s.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-accent/10 text-sm font-semibold text-accent">
                          {(s.full_name ?? "?").slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {s.full_name ?? <span className="italic text-muted-foreground">নাম নেই</span>}
                        </p>
                        <code className="text-[11px] text-muted-foreground">{s.id.slice(0, 8)}…</code>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.email ?? <span className="italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.phone ?? <span className="italic">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {s.role === "admin" ? (
                      <Badge className="gap-1 bg-accent/10 text-accent">
                        <ShieldCheck className="h-3 w-3" /> অ্যাডমিন
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <GraduationCap className="h-3 w-3" /> শিক্ষার্থী
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="পাসওয়ার্ড রিসেট ইমেইল পাঠান"
                        disabled={resetPassword.isPending}
                        onClick={() => handleResetPassword(s.id, s.full_name)}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="ব্যবহারকারী মুছুন"
                        onClick={() => setDeleteId(s.id)}
                      >
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

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ব্যবহারকারী মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই ব্যবহারকারীর অ্যাকাউন্ট এবং সমস্ত ডেটা স্থায়ীভাবে মুছে যাবে। এই অ্যাকশন পূর্বাবস্থায় ফেরানো যাবে না।
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
