import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
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

const DT_KEY = "icanbd_dtoken";

async function kickOut() {
  localStorage.removeItem(DT_KEY);
  await supabase.auth.signOut();
  toast.error("অন্য ডিভাইসে লগইন হয়েছে। আপনাকে সাইন আউট করা হয়েছে।");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole]       = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Ref so Realtime/visibilitychange callbacks always see current role without stale closure
  const roleRef = useRef<AppRole | null>(null);

  const loadProfileAndRole = async (uid: string) => {
    const [{ data: p, error: pErr }, { data: r }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, device_token")
        .eq("id", uid)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);

    const roles   = (r as { role: AppRole }[] | null) ?? [];
    const isAdmin = roles.some((x) => x.role === "admin");

    // ── Single-device check (skipped for admins and if column missing) ──
    if (!isAdmin && !pErr) {
      const localToken = localStorage.getItem(DT_KEY);
      const dbToken    = (p as { device_token?: string | null } | null)?.device_token;

      if (localToken) {
        // null  → admin cleared session
        // different string → another device took over
        const kicked =
          dbToken === null ||
          (typeof dbToken === "string" && dbToken !== localToken);

        if (kicked) {
          setProfile(null);
          setRole(null);
          roleRef.current = null;
          await kickOut();
          return;
        }
      }
    }
    // ───────────────────────────────────────────────────────────────────

    setProfile((p as Profile) ?? null);
    const newRole = roles.find((x) => x.role === "admin")?.role ?? roles[0]?.role ?? "student";
    setRole(newRole);
    roleRef.current = newRole;
  };

  useEffect(() => {
    // 1) Auth state listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        if (event === "SIGNED_IN") {
          // New login → claim this device with a fresh token
          const token = crypto.randomUUID();
          localStorage.setItem(DT_KEY, token);
          setTimeout(() => {
            supabase
              .from("profiles")
              .update({ device_token: token })
              .eq("id", newSession.user.id)
              .then(({ error }) => {
                // If column doesn't exist yet, remove localStorage token to avoid false kicks
                if (error) localStorage.removeItem(DT_KEY);
                return loadProfileAndRole(newSession.user.id);
              })
              .catch(() => {
                localStorage.removeItem(DT_KEY);
                return loadProfileAndRole(newSession.user.id);
              });
          }, 0);
        } else {
          setTimeout(() => void loadProfileAndRole(newSession.user.id), 0);
        }
      } else {
        setProfile(null);
        setRole(null);
        roleRef.current = null;
        localStorage.removeItem(DT_KEY);
      }
    });

    // 2) Existing session (page reload)
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

  // ── Realtime: instant kick when another device writes a new token ────
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`device-watch-${user.id}`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (roleRef.current === "admin") return; // admins exempt

          const newDbToken = (payload.new as { device_token?: string | null })?.device_token;
          const localToken = localStorage.getItem(DT_KEY);

          if (!localToken) return; // not tracking this device

          const kicked =
            newDbToken === null ||
            (typeof newDbToken === "string" && newDbToken !== localToken);

          if (kicked) {
            setProfile(null);
            setRole(null);
            roleRef.current = null;
            void kickOut();
          }
        },
      )
      .subscribe();

    // ── Visibility backup: check when tab regains focus ────────────────
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void loadProfileAndRole(user.id);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      void supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // ─────────────────────────────────────────────────────────────────────

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
