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
  blocked: boolean;        // true when login was rejected due to another active device
  clearBlocked: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DT_KEY = "icanbd_dtoken";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole]       = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  // Always-current refs for use inside async callbacks / Realtime
  const roleRef = useRef<AppRole | null>(null);
  const userRef = useRef<User | null>(null);   // needed for signOut inside kickOut

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

    // ── Single-device enforcement (skipped for admins and if column not yet migrated) ──
    if (!isAdmin && !pErr) {
      const localToken = localStorage.getItem(DT_KEY);
      const dbToken    = (p as { device_token?: string | null } | null)?.device_token;

      if (localToken) {
        // null  → admin cleared session; different string → stale token (race condition)
        const kicked =
          dbToken === null ||
          (typeof dbToken === "string" && dbToken !== localToken);

        if (kicked) {
          setProfile(null);
          setRole(null);
          roleRef.current = null;
          localStorage.removeItem(DT_KEY);
          await supabase.auth.signOut();
          toast.error("আপনার সেশন রিসেট করা হয়েছে। পুনরায় লগইন করুন।");
          return;
        }
      }
    }

    setProfile((p as Profile) ?? null);
    const newRole = roles.find((x) => x.role === "admin")?.role ?? roles[0]?.role ?? "student";
    setRole(newRole);
    roleRef.current = newRole;
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      userRef.current = newSession?.user ?? null;

      if (newSession?.user) {
        if (event === "SIGNED_IN") {
          // ── "First device wins" check (admins are fully exempt) ────────────
          setTimeout(async () => {
            // Fetch role and device_token together before deciding anything
            const [{ data: p, error: pErr }, { data: r }] = await Promise.all([
              supabase
                .from("profiles")
                .select("device_token")
                .eq("id", newSession.user.id)
                .maybeSingle(),
              supabase.from("user_roles").select("role").eq("user_id", newSession.user.id),
            ]);

            const isAdmin = (r as { role: string }[] | null)?.some((x) => x.role === "admin") ?? false;

            if (!isAdmin && !pErr) {
              const existingToken = (p as { device_token?: string | null } | null)?.device_token;
              const myLocalToken  = localStorage.getItem(DT_KEY);

              // Another device already owns this account → block this login
              if (existingToken && existingToken !== myLocalToken) {
                setBlocked(true);
                await supabase.auth.signOut();
                return;
              }
            }

            // Admin OR no active device (or same device re-logging in) → claim the session
            if (!isAdmin) {
              const token = crypto.randomUUID();
              localStorage.setItem(DT_KEY, token);
              const { error: writeErr } = await supabase
                .from("profiles")
                .update({ device_token: token })
                .eq("id", newSession.user.id);
              if (writeErr) localStorage.removeItem(DT_KEY);
            }

            await loadProfileAndRole(newSession.user.id);
          }, 0);
          // ───────────────────────────────────────────────────────────────────
        } else {
          // TOKEN_REFRESHED, INITIAL_SESSION, etc.
          setTimeout(() => void loadProfileAndRole(newSession.user.id), 0);
        }
      } else {
        // SIGNED_OUT
        setProfile(null);
        setRole(null);
        roleRef.current = null;
        localStorage.removeItem(DT_KEY);
      }
    });

    // Initial page load — existing session
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session?.user) setLoading(false);
      // loadProfileAndRole is triggered by onAuthStateChange (INITIAL_SESSION)
      // setLoading(false) is called there via the else branch timeout completing
    });

    // Fallback: ensure loading is cleared after 3 s even if events are slow
    const fallback = setTimeout(() => setLoading(false), 3000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Realtime: instant kick when admin clears the device token ──────────
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
          if (roleRef.current === "admin") return; // admins are exempt

          const newDbToken = (payload.new as { device_token?: string | null })?.device_token;
          const localToken = localStorage.getItem(DT_KEY);

          if (!localToken) return;

          const kicked =
            newDbToken === null ||
            (typeof newDbToken === "string" && newDbToken !== localToken);

          if (kicked) {
            setProfile(null);
            setRole(null);
            roleRef.current = null;
            localStorage.removeItem(DT_KEY);
            void supabase.auth.signOut().then(() => {
              toast.error("আপনার সেশন রিসেট করা হয়েছে। পুনরায় লগইন করুন।");
            });
          }
        },
      )
      .subscribe();

    // Backup: re-check on tab focus
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
  // ──────────────────────────────────────────────────────────────────────

  // Keep loading false after first profile load
  useEffect(() => {
    if (profile !== null || role !== null) setLoading(false);
  }, [profile, role]);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    role,
    loading,
    blocked,
    clearBlocked: () => setBlocked(false),
    signOut: async () => {
      const uid = user?.id;
      localStorage.removeItem(DT_KEY);
      if (uid) {
        // Clear device token so the user can log in fresh from any device
        await supabase.from("profiles").update({ device_token: null }).eq("id", uid);
      }
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
