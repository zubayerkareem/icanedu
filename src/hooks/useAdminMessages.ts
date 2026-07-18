import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminMessage {
  id: string;
  body: string;
  created_by: string | null;
  created_at: string;
  recipient_count?: number;
}

export interface MyMessage {
  id: string;          // recipient row id
  message_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminMessages() {
  return useQuery<AdminMessage[]>({
    queryKey: ["admin_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_messages")
        .select("*, admin_message_recipients(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((m) => ({
        ...m,
        recipient_count: (m.admin_message_recipients as unknown as { count: number }[])?.[0]?.count ?? 0,
      }));
    },
  });
}

export function useSendAdminMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, recipientIds }: { body: string; recipientIds: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: msg, error: msgErr } = await supabase
        .from("admin_messages")
        .insert({ body, created_by: user?.id ?? null })
        .select("id")
        .single();
      if (msgErr) throw msgErr;

      if (recipientIds.length > 0) {
        const rows = recipientIds.map((user_id) => ({ message_id: msg.id, user_id }));
        const { error: recErr } = await supabase.from("admin_message_recipients").insert(rows);
        if (recErr) throw recErr;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_messages"] }),
  });
}

export function useDeleteAdminMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_messages"] }),
  });
}

// ─── Student hooks ────────────────────────────────────────────────────────────

export function useMyMessages() {
  return useQuery<MyMessage[]>({
    queryKey: ["my_messages"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase.rpc("get_my_messages");
      if (error) throw error;

      return (data ?? []).map((r: {
        recipient_id: string;
        message_id: string;
        body: string;
        created_at: string;
        read_at: string | null;
      }) => ({
        id: r.recipient_id,
        message_id: r.message_id,
        body: r.body,
        created_at: r.created_at,
        read_at: r.read_at,
      }));
    },
  });
}

export function useMarkMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recipientId: string) => {
      const { error } = await supabase
        .from("admin_message_recipients")
        .update({ read_at: new Date().toISOString() })
        .eq("id", recipientId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my_messages"] }),
  });
}
