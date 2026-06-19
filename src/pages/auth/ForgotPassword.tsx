import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, KeyRound, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/AuthShell";
import { t } from "@/lib/strings";

type Step = "email" | "otp" | "password";

const emailSchema    = z.string().trim().email({ message: t.toast.invalidEmail }).max(255);
const passwordSchema = z
  .object({
    password: z.string().min(6, { message: t.toast.weakPassword }).max(72),
    confirm:  z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: t.toast.passwordMismatch, path: ["confirm"] });

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step,  setStep]  = useState<Step>("email");
  const [email, setEmail] = useState("");

  /* ── Step 1: Enter email ─────────────────────────────── */
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError,   setEmailError]   = useState("");

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { setEmailError(parsed.error.issues[0].message); return; }
    setEmailError("");
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: parsed.data,
        options: { shouldCreateUser: false },
      });
      if (error) { toast.error(t.toast.resetEmailFailed, { description: error.message }); return; }
      setStep("otp");
      toast.success("OTP পাঠানো হয়েছে! আপনার ইমেইল চেক করুন।");
    } catch {
      toast.error("একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setEmailLoading(false);
    }
  };

  /* ── Step 2: Enter OTP ───────────────────────────────── */
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

  const onOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length < 6) { toast.error("৬ সংখ্যার OTP দিন"); return; }
    setOtpLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
      if (error) {
        toast.error("OTP সঠিক নয় বা মেয়াদ শেষ হয়েছে।", { description: error.message });
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }
      setStep("password");
    } catch {
      toast.error("যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) { toast.error("পুনরায় পাঠানো ব্যর্থ হয়েছে।"); return; }
    toast.success("নতুন OTP পাঠানো হয়েছে।");
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((v) => { if (v <= 1) { clearInterval(interval); return 0; } return v - 1; });
    }, 1000);
  };

  /* ── Step 3: New password ────────────────────────────── */
  const [pwd,         setPwd]         = useState({ password: "", confirm: "" });
  const [pwdErrors,   setPwdErrors]   = useState<{ password?: string; confirm?: string }>({});
  const [pwdLoading,  setPwdLoading]  = useState(false);
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(pwd);
    if (!parsed.success) {
      const errs: typeof pwdErrors = {};
      parsed.error.issues.forEach((i) => { const k = i.path[0] as "password"|"confirm"; if (!errs[k]) errs[k] = i.message; });
      setPwdErrors(errs);
      return;
    }
    setPwdErrors({});
    setPwdLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) { toast.error(t.toast.resetEmailFailed, { description: error.message }); return; }
      toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! 🎉");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setPwdLoading(false);
    }
  };

  /* ── Progress indicator ─────────────────────────────── */
  const stepIndex = step === "email" ? 0 : step === "otp" ? 1 : 2;
  const steps     = ["ইমেইল", "OTP", "পাসওয়ার্ড"];

  const StepProgress = () => (
    <div className="mb-6 flex items-center justify-center gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className={[
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
              i < stepIndex  ? "bg-accent text-accent-foreground"         : "",
              i === stepIndex ? "bg-accent text-accent-foreground ring-4 ring-accent/20" : "",
              i > stepIndex  ? "bg-muted text-muted-foreground"           : "",
            ].join(" ")}>
              {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-[10px] ${i === stepIndex ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
          {i < 2 && <div className={`mb-4 h-px w-8 ${i < stepIndex ? "bg-accent" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );

  /* ── Step 1: Email ──────────────────────────────────── */
  if (step === "email") {
    return (
      <AuthShell
        title={t.auth.forgotTitle}
        subtitle="নিবন্ধিত ইমেইল দিন, OTP পাঠানো হবে"
        footer={
          <Link to="/login" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> লগইন পেজে ফিরুন
          </Link>
        }
      >
        <StepProgress />
        <form onSubmit={onEmailSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              placeholder="name@example.com"
              className={emailError ? "border-destructive" : ""}
            />
            {emailError && <p className="text-xs text-destructive">{emailError}</p>}
          </div>
          <Button type="submit" disabled={emailLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {emailLoading ? "পাঠানো হচ্ছে..." : "OTP পাঠান"}
          </Button>
        </form>
      </AuthShell>
    );
  }

  /* ── Step 2: OTP ─────────────────────────────────────── */
  if (step === "otp") {
    return (
      <AuthShell
        title="OTP যাচাই করুন"
        subtitle={`${email} এ একটি ৬ সংখ্যার কোড পাঠানো হয়েছে`}
        footer={
          <button
            onClick={() => { setStep("email"); setOtp(["","","","","",""]); }}
            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> ইমেইল পরিবর্তন করুন
          </button>
        }
      >
        <StepProgress />
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Mail className="h-7 w-7 text-accent" />
          </div>
        </div>
        <form onSubmit={onOtpVerify} className="space-y-6">
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
            {otpLoading ? "যাচাই হচ্ছে..." : <><CheckCircle2 className="mr-2 h-4 w-4" /> যাচাই করুন</>}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            কোড পাননি?{" "}
            {resendCooldown > 0
              ? <span>{resendCooldown} সেকেন্ড পর আবার পাঠান</span>
              : <button type="button" onClick={resendOtp} className="text-accent hover:underline">আবার পাঠান</button>
            }
          </p>
        </form>
      </AuthShell>
    );
  }

  /* ── Step 3: New password ───────────────────────────── */
  return (
    <AuthShell title="নতুন পাসওয়ার্ড দিন" subtitle="OTP যাচাই হয়েছে। এখন নতুন পাসওয়ার্ড সেট করুন।">
      <StepProgress />
      <div className="mb-5 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <KeyRound className="h-7 w-7 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <form onSubmit={onPasswordSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">{t.auth.password}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              value={pwd.password}
              onChange={(e) => setPwd((p) => ({ ...p, password: e.target.value }))}
              placeholder="নতুন পাসওয়ার্ড"
              className={pwdErrors.password ? "border-destructive pr-10" : "pr-10"}
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {pwdErrors.password && <p className="text-xs text-destructive">{pwdErrors.password}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">{t.auth.confirmPassword}</Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              value={pwd.confirm}
              onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="পাসওয়ার্ড পুনরায় লিখুন"
              className={pwdErrors.confirm ? "border-destructive pr-10" : "pr-10"}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {pwdErrors.confirm && <p className="text-xs text-destructive">{pwdErrors.confirm}</p>}
        </div>
        <Button type="submit" disabled={pwdLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          {pwdLoading ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
        </Button>
      </form>
    </AuthShell>
  );
}
