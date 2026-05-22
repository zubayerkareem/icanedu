import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/AuthShell";
import { t } from "@/lib/strings";

const schema = z.object({
  email: z.string().trim().email({ message: t.toast.invalidEmail }).max(255),
  password: z.string().min(6, { message: t.toast.weakPassword }).max(72),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const from = redirectParam
    ?? (location.state as { from?: string } | null)?.from
    ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: typeof errors = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0] === "email") errs.email = i.message;
        if (i.path[0] === "password") errs.password = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        toast.error("ইমেইল যাচাই করা হয়নি।", {
          description: "নিবন্ধনের সময় পাঠানো OTP দিয়ে অ্যাকাউন্ট নিশ্চিত করুন।",
          action: {
            label: "যাচাই করুন",
            onClick: () => navigate(`/register`),
          },
        });
      } else {
        toast.error(t.toast.loginFailed, { description: error.message });
      }
      return;
    }
    toast.success(t.toast.loginSuccess);
    navigate(from, { replace: true });
  };

  return (
    <AuthShell
      title={t.auth.loginTitle}
      subtitle={t.auth.loginSubtitle}
      footer={
        <>
          {t.auth.noAccount}{" "}
          <Link to="/register" className="font-medium text-accent hover:underline">
            {t.auth.registerHere}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Link to="/forgot-password" className="text-xs text-accent hover:underline">
              {t.auth.forgotPassword}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {loading ? t.auth.loggingIn : t.auth.loginButton}
        </Button>
      </form>
    </AuthShell>
  );
}
