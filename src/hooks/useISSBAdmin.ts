import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  IQSet, IQQuestion, WATSet, ISTSet, ISTSentence,
  ExtemporeSet, ExtemporeTopic,
  PPDTSet, PPDTPicture,
  PictureStorySet, PictureStoryPicture,
  IncompleteStorySet, IncompleteStory,
} from "@/lib/issb/types";

// ─── Admin fetch: all sets (including unpublished) ────────────

export function useAdminIQSets(courseId?: string) {
  return useQuery<IQSet[]>({
    queryKey: ["admin_iq_sets", courseId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("iq_sets").select("*, iq_questions(*)").order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminWATSets(courseId?: string) {
  return useQuery<WATSet[]>({
    queryKey: ["admin_wat_sets", courseId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("wat_sets").select("*").order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminISTSets(courseId?: string) {
  return useQuery<ISTSet[]>({
    queryKey: ["admin_ist_sets", courseId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("ist_sets").select("*, ist_sentences(*)").order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminExtemporeSets(courseId?: string) {
  return useQuery<ExtemporeSet[]>({
    queryKey: ["admin_extempore_sets", courseId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("extempore_sets").select("*, extempore_topics(*)").order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminPPDTSets(courseId?: string) {
  return useQuery<PPDTSet[]>({
    queryKey: ["admin_ppdt_sets", courseId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("ppdt_sets").select("*, ppdt_pictures(*)").order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminPictureStorySets(courseId?: string) {
  return useQuery<PictureStorySet[]>({
    queryKey: ["admin_picture_story_sets", courseId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("picture_story_sets").select("*, picture_story_pictures(*)").order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminIncompleteStorySets(courseId?: string) {
  return useQuery<IncompleteStorySet[]>({
    queryKey: ["admin_incomplete_story_sets", courseId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("incomplete_story_sets").select("*, incomplete_stories(*)").order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ─── Generic helpers ──────────────────────────────────────────

function upsertMutation<T extends { id?: string }>(
  table: string,
  queryKey: string,
  pick: (item: T) => object
) {
  return function useUpsert() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (item: T) => {
        const payload = pick(item);
        if (item.id) {
          const { error } = await supabase.from(table).update(payload).eq("id", item.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from(table).insert(payload);
          if (error) throw error;
        }
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
    });
  };
}

function deleteMutation(table: string, queryKey: string) {
  return function useDelete() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
    });
  };
}

// ─── IQ ──────────────────────────────────────────────────────
export const useUpsertIQSet = upsertMutation<Partial<IQSet> & { course_id?: string }>(
  "iq_sets", "admin_iq_sets",
  (s) => ({ title: s.title, description: s.description ?? "", timer_seconds: s.timer_seconds ?? 300, order_index: s.order_index ?? 0, is_published: s.is_published ?? true, is_free: s.is_free ?? false, course_id: s.course_id ?? null })
);
export const useDeleteIQSet = deleteMutation("iq_sets", "admin_iq_sets");

export const useUpsertIQQuestion = upsertMutation<Partial<IQQuestion>>(
  "iq_questions", "admin_iq_sets",
  (q) => ({ set_id: q.set_id, text: q.text, image_url: q.image_url ?? null, options: q.options ?? [], correct: q.correct ?? "", order_index: q.order_index ?? 0 })
);
export const useDeleteIQQuestion = deleteMutation("iq_questions", "admin_iq_sets");

// ─── WAT ─────────────────────────────────────────────────────
export const useUpsertWATSet = upsertMutation<Partial<WATSet>>(
  "wat_sets", "admin_wat_sets",
  (s) => ({ title: s.title, words: s.words ?? [], word_seconds: s.word_seconds ?? 10, order_index: s.order_index ?? 0, is_published: s.is_published ?? true, is_free: s.is_free ?? false, course_id: s.course_id ?? null })
);
export const useDeleteWATSet = deleteMutation("wat_sets", "admin_wat_sets");

// ─── IST ─────────────────────────────────────────────────────
export const useUpsertISTSet = upsertMutation<Partial<ISTSet>>(
  "ist_sets", "admin_ist_sets",
  (s) => ({ title: s.title, timer_seconds: s.timer_seconds ?? 300, order_index: s.order_index ?? 0, is_published: s.is_published ?? true, is_free: s.is_free ?? false, course_id: s.course_id ?? null })
);
export const useDeleteISTSet = deleteMutation("ist_sets", "admin_ist_sets");

export const useUpsertISTSentence = upsertMutation<Partial<ISTSentence>>(
  "ist_sentences", "admin_ist_sets",
  (s) => ({ set_id: s.set_id, stem: s.stem, example: s.example ?? "", order_index: s.order_index ?? 0 })
);
export const useDeleteISTSentence = deleteMutation("ist_sentences", "admin_ist_sets");

// ─── Extempore ───────────────────────────────────────────────
export const useUpsertExtemporeSet = upsertMutation<Partial<ExtemporeSet>>(
  "extempore_sets", "admin_extempore_sets",
  (s) => ({ title: s.title, timer_seconds: s.timer_seconds ?? 1500, order_index: s.order_index ?? 0, is_published: s.is_published ?? true, is_free: s.is_free ?? false, course_id: s.course_id ?? null })
);
export const useDeleteExtemporeSet = deleteMutation("extempore_sets", "admin_extempore_sets");

export const useUpsertExtemporeTopic = upsertMutation<Partial<ExtemporeTopic>>(
  "extempore_topics", "admin_extempore_sets",
  (t) => ({ set_id: t.set_id, topic: t.topic, category: t.category ?? "general", hint: t.hint ?? "", model_points: t.model_points ?? [], model_essay: t.model_essay ?? "", order_index: t.order_index ?? 0 })
);
export const useDeleteExtemporeTopic = deleteMutation("extempore_topics", "admin_extempore_sets");

// ─── PPDT ────────────────────────────────────────────────────
export const useUpsertPPDTSet = upsertMutation<Partial<PPDTSet>>(
  "ppdt_sets", "admin_ppdt_sets",
  (s) => ({ title: s.title, observe_seconds: s.observe_seconds ?? 30, write_seconds: s.write_seconds ?? 270, order_index: s.order_index ?? 0, is_published: s.is_published ?? true, is_free: s.is_free ?? false, course_id: s.course_id ?? null })
);
export const useDeletePPDTSet = deleteMutation("ppdt_sets", "admin_ppdt_sets");

export const useUpsertPPDTPicture = upsertMutation<Partial<PPDTPicture>>(
  "ppdt_pictures", "admin_ppdt_sets",
  (p) => ({ set_id: p.set_id, picture_number: p.picture_number ?? 1, image_url: p.image_url, title: p.title ?? "", idea: p.idea ?? "", order_index: p.order_index ?? 0 })
);
export const useDeletePPDTPicture = deleteMutation("ppdt_pictures", "admin_ppdt_sets");

// ─── Picture Story ────────────────────────────────────────────
export const useUpsertPictureStorySet = upsertMutation<Partial<PictureStorySet>>(
  "picture_story_sets", "admin_picture_story_sets",
  (s) => ({ title: s.title, observe_seconds: s.observe_seconds ?? 30, write_seconds: s.write_seconds ?? 60, order_index: s.order_index ?? 0, is_published: s.is_published ?? true, is_free: s.is_free ?? false, course_id: s.course_id ?? null })
);
export const useDeletePictureStorySet = deleteMutation("picture_story_sets", "admin_picture_story_sets");

export const useUpsertPictureStoryPicture = upsertMutation<Partial<PictureStoryPicture>>(
  "picture_story_pictures", "admin_picture_story_sets",
  (p) => ({ set_id: p.set_id, picture_number: p.picture_number ?? 1, image_url: p.image_url, title: p.title ?? "", idea: p.idea ?? "", order_index: p.order_index ?? 0 })
);
export const useDeletePictureStoryPicture = deleteMutation("picture_story_pictures", "admin_picture_story_sets");

// ─── Incomplete Story ─────────────────────────────────────────
export const useUpsertIncompleteStorySet = upsertMutation<Partial<IncompleteStorySet>>(
  "incomplete_story_sets", "admin_incomplete_story_sets",
  (s) => ({ title: s.title, order_index: s.order_index ?? 0, is_published: s.is_published ?? true, is_free: s.is_free ?? false, course_id: s.course_id ?? null })
);
export const useDeleteIncompleteStorySet = deleteMutation("incomplete_story_sets", "admin_incomplete_story_sets");

export const useUpsertIncompleteStory = upsertMutation<Partial<IncompleteStory>>(
  "incomplete_stories", "admin_incomplete_story_sets",
  (s) => ({ set_id: s.set_id, title: s.title, instruction: s.instruction ?? "", body: s.body ?? "", word_limit: s.word_limit ?? 200, time_guide_minutes: s.time_guide_minutes ?? 10, idea: s.idea ?? "", order_index: s.order_index ?? 0 })
);
export const useDeleteIncompleteStory = deleteMutation("incomplete_stories", "admin_incomplete_story_sets");
