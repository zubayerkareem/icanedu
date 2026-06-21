import { useState, useRef } from "react";
import {
  User, Mail, Monitor, Clock, Lock, Shield, CheckCircle2, Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  useStudentMetadata, useSaveStudentMetadata, type ServiceBranch,
} from "@/hooks/useStudentMetadata";

// ─── Device detection ─────────────────────────────────────────────────────────

function parseUserAgent(): { browser: string; os: string } {
  const ua = navigator.userAgent;

  let browser = "Unknown Browser";
  if (ua.includes("Edg"))            browser = "Microsoft Edge";
  else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";
  else if (ua.includes("Chrome"))    browser = "Chrome";
  else if (ua.includes("Firefox"))   browser = "Firefox";
  else if (ua.includes("Safari"))    browser = "Safari";

  let os = "Unknown OS";
  if (ua.includes("Windows NT"))     os = "Windows";
  else if (ua.includes("Android"))   os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Mac"))       os = "macOS";
  else if (ua.includes("Linux"))     os = "Linux";

  return { browser, os };
}

// ─── Branch labels ────────────────────────────────────────────────────────────

const BRANCH_LABELS: Record<ServiceBranch, string> = {
  army:   "সেনাবাহিনী (Army)",
  navy:   "নৌবাহিনী (Navy)",
  others: "অন্যান্য",
};

// ─── Profile info row ─────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Locked field ─────────────────────────────────────────────────────────────

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
        <span className="flex-1 text-sm font-medium text-foreground">{value}</span>
        <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { data: meta, isLoading } = useStudentMetadata(user?.id);
  const save = useSaveStudentMetadata();

  const [issbId, setIssbId] = useState("");
  const [branch, setBranch] = useState<ServiceBranch | "">("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("ছবির সাইজ ২ মেগাবাইটের বেশি হওয়া যাবে না");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("শুধুমাত্র ছবি ফাইল আপলোড করুন");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      if (updateError) throw updateError;

      await refreshProfile();
      toast.success("প্রোফাইল ছবি আপডেট হয়েছে");
    } catch {
      toast.error("ছবি আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const { browser, os } = parseUserAgent();
  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })
    : "—";

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "—";

  async function handleSave() {
    if (!user) return;
    if (!issbId.trim()) { toast.error("আইডি লিখুন"); return; }
    if (!branch) { toast.error("শাখা নির্বাচন করুন"); return; }
    try {
      await save.mutateAsync({ user_id: user.id, issb_id: issbId.trim(), service_branch: branch });
      toast.success("তথ্য সংরক্ষিত হয়েছে");
    } catch {
      toast.error("সংরক্ষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }
  }

  const metaSet = !!meta;

  return (
    <div className="max-w-xl space-y-6 mx-auto">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">আমার প্রোফাইল</h1>
        <p className="mt-1 text-sm text-muted-foreground">আপনার অ্যাকাউন্টের তথ্য</p>
      </div>

      {/* Avatar upload */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">প্রোফাইল ছবি</p>
        <div className="flex flex-col items-center gap-4">
          <div className="group relative">
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-muted flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-muted-foreground/40" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
              aria-label="ছবি পরিবর্তন করুন"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />

          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? "আপলোড হচ্ছে..."
                : profile?.avatar_url
                ? "ছবি পরিবর্তন করুন"
                : "ছবি আপলোড করুন"}
            </Button>
            <p className="mt-1.5 text-[11px] text-muted-foreground">JPG, PNG বা WebP · সর্বোচ্চ ২ MB</p>
          </div>
        </div>
      </div>

      {/* Account info — view only */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">অ্যাকাউন্ট তথ্য</p>
        <InfoRow icon={User}    label="নাম"          value={displayName} />
        <InfoRow icon={Mail}    label="ইমেইল"        value={user?.email ?? "—"} />
        <InfoRow icon={Clock}   label="শেষ লগইন"     value={lastSignIn} />
        <InfoRow icon={Monitor} label="বর্তমান ডিভাইস" value={`${browser} · ${os}`} />
      </div>

      {/* ISSB identity — one-time */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-accent" />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ISSB পরিচয়</p>
          {metaSet && (
            <Badge className="ml-auto bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 gap-1 text-[10px]">
              <CheckCircle2 className="h-3 w-3" /> সংরক্ষিত
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 rounded-md bg-muted" />
            <div className="h-8 rounded-md bg-muted" />
          </div>
        ) : metaSet ? (
          // Already set — read-only
          <div className="space-y-3">
            <LockedField label="ISSB / ক্যান্ডিডেট আইডি" value={meta!.issb_id ?? "—"} />
            <LockedField label="শাখা / সার্ভিস" value={meta!.service_branch ? BRANCH_LABELS[meta!.service_branch] : "—"} />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              এই তথ্য একবার সেট হয়ে গেলে পরিবর্তন করা যাবে না।
            </p>
          </div>
        ) : (
          // Not set yet — show form
          <div className="space-y-4">
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-800 px-3 py-2">
              এই তথ্য একবারই সেট করা যাবে এবং পরে পরিবর্তন করা সম্ভব হবে না।
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="issb-id" className="text-sm">ISSB / ক্যান্ডিডেট আইডি</Label>
              <Input
                id="issb-id"
                value={issbId}
                onChange={(e) => setIssbId(e.target.value)}
                placeholder="যেমন: BD-12345"
                maxLength={30}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="branch" className="text-sm">শাখা / সার্ভিস</Label>
              <Select value={branch} onValueChange={(v) => setBranch(v as ServiceBranch)}>
                <SelectTrigger id="branch">
                  <SelectValue placeholder="শাখা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="army">সেনাবাহিনী (Army)</SelectItem>
                  <SelectItem value="navy">নৌবাহিনী (Navy)</SelectItem>
                  <SelectItem value="others">অন্যান্য</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} disabled={save.isPending} className="w-full">
              {save.isPending ? "সংরক্ষণ হচ্ছে..." : "তথ্য সংরক্ষণ করুন"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
