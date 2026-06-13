import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  IQSet, WATSet, ISTSet, ExtemporeSet,
  PPDTSet, PictureStorySet, IncompleteStorySet, PlanningTaskSet, GroupDiscussionSet,
} from "@/lib/issb/types";

// ─── IQ Practice ─────────────────────────────────────────────
export function useIQSets(courseId?: string) {
  return useQuery<IQSet[]>({
    queryKey: ["iq_sets", courseId],
    enabled: !!courseId,
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase
        .from("iq_sets")
        .select("*, iq_questions(*)")
        .eq("is_published", true)
        .order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((s) => ({
        ...s,
        iq_questions: (s.iq_questions ?? []).sort(
          (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
        ),
      }));
    },
  });
}

// ─── WAT ─────────────────────────────────────────────────────
export function useWATSets(courseId?: string) {
  return useQuery<WATSet[]>({
    queryKey: ["wat_sets", courseId],
    enabled: !!courseId,
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase.from("wat_sets").select("*").eq("is_published", true).order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ─── IST ─────────────────────────────────────────────────────
export function useISTSets(courseId?: string) {
  return useQuery<ISTSet[]>({
    queryKey: ["ist_sets", courseId],
    enabled: !!courseId,
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase
        .from("ist_sets")
        .select("*, ist_sentences(*)")
        .eq("is_published", true)
        .order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((s) => ({
        ...s,
        ist_sentences: (s.ist_sentences ?? []).sort(
          (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
        ),
      }));
    },
  });
}

// ─── Extempore ───────────────────────────────────────────────
export function useExtemporeSets(courseId?: string) {
  return useQuery<ExtemporeSet[]>({
    queryKey: ["extempore_sets", courseId],
    enabled: !!courseId,
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase
        .from("extempore_sets")
        .select("*, extempore_topics(*)")
        .eq("is_published", true)
        .order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((s) => ({
        ...s,
        extempore_topics: (s.extempore_topics ?? []).sort(
          (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
        ),
      }));
    },
  });
}

// ─── PPDT ────────────────────────────────────────────────────
export function usePPDTSets(courseId?: string) {
  return useQuery<PPDTSet[]>({
    queryKey: ["ppdt_sets", courseId],
    enabled: !!courseId,
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase
        .from("ppdt_sets")
        .select("*, ppdt_pictures(*)")
        .eq("is_published", true)
        .order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((s) => ({
        ...s,
        ppdt_pictures: (s.ppdt_pictures ?? []).sort(
          (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
        ),
      }));
    },
  });
}

// ─── Picture Story ────────────────────────────────────────────
export function usePictureStorySets(courseId?: string) {
  return useQuery<PictureStorySet[]>({
    queryKey: ["picture_story_sets", courseId],
    enabled: !!courseId,
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase
        .from("picture_story_sets")
        .select("*, picture_story_pictures(*)")
        .eq("is_published", true)
        .order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((s) => ({
        ...s,
        picture_story_pictures: (s.picture_story_pictures ?? []).sort(
          (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
        ),
      }));
    },
  });
}

// ─── Incomplete Story ─────────────────────────────────────────
export function useIncompleteStorySets(courseId?: string) {
  return useQuery<IncompleteStorySet[]>({
    queryKey: ["incomplete_story_sets", courseId],
    enabled: !!courseId,
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase
        .from("incomplete_story_sets")
        .select("*, incomplete_stories(*)")
        .eq("is_published", true)
        .order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((s) => ({
        ...s,
        incomplete_stories: (s.incomplete_stories ?? []).sort(
          (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
        ),
      }));
    },
  });
}

// ─── Group Discussion ─────────────────────────────────────────
export function useGroupDiscussionSets(courseId?: string) {
  return useQuery<GroupDiscussionSet[]>({
    queryKey: ["group_discussion_sets", courseId],
    enabled: !!courseId,
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase
        .from("group_discussion_sets")
        .select("*, group_discussion_tasks(*)")
        .eq("is_published", true)
        .order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((s) => ({
        ...s,
        group_discussion_tasks: (s.group_discussion_tasks ?? []).sort(
          (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
        ),
      }));
    },
  });
}

// ─── Planning Task ────────────────────────────────────────────
export function usePlanningTaskSets(courseId?: string) {
  return useQuery<PlanningTaskSet[]>({
    queryKey: ["planning_sets", courseId],
    enabled: !!courseId,
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase
        .from("planning_sets")
        .select("*, planning_tasks(*)")
        .eq("is_published", true)
        .order("order_index");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((s) => ({
        ...s,
        planning_tasks: (s.planning_tasks ?? []).sort(
          (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
        ),
      }));
    },
  });
}
