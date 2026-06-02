import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { IQResult } from "@/lib/issb/types";

export function useSaveIQResult() {
  return useMutation({
    mutationFn: async (result: Omit<IQResult, "id" | "completed_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("iq_results").insert({
        user_id: user?.id ?? null,
        set_id: result.set_id,
        course_id: result.course_id ?? null,
        score: result.score,
        total: result.total,
        answers: result.answers,
        time_taken_seconds: result.time_taken_seconds,
      });
      if (error) throw error;
    },
  });
}
