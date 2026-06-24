import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface StudentProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  email: string | null;
  role: string;
  created_at: string | null;
  source: string | null;
}

export function useStudents() {
  return useQuery<StudentProfile[]>({
    queryKey: ["admin_students"],
    queryFn: async () => {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }, { data: users, error: uErr }] =
        await Promise.all([
          supabase.from("profiles").select("id, full_name, phone, avatar_url, created_at, source"),
          supabase.from("user_roles").select("user_id, role"),
          supabase.rpc("admin_list_users"),
        ]);

      if (pErr) throw pErr;
      if (rErr) throw rErr;

      const roleMap: Record<string, string> = {};
      for (const r of roles ?? []) roleMap[r.user_id] = r.role;

      const emailMap: Record<string, string> = {};
      if (!uErr) for (const u of (users as { id: string; email: string }[] | null) ?? []) emailMap[u.id] = u.email;

      return (profiles ?? []).map((p) => ({
        ...p,
        email: emailMap[p.id] ?? null,
        role: roleMap[p.id] ?? "student",
        created_at: p.created_at ?? null,
        source: p.source ?? null,
      }));
    },
  });
}

export function useMarkUserSource() {
  return useMutation({
    mutationFn: async ({ userId, source }: { userId: string; source: string }) => {
      const { error } = await supabase.rpc("admin_mark_user_source", {
        p_user_id: userId,
        p_source: source,
      });
      if (error) throw error;
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("admin_delete_user", { target_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_students"] }),
  });
}

export function useAdminClearDevices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("admin_clear_device_token", { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_students"] }),
  });
}

export function useResetStudentPassword() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data: rows, error: rpcErr } = await supabase.rpc("admin_list_users");
      if (rpcErr) throw rpcErr;
      const user = (rows as { id: string; email: string }[] | null)?.find((u) => u.id === userId);
      if (!user?.email) throw new Error("ইমেইল পাওয়া যায়নি");
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
  });
}
