// Manual payment-reconciliation popup for a cadet enrollment with a due
// payment. Shows amount/due date + bKash instructions only — no checkout or
// order is created here; admin confirms the payment manually afterwards
// (see src/pages/admin/CadetPayments.tsx).
import { CheckCircle2, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSetting } from "@/hooks/useSiteSettings";
import { BKASH_NUMBER } from "@/lib/payments";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
    >
      {copied
        ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> কপি হয়েছে</>
        : <><Copy className="h-3.5 w-3.5" /> কপি করুন</>}
    </button>
  );
}

export function PaymentDueModal({
  open,
  onOpenChange,
  courseTitle,
  amount,
  dueDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  amount?: number;
  dueDate?: string | null;
}) {
  const whatsappNumber = useSetting("whatsapp_number");
  const waHref = whatsappNumber
    ? `https://wa.me/88${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        `আসসালামু আলাইকুম, আমি "${courseTitle}" কোর্সের পেমেন্ট পাঠিয়েছি, দয়া করে যাচাই করুন।`,
      )}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>পেমেন্ট বাকি আছে</DialogTitle>
          <DialogDescription>{courseTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">বকেয়া পরিমাণ</p>
              <p className="mt-0.5 font-heading text-xl font-bold text-foreground">
                {amount != null ? `৳${amount.toLocaleString("bn-BD")}` : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">শেষ তারিখ</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {dueDate
                  ? new Date(dueDate).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })
                  : "—"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border-2 border-[#E2136E]/30 bg-[#E2136E]/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E2136E] text-white font-bold text-xs">b</div>
              <span className="font-semibold text-foreground text-sm">bKash-এ পাঠান</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#E2136E]/30 bg-background px-4 py-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">bKash নম্বর</p>
                <p className="font-heading text-xl font-black text-foreground tracking-widest">{BKASH_NUMBER}</p>
              </div>
              <CopyButton text={BKASH_NUMBER} />
            </div>
            <p className="text-xs text-muted-foreground">
              টাকা পাঠানোর পর এডমিনকে জানান — যাচাই করে অ্যাকসেস আনলক করে দেওয়া হবে।
            </p>
          </div>

          {waHref && (
            <Button asChild variant="outline" className="w-full gap-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400">
              <a href={waHref} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp-এ জানান
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
