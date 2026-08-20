import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string | null;
}

/** Lists all users currently holding the 'admin' role (superadmin excluded). */
export function useAdminList() {
  return useQuery<AdminUser[]>({
    queryKey: ["admin_list"],
    staleTime: 30_000,
    queryFn: async () => {
      // Fetch admin role rows
      const { data: roleRows, error: roleErr } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      if (roleErr) throw roleErr;

      const ids = (roleRows ?? []).map((r) => r.user_id).filter(Boolean) as string[];
      if (!ids.length) return [];

      // Fetch profiles for those IDs (name, created_at)
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, full_name, created_at")
        .in("id", ids);
      if (pErr) throw pErr;

      // Fetch emails via the existing RPC used by admin_list_users
      const { data: authUsers, error: rpcErr } = await supabase.rpc("admin_list_users");
      if (rpcErr) throw rpcErr;

      const emailMap = new Map<string, string>();
      (authUsers ?? []).forEach((u: { id: string; email: string }) => {
        emailMap.set(u.id, u.email);
      });

      return ids.map((id) => {
        const p = (profiles ?? []).find((x) => x.id === id);
        return {
          id,
          full_name: p?.full_name ?? null,
          email: emailMap.get(id) ?? null,
          created_at: p?.created_at ?? null,
        };
      });
    },
  });
}

/** Promotes or demotes an admin via the server-side `/api/manage-admin` route. */
export function useManageAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      action,
      targetEmail,
    }: {
      action: "promote" | "demote";
      targetEmail: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch("/api/manage-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action, targetEmail }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_list"] });
    },
  });
}
