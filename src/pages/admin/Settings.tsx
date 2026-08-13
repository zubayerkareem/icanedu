import { useState, useEffect } from "react";
import { BarChart3, Save, CheckCircle2, Share2, Eye, EyeOff, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";

export default function AdminSettings() {
  const { data: settings = [], isLoading } = useSiteSettings();
  const update = useUpdateSetting();

  // ── Google Analytics ──────────────────────────────────────────
  const [gaId, setGaId] = useState("");
  const [gaSaved, setGaSaved] = useState(false);

  // ── Meta Pixel ────────────────────────────────────────────────
  const [metaPixelId, setMetaPixelId]     = useState("");
  const [metaToken,   setMetaToken]       = useState("");   // write-only — never pre-filled
  const [showToken,   setShowToken]       = useState(false);
  const [metaSaved,   setMetaSaved]       = useState(false);
  const [tokenIsSet,  setTokenIsSet]      = useState(false); // true if a token already exists in DB

  // ── Steadfast Courier ─────────────────────────────────────────
  const [sfApiKey,      setSfApiKey]      = useState("");
  const [sfSecretKey,   setSfSecretKey]   = useState("");
  const [showSfSecret,  setShowSfSecret]  = useState(false);
  const [sfApiSaved,    setSfApiSaved]    = useState(false);
  const [sfSecretSaved, setSfSecretSaved] = useState(false);

  useEffect(() => {
    setGaId(settings.find((s) => s.key === "ga_measurement_id")?.value ?? "");
    setMetaPixelId(settings.find((s) => s.key === "meta_pixel_id")?.value ?? "");
    // meta_capi_token is hidden from browser by RLS — presence is indicated by a separate flag
    const hasToken = settings.find((s) => s.key === "meta_capi_token_set")?.value === "1";
    setTokenIsSet(hasToken);
    setSfApiKey(settings.find((s) => s.key === "steadfast_api_key")?.value ?? "");
    // secret key is not pre-filled for security; a separate "set" flag could be added later
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
      // Always save pixel ID
      await update.mutateAsync({ key: "meta_pixel_id", value: metaPixelId.trim() });

      // Only save CAPI token if admin entered a new one
      if (metaToken.trim()) {
        await update.mutateAsync({ key: "meta_capi_token", value: metaToken.trim() });
        // Save a public flag so the UI knows a token exists (the actual token is RLS-hidden)
        await update.mutateAsync({ key: "meta_capi_token_set", value: "1" });
        setMetaToken("");
        setTokenIsSet(true);
      }

      toast.success("Meta সেটিংস সেভ হয়েছে");
      setMetaSaved(true);
      setTimeout(() => setMetaSaved(false), 3000);
    } catch (e: unknown) {
      toast.error((e as Error)?.message);
    }
  }

  async function handleSaveSfApiKey() {
    try {
      await update.mutateAsync({ key: "steadfast_api_key", value: sfApiKey.trim() });
      toast.success("Steadfast API Key সেভ হয়েছে");
      setSfApiSaved(true);
      setTimeout(() => setSfApiSaved(false), 3000);
    } catch (e: unknown) {
      toast.error((e as Error)?.message);
    }
  }

  async function handleSaveSfSecretKey() {
    if (!sfSecretKey.trim()) { toast.error("Secret Key খালি রাখা যাবে না"); return; }
    try {
      await update.mutateAsync({ key: "steadfast_secret_key", value: sfSecretKey.trim() });
      toast.success("Steadfast Secret Key সেভ হয়েছে");
      setSfSecretKey("");
      setSfSecretSaved(true);
      setTimeout(() => setSfSecretSaved(false), 3000);
    } catch (e: unknown) {
      toast.error((e as Error)?.message);
    }
  }

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
                onChange={(e) => { setGaId(e.target.value); setGaSaved(false); }}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Google Analytics → Admin → Data Streams → Measurement ID
              </p>
            </div>

            <Button onClick={handleSaveGA} disabled={update.isPending} className="gap-2">
              {gaSaved ? (
                <><CheckCircle2 className="h-4 w-4" /> সেভ হয়েছে</>
              ) : (
                <><Save className="h-4 w-4" /> সেভ করুন</>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Meta Pixel + CAPI */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Share2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Meta Pixel &amp; CAPI</h2>
            <p className="text-xs text-muted-foreground">Facebook/Instagram বিজ্ঞাপন ট্র্যাকিং (ব্রাউজার + সার্ভার)</p>
          </div>
          {metaPixelId && tokenIsSet && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> সক্রিয়
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pixel ID */}
            <div className="space-y-1.5">
              <Label>Pixel ID</Label>
              <Input
                placeholder="1234567890123456"
                value={metaPixelId}
                onChange={(e) => { setMetaPixelId(e.target.value); setMetaSaved(false); }}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Meta Events Manager → Pixel → Settings → Pixel ID
              </p>
            </div>

            {/* CAPI Token — write-only */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>CAPI Access Token</Label>
                {tokenIsSet && (
                  <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                    <CheckCircle2 className="h-3 w-3" /> সেট করা আছে
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder={tokenIsSet ? "নতুন token দিলে আপডেট হবে" : "Token paste করুন"}
                  value={metaToken}
                  onChange={(e) => { setMetaToken(e.target.value); setMetaSaved(false); }}
                  className="font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Meta Events Manager → Pixel → Settings → Conversions API → Generate Access Token
              </p>
              <p className="text-xs text-muted-foreground opacity-70">
                Token ডাটাবেজে সংরক্ষিত — ব্রাউজারে দেখা যায় না (RLS সুরক্ষিত)
              </p>
            </div>

            <Button
              onClick={handleSaveMeta}
              disabled={update.isPending}
              className="gap-2"
            >
              {metaSaved ? (
                <><CheckCircle2 className="h-4 w-4" /> সেভ হয়েছে</>
              ) : (
                <><Save className="h-4 w-4" /> সেভ করুন</>
              )}
            </Button>
          </div>
        )}
      </div>
      {/* Steadfast Courier */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <Truck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">কুরিয়ার সেটিংস (Steadfast)</h2>
            <p className="text-xs text-muted-foreground">পণ্য অর্ডার সরাসরি Steadfast-এ পাঠানোর জন্য API কী</p>
          </div>
          {sfApiKey && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> API Key সেট
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* API Key */}
            <div className="space-y-1.5">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Steadfast API Key"
                  value={sfApiKey}
                  onChange={(e) => { setSfApiKey(e.target.value); setSfApiSaved(false); }}
                  className="font-mono"
                />
                <Button onClick={handleSaveSfApiKey} disabled={update.isPending} className="shrink-0 gap-2">
                  {sfApiSaved ? <><CheckCircle2 className="h-4 w-4" /> সেভ</> : <><Save className="h-4 w-4" /> সেভ</>}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Steadfast Portal → Profile → API Credentials → Api-Key
              </p>
            </div>

            {/* Secret Key — write-only */}
            <div className="space-y-1.5">
              <Label>Secret Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showSfSecret ? "text" : "password"}
                    placeholder="নতুন Secret Key দিলে আপডেট হবে"
                    value={sfSecretKey}
                    onChange={(e) => { setSfSecretKey(e.target.value); setSfSecretSaved(false); }}
                    className="font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSfSecret((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showSfSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleSaveSfSecretKey} disabled={update.isPending} className="shrink-0 gap-2">
                  {sfSecretSaved ? <><CheckCircle2 className="h-4 w-4" /> সেভ</> : <><Save className="h-4 w-4" /> সেভ</>}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Steadfast Portal → Profile → API Credentials → Secret-Key
              </p>
              <p className="text-xs text-muted-foreground opacity-70">
                Secret Key ডাটাবেজে সুরক্ষিত — সংরক্ষণের পর আর দেখানো হয় না
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
