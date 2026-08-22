import { useState, useEffect } from "react";
import { Link2, Save, CheckCircle2, MessageCircle, Facebook, Smartphone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";

const FIELDS = [
  {
    key: "whatsapp_number",
    label: "WhatsApp নম্বর",
    placeholder: "01XXXXXXXXX",
    hint: "বাংলাদেশের নম্বর — শুধু ডিজিট, যেমন: 01642571744",
    icon: MessageCircle,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600",
  },
  {
    key: "facebook_group_url",
    label: "Facebook গ্রুপ লিংক",
    placeholder: "https://facebook.com/groups/...",
    hint: "Facebook গ্রুপ বা পেজের পূর্ণ URL",
    icon: Facebook,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
  },
  {
    key: "playstore_url",
    label: "Play Store লিংক",
    placeholder: "https://play.google.com/store/apps/details?id=...",
    hint: "Android অ্যাপের Google Play Store লিংক",
    icon: Smartphone,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600",
  },
  {
    key: "appstore_url",
    label: "App Store লিংক",
    placeholder: "https://apps.apple.com/app/...",
    hint: "iOS অ্যাপের Apple App Store লিংক",
    icon: Smartphone,
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600",
  },
] as const;

type SettingKey = (typeof FIELDS)[number]["key"];

const FB_GROUP_SLOTS = [
  { titleKey: "fb_group_1_title", urlKey: "fb_group_1_url", label: "ফেসবুক গ্রুপ ১" },
  { titleKey: "fb_group_2_title", urlKey: "fb_group_2_url", label: "ফেসবুক গ্রুপ ২" },
] as const;

function FacebookGroupSlot({ titleKey, urlKey, label }: { titleKey: string; urlKey: string; label: string }) {
  const { data: settings = [], isLoading } = useSiteSettings();
  const update = useUpdateSetting();
  const find = (key: string) => settings.find((s) => s.key === key)?.value ?? "";

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTitle(find(titleKey));
    setUrl(find(urlKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  async function handleSave() {
    try {
      await Promise.all([
        update.mutateAsync({ key: titleKey, value: title.trim() }),
        update.mutateAsync({ key: urlKey, value: url.trim() }),
      ]);
      toast.success("সংরক্ষিত হয়েছে");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Facebook className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{label}</h2>
          <p className="text-xs text-muted-foreground">ফুটারে দেখানো ফেসবুক গ্রুপ উইজেট</p>
        </div>
        {url && (
          <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> সেট করা আছে
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="h-20 animate-pulse rounded-md bg-muted" />
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">টাইটেল</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: Helpline Group" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">লিংক</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://facebook.com/groups/..." />
          </div>
          <Button size="sm" onClick={handleSave} disabled={update.isPending} className="gap-2">
            {saved ? (
              <><CheckCircle2 className="h-4 w-4" /> সেভ হয়েছে</>
            ) : (
              <><Save className="h-4 w-4" /> সেভ করুন</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Support WhatsApp Chat Widget ────────────────────────────────────────────

interface SupportWa {
  title: string;
  number: string;
  icon: string;
}

const SUPPORT_WA_KEY = "support_whatsapp_contacts";

function SupportWhatsAppSection() {
  const { data: settings = [], isLoading } = useSiteSettings();
  const update = useUpdateSetting();
  const [contacts, setContacts] = useState<SupportWa[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = settings.find((s) => s.key === SUPPORT_WA_KEY)?.value;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setContacts(parsed as SupportWa[]);
      } catch { /* ignore malformed */ }
    }
  }, [settings]);

  function addContact() {
    setContacts((p) => [...p, { title: "", number: "", icon: "💬" }]);
  }
  function removeContact(i: number) {
    setContacts((p) => p.filter((_, j) => j !== i));
  }
  function patch(i: number, field: keyof SupportWa, value: string) {
    setContacts((p) => p.map((c, j) => (j === i ? { ...c, [field]: value } : c)));
  }

  async function handleSave() {
    const cleaned = contacts.filter((c) => c.title.trim() && c.number.trim());
    try {
      await update.mutateAsync({ key: SUPPORT_WA_KEY, value: JSON.stringify(cleaned) });
      toast.success("সেভ হয়েছে");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">সাপোর্ট চ্যাট উইজেট</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            ওয়েবসাইটের নিচে ডানে ফ্লোটিং বাটন — ক্লিক করলে সব WhatsApp দেখাবে
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={addContact} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> WhatsApp যোগ করুন
        </Button>
      </div>

      {isLoading ? (
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          <MessageCircle className="mx-auto mb-2 h-9 w-9 opacity-25" />
          <p className="text-sm">কোনো WhatsApp যোগ করা হয়নি।</p>
          <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={addContact}>
            <Plus className="h-4 w-4" /> প্রথম WhatsApp যোগ করুন
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((c, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="text-xl">{c.icon || "💬"}</span>
                  WhatsApp {i + 1}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeContact(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[90px_1fr_1fr]">
                <div className="space-y-1.5">
                  <Label className="text-xs">আইকন (ইমোজি)</Label>
                  <Input
                    value={c.icon}
                    onChange={(e) => patch(i, "icon", e.target.value)}
                    placeholder="💬"
                    className="text-center text-lg px-2"
                    maxLength={4}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">টাইটেল *</Label>
                  <Input
                    value={c.title}
                    onChange={(e) => patch(i, "title", e.target.value)}
                    placeholder="যেমন: কোর্স সাপোর্ট"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">WhatsApp নম্বর *</Label>
                  <Input
                    value={c.number}
                    onChange={(e) => patch(i, "number", e.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={handleSave} disabled={update.isPending} className="gap-2">
              {saved ? (
                <><CheckCircle2 className="h-4 w-4" /> সেভ হয়েছে</>
              ) : (
                <><Save className="h-4 w-4" /> সেভ করুন</>
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={addContact} className="gap-2">
              <Plus className="h-4 w-4" /> আরও যোগ করুন
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FooterFacebookGroups() {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-semibold text-foreground">ফুটার ফেসবুক গ্রুপ</h2>
      {FB_GROUP_SLOTS.map((slot) => (
        <FacebookGroupSlot key={slot.titleKey} {...slot} />
      ))}
    </div>
  );
}

export default function ContactLinks() {
  const { data: settings = [], isLoading } = useSiteSettings();
  const update = useUpdateSetting();

  const [values, setValues] = useState<Record<SettingKey, string>>({
    whatsapp_number: "",
    facebook_group_url: "",
    playstore_url: "",
    appstore_url: "",
  });
  const [saved, setSaved] = useState<Record<SettingKey, boolean>>({
    whatsapp_number: false,
    facebook_group_url: false,
    playstore_url: false,
    appstore_url: false,
  });

  useEffect(() => {
    const find = (key: string) => settings.find((s) => s.key === key)?.value ?? "";
    setValues({
      whatsapp_number: find("whatsapp_number"),
      facebook_group_url: find("facebook_group_url"),
      playstore_url: find("playstore_url"),
      appstore_url: find("appstore_url"),
    });
  }, [settings]);

  async function handleSave(key: SettingKey) {
    try {
      await update.mutateAsync({ key, value: values[key].trim() });
      toast.success("সংরক্ষিত হয়েছে");
      setSaved((p) => ({ ...p, [key]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [key]: false })), 3000);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "সমস্যা হয়েছে");
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">সোশ্যাল লিংক</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ফ্রন্টেন্ডের ফ্লোটিং বার ও অ্যাপ লিংকগুলো এখান থেকে নিয়ন্ত্রণ করুন
        </p>
      </div>

      {/* Support WhatsApp chat widget — appears at top since it's the main feature */}
      <div className="rounded-xl border border-border bg-card p-6">
        <SupportWhatsAppSection />
      </div>

      <FooterFacebookGroups />

      {FIELDS.map((field) => {
        const Icon = field.icon;
        const currentVal = values[field.key];
        const isSaved = saved[field.key];

        return (
          <div key={field.key} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${field.iconBg}`}>
                <Icon className={`h-5 w-5 ${field.iconColor}`} />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{field.label}</h2>
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              </div>
              {currentVal && (
                <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> সেট করা আছে
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="h-10 animate-pulse rounded-md bg-muted" />
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{field.label}</Label>
                  <Input
                    value={currentVal}
                    onChange={(e) =>
                      setValues((p) => ({ ...p, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSave(field.key)}
                  disabled={update.isPending}
                  className="gap-2"
                >
                  {isSaved ? (
                    <><CheckCircle2 className="h-4 w-4" /> সেভ হয়েছে</>
                  ) : (
                    <><Save className="h-4 w-4" /> সেভ করুন</>
                  )}
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {/* Preview note */}
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground flex items-start gap-2">
        <Link2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          খালি রাখলে সেই বাটনটি ফ্রন্টেন্ডে দেখাবে না। WhatsApp নম্বর দিলে নিচের ডানে সবুজ বাটন দেখাবে।
        </span>
      </div>
    </div>
  );
}
