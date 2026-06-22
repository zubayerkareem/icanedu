import { useState, useEffect } from "react";
import { BarChart3, Save, CheckCircle2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";

export default function AdminSettings() {
  const { data: settings = [], isLoading } = useSiteSettings();
  const update = useUpdateSetting();

  const [gaId, setGaId] = useState("");
  const [gaSaved, setGaSaved] = useState(false);

  const [metaPixelId, setMetaPixelId] = useState("");
  const [metaSaved, setMetaSaved] = useState(false);

  useEffect(() => {
    setGaId(settings.find((s) => s.key === "ga_measurement_id")?.value ?? "");
    setMetaPixelId(settings.find((s) => s.key === "meta_pixel_id")?.value ?? "");
  }, [settings]);

  async function handleSaveGA() {
    try {
      await update.mutateAsync({ key: "ga_measurement_id", value: gaId.trim() });
      toast.success("Google Analytics ID সেভ হয়েছে");
      setGaSaved(true);
      setTimeout(() => setGaSaved(false), 3000);
    } catch (e: unknown) {
      toast.error((e as Error)?.message);
    }
  }

  async function handleSaveMeta() {
    try {
      await update.mutateAsync({ key: "meta_pixel_id", value: metaPixelId.trim() });
      toast.success("Meta Pixel ID সেভ হয়েছে");
      setMetaSaved(true);
      setTimeout(() => setMetaSaved(false), 3000);
    } catch (e: unknown) {
      toast.error((e as Error)?.message);
    }
  }

  // Keep old alias so existing JSX (saved → gaSaved) compiles
  const saved = gaSaved;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">সেটিংস</h1>
        <p className="mt-1 text-sm text-muted-foreground">সাইটের কনফিগারেশন ও ইন্টিগ্রেশন</p>
      </div>

      {/* Google Analytics */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <BarChart3 className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Google Analytics</h2>
            <p className="text-xs text-muted-foreground">সাইটের ট্র্যাফিক ও ব্যবহারকারী বিশ্লেষণ</p>
          </div>
          {gaId && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> সক্রিয়
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="h-10 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Measurement ID</Label>
              <Input
                placeholder="G-XXXXXXXXXX"
                value={gaId}
                onChange={(e) => { setGaId(e.target.value); setSaved(false); }}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Google Analytics → Admin → Data Streams → Measurement ID
              </p>
            </div>

            <Button onClick={handleSaveGA} disabled={update.isPending} className="gap-2">
              {saved ? (
                <><CheckCircle2 className="h-4 w-4" /> সেভ হয়েছে</>
              ) : (
                <><Save className="h-4 w-4" /> সেভ করুন</>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Meta Pixel / CAPI */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Share2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Meta Pixel &amp; CAPI</h2>
            <p className="text-xs text-muted-foreground">Facebook/Instagram বিজ্ঞাপন ট্র্যাকিং</p>
          </div>
          {metaPixelId && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> সক্রিয়
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="h-10 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Pixel ID</Label>
              <Input
                placeholder="1234567890123456"
                value={metaPixelId}
                onChange={(e) => { setMetaPixelId(e.target.value); setMetaSaved(false); }}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Meta Business Suite → Events Manager → Pixel → Settings → Pixel ID
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <p className="font-semibold">Server-side CAPI Token (গোপন)</p>
              <p>
                CAPI Access Token গোপন রাখতে Vercel Dashboard → Settings → Environment Variables-এ
                <span className="font-mono font-semibold"> META_CAPI_TOKEN</span> নামে যোগ করুন।
              </p>
              <p className="opacity-70">
                Meta Events Manager → Pixel → Settings → Conversions API → Generate Access Token
              </p>
            </div>

            <Button onClick={handleSaveMeta} disabled={update.isPending} className="gap-2">
              {metaSaved ? (
                <><CheckCircle2 className="h-4 w-4" /> সেভ হয়েছে</>
              ) : (
                <><Save className="h-4 w-4" /> সেভ করুন</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
