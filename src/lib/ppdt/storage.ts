export interface PPDTSubmission {
  picture_number: number;
  story_text: string;
  word_count: number;
  time_taken: number;
  auto_submitted: boolean;
  submitted_at: string;
}

export interface PPDTSessionData {
  set_id: string;
  set_name: string;
  started_at: string;
  submissions: PPDTSubmission[];
  completed: boolean;
}

export function saveSession(courseId: string, data: PPDTSessionData): void {
  try {
    localStorage.setItem(`ppdt_${courseId}`, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save PPDT session:", e);
  }
}

export function loadSession(courseId: string): PPDTSessionData | null {
  try {
    const raw = localStorage.getItem(`ppdt_${courseId}`);
    if (!raw) return null;
    return JSON.parse(raw) as PPDTSessionData;
  } catch (e) {
    console.error("Failed to load PPDT session:", e);
    return null;
  }
}

export function clearSession(courseId: string): void {
  localStorage.removeItem(`ppdt_${courseId}`);
}

export function saveDraft(courseId: string, picNum: number, text: string): void {
  try {
    localStorage.setItem(`ppdt_draft_${courseId}_${picNum}`, text);
  } catch (e) {
    console.error("Failed to save PPDT draft:", e);
  }
}

export function loadDraft(courseId: string, picNum: number): string | null {
  try {
    return localStorage.getItem(`ppdt_draft_${courseId}_${picNum}`);
  } catch (e) {
    console.error("Failed to load PPDT draft:", e);
    return null;
  }
}

export function clearDraft(courseId: string, picNum: number): void {
  localStorage.removeItem(`ppdt_draft_${courseId}_${picNum}`);
}
