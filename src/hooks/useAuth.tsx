import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase, type AppRole } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DT_KEY = "icanbd_dtoken"; // localStorage key for device session token

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfileAndRole = async (uid: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, device_token")
        .eq("id", uid)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);

    const roles = (r as { role: AppRole }[] | null) ?? [];
    const isAdmin = roles.some((x) => x.role === "admin");

    // ── Single-device enforcement (non-admins only) ───────────────
    if (!isAdmin) {
      const localToken = localStorage.getItem(DT_KEY);
      const dbToken = (p as { device_token?: string | null } | null)?.device_token;

      if (localToken) {
        // Kick out if DB token is gone (admin cleared) or a different device claimed it
        if (!dbToken || dbToken !== localToken) {
          localStorage.removeItem(DT_KEY);
          setProfile(null);
          setRole(null);
          await supabase.auth.signOut();
          toast.error("অন্য ডিভাইসে লগইন হয়েছে। আপনাকে সাইন আউট করা হয়েছে।");
          return;
        }
      }
    }
    // ─────────────────────────────────────────────────────────────

    setProfile((p as Profile) ?? null);
    setRole(roles.find((x) => x.role === "admin")?.role ?? roles[0]?.role ?? "student");
  };

  useEffect(() => {
    // 1) Listener FIRST to avoid race with getSession
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        if (event === "SIGNED_IN") {
          // New login → register this device by writing a fresh token to DB.
          // Write must complete before loadProfileAndRole so the check passes on this device.
          const token = crypto.randomUUID();
          localStorage.setItem(DT_KEY, token);
          setTimeout(() => {
            supabase
              .from("profiles")
              .update({ device_token: token })
              .eq("id", newSession.user.id)
              .then(() => loadProfileAndRole(newSession.user.id))
              .catch(() => loadProfileAndRole(newSession.user.id));
          }, 0);
        } else {
          // TOKEN_REFRESHED / INITIAL_SESSION — check existing token without re-registering
          setTimeout(() => {
            void loadProfileAndRole(newSession.user.id);
          }, 0);
        }
      } else {
        setProfile(null);
        setRole(null);
        localStorage.removeItem(DT_KEY);
      }
    });

    // 2) Then read existing session (page reload path)
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        void loadProfileAndRole(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: AuthContextValue = {
    user,
    session,
    profile,
    role,
    loading,
    signOut: async () => {
      localStorage.removeItem(DT_KEY);
      await supabase.auth.signOut();
    },
    refreshProfile: async () => {
      if (user) await loadProfileAndRole(user.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
