import { useState } from "react";
import { ShieldCheck, Plus, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAdminList, useManageAdmin } from "@/hooks/useAdminManagement";

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "আজ";
  if (days < 30) return `${days} দিন আগে`;
  if (days < 365) return `${Math.floor(days / 30)} মাস আগে`;
  return `${Math.floor(days / 365)} বছর আগে`;
}

export default function AdminManagement() {
  const { data: admins = [], isLoading } = useAdminList();
  const manage = useManageAdmin();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [demoteTarget, setDemoteTarget] = useState<{ id: string; email: string | null } | null>(null);

  async function handlePromote() {
    if (!email.trim()) { toast.error("ইমেইল লিখুন।"); return; }
    try {
      await manage.mutateAsync({ action: "promote", targetEmail: email.trim() });
      toast.success(`${email.trim()} কে অ্যাডমিন করা হয়েছে।`);
      setEmail("");
      setSheetOpen(false);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে।");
    }
  }

  async function handleDemote() {
    if (!demoteTarget) return;
    const targetEmail = demoteTarget.email;
    if (!targetEmail) { toast.error("এই অ্যাডমিনের ইমেইল পাওয়া যায়নি।"); setDemoteTarget(null); return; }
    try {
      await manage.mutateAsync({ action: "demote", targetEmail });
      toast.success("অ্যাডমিন সরানো হয়েছে।");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে।");
    } finally {
      setDemoteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">অ্যাডমিন ম্যানেজমেন্ট</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              শুধুমাত্র সুপারঅ্যাডমিন এই পেজ দেখতে ও ব্যবহার করতে পারবেন
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => { setEmail(""); setSheetOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> নতুন অ্যাডমিন যোগ করুন
        </Button>
      </div>

      {/* Admins table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ShieldCheck className="mb-3 h-10 w-10 opacity-30" />
            <p>কোনো অ্যাডমিন নেই।</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {["নাম", "ইমেইল", "যোগ হয়েছে", "অ্যাকশন"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {admin.full_name || <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {admin.email ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {timeAgo(admin.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDemoteTarget({ id: admin.id, email: admin.email })}
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

      {/* Add Admin Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 py-5 border-b border-border">
            <SheetTitle className="font-heading text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              নতুন অ্যাডমিন যোগ করুন
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 px-6 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              ইমেইল দিন। ওই ইমেইলে নিবন্ধিত অ্যাকাউন্টটি অ্যাডমিন হয়ে যাবে।
              সুপারঅ্যাডমিন অ্যাকাউন্ট শুধু SQL দিয়ে তৈরি করা যাবে।
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">ইমেইল</label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePromote()}
                autoFocus
              />
            </div>
          </div>

          <div className="border-t border-border px-6 py-4">
            <Button
              className="w-full gap-2"
              onClick={handlePromote}
              disabled={manage.isPending || !email.trim()}
            >
              <ShieldCheck className="h-4 w-4" />
              {manage.isPending ? "যোগ করা হচ্ছে…" : "অ্যাডমিন হিসেবে যোগ করুন"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Remove Admin Confirm */}
      <AlertDialog open={!!demoteTarget} onOpenChange={(o) => !o && setDemoteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>অ্যাডমিন সরাবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{demoteTarget?.email}</span> এর অ্যাডমিন সুবিধা বাতিল হবে।
              পরবর্তী লগইনে তিনি সাধারণ শিক্ষার্থী হিসেবে গণ্য হবেন।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDemote}
              disabled={manage.isPending}
            >
              {manage.isPending ? "সরানো হচ্ছে…" : "অ্যাডমিন সরান"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
