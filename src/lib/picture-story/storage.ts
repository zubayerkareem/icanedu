export interface PictureStorySubmission {
  picture_number: number;
  image_data: string; // base64
  submitted_at: string;
}

export interface PictureStorySession {
  set_id: string;
  started_at: string;
  submissions: PictureStorySubmission[];
  completed: boolean;
}

const key = (courseId: string) => `picture_story_${courseId}`;

export function saveSession(courseId: string, data: PictureStorySession): void {
  try {
    localStorage.setItem(key(courseId), JSON.stringify(data));
  } catch {
    // storage quota exceeded (large images)
  }
}

export function loadSession(courseId: string): PictureStorySession | null {
  try {
    const raw = localStorage.getItem(key(courseId));
    return raw ? (JSON.parse(raw) as PictureStorySession) : null;
  } catch {
    return null;
  }
}

export function clearSession(courseId: string): void {
  localStorage.removeItem(key(courseId));
}
