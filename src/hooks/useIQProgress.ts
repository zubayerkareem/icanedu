import { useCallback } from "react";

export interface IQSetProgress {
  answers: Record<string, string>;
  timeLeft: number;
  completed: boolean;
  score?: number;
  total?: number;
}

function key(courseId: string, setId: string) {
  return `iq_${courseId}_${setId}`;
}

export function loadProgress(courseId: string, setId: string): IQSetProgress | null {
  try {
    const raw = localStorage.getItem(key(courseId, setId));
    return raw ? (JSON.parse(raw) as IQSetProgress) : null;
  } catch {
    return null;
  }
}

export function saveProgress(courseId: string, setId: string, progress: IQSetProgress) {
  try {
    localStorage.setItem(key(courseId, setId), JSON.stringify(progress));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function clearProgress(courseId: string, setId: string) {
  localStorage.removeItem(key(courseId, setId));
}

export function useIQProgress(courseId: string, setId: string) {
  const load = useCallback(() => loadProgress(courseId, setId), [courseId, setId]);
  const save = useCallback(
    (progress: IQSetProgress) => saveProgress(courseId, setId, progress),
    [courseId, setId],
  );
  return { load, save };
}
