import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/AuthShell";
import { t } from "@/lib/strings";

const schema = z
  .object({
    full_name: z.string().trim().min(2, { message: t.toast.requiredField }).max(100),
    email:     z.string().trim().email({ message: t.toast.invalidEmail }).max(255),
    phone:     z.string().trim().min(6,  { message: t.toast.requiredField }).max(20),
    password:  z.string().min(6, { message: t.toast.weakPassword }).max(72),
    confirm:   z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: t.toast.passwordMismatch, path: ["confirm"],
  });

type Step = "form" | "otp";

export default function Register() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState<Step>("form");
  const [regEmail, setRegEmail] = useState("");

  /* ── Step 1: registration form ──────────────────────── */
  const [form,    setForm]    = useState({ full_name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const setField = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { const k = i.path[0] as string; if (!errs[k]) errs[k] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email:    parsed.data.email,
        password: parsed.data.password,
        options: { data: { full_name: parsed.data.full_name, phone: parsed.data.phone } },
      });

      if (error) {
        toast.error(t.toast.registerFailed, { description: error.message });
        return;
      }

      // If Supabase returned a session the account was auto-confirmed (email confirmation disabled)
      if (data.session) {
        toast.success("নিবন্ধন সফল হয়েছে! স্বাগতম 🎉");
        navigate("/dashboard", { replace: true });
        return;
      }

      // email_confirmed_at is null → OTP sent → show OTP step
      setRegEmail(parsed.data.email);
      setStep("otp");
      toast.success("OTP পাঠানো হয়েছে! আপনার ইমেইল চেক করুন।");
    } catch (err) {
      toast.error("একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: OTP verification ────────────────────────── */
  const [otp,        setOtp]        = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleOtpChange(idx: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...otp];
    next[idx]   = digit;
    setOtp(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft"  && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    const next = digits.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(next);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length < 6) { toast.error("৬ সংখ্যার OTP দিন"); return; }
    setOtpLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email: regEmail, token, type: "signup" });
      if (error) {
        toast.error("OTP সঠিক নয় বা মেয়াদ শেষ হয়েছে।", { description: error.message });
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }
      toast.success("অ্যাকাউন্ট নিশ্চিত হয়েছে! স্বাগতম 🎉");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    const { error } = await supabase.auth.resend({ type: "signup", email: regEmail });
    if (error) { toast.error("পুনরায় পাঠানো ব্যর্থ হয়েছে।"); return; }
    toast.success("নতুন OTP পাঠানো হয়েছে।");
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((v) => { if (v <= 1) { clearInterval(interval); return 0; } return v - 1; });
    }, 1000);
  };

  /* ── OTP screen ────────────────────────────────────────── */
  if (step === "otp") {
    return (
      <AuthShell
        title="ইমেইল যাচাই করুন"
        subtitle={`${regEmail} এ একটি ৬ সংখ্যার কোড পাঠানো হয়েছে`}
        footer={
          <button
            onClick={() => { setStep("form"); setOtp(["","","","","",""]); }}
            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> ফিরে যান
          </button>
        }
      >
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Mail className="h-8 w-8 text-accent" />
          </div>
        </div>

        <form onSubmit={onVerify} className="space-y-6">
          <div>
            <Label className="mb-3 block text-center text-sm font-medium">OTP কোড লিখুন</Label>
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={[
                    "h-12 w-11 rounded-lg border-2 text-center text-xl font-bold tabular-nums transition-colors",
                    "bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    digit ? "border-accent" : "border-input",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={otpLoading || otp.join("").length < 6}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {otpLoading
              ? "যাচাই হচ্ছে..."
              : <><CheckCircle2 className="mr-2 h-4 w-4" /> যাচাই করুন</>
            }
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            কোড পাননি?{" "}
            {resendCooldown > 0
              ? <span className="text-muted-foreground">{resendCooldown} সেকেন্ড পর আবার পাঠান</span>
              : <button type="button" onClick={resendOtp} className="text-accent hover:underline">আবার পাঠান</button>
            }
          </p>
        </form>
      </AuthShell>
    );
  }

  /* ── Registration form ─────────────────────────────────── */
  return (
    <AuthShell
      title={t.auth.registerTitle}
      subtitle={t.auth.registerSubtitle}
      footer={
        <>
          {t.auth.haveAccount}{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            {t.auth.loginHere}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">{t.auth.fullName}</Label>
          <Input id="full_name" value={form.full_name} onChange={setField("full_name")} placeholder="মোঃ রহিম উদ্দিন" />
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input id="email" type="email" value={form.email} onChange={setField("email")} placeholder="name@example.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t.auth.phone}</Label>
          <Input id="phone" type="tel" value={form.phone} onChange={setField("phone")} placeholder="01XXXXXXXXX" />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input id="password" type="password" value={form.password} onChange={setField("password")} placeholder="••••••••" />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">{t.auth.confirmPassword}</Label>
            <Input id="confirm" type="password" value={form.confirm} onChange={setField("confirm")} placeholder="••••••••" />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          {loading ? t.auth.registering : t.auth.registerButton}
        </Button>
      </form>
    </AuthShell>
  );
}
