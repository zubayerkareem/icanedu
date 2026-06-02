import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type ServiceBranch = "army" | "navy" | "others";

export interface StudentMetadata {
  user_id: string;
  issb_id: string | null;
  service_branch: ServiceBranch | null;
  created_at: string;
}

export function useStudentMetadata(userId?: string) {
  return useQuery<StudentMetadata | null>({
    queryKey: ["student_metadata", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_metadata")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as StudentMetadata | null;
    },
  });
}

export function useSaveStudentMetadata() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { user_id: string; issb_id: string; service_branch: ServiceBranch }) => {
      const { error } = await supabase.from("student_metadata").insert(payload);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["student_metadata", variables.user_id] });
    },
  });
}
