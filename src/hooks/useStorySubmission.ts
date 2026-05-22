export interface StorySubmission {
  imageBase64: string;
  submittedAt: string;
}

function key(courseId: string, storyId: string) {
  return `story_${courseId}_${storyId}`;
}

export function loadSubmission(courseId: string, storyId: string): StorySubmission | null {
  try {
    const raw = localStorage.getItem(key(courseId, storyId));
    return raw ? (JSON.parse(raw) as StorySubmission) : null;
  } catch {
    return null;
  }
}

export function saveSubmission(courseId: string, storyId: string, imageBase64: string) {
  const data: StorySubmission = { imageBase64, submittedAt: new Date().toISOString() };
  try {
    localStorage.setItem(key(courseId, storyId), JSON.stringify(data));
  } catch {
    // quota exceeded
    throw new Error("স্টোরেজ পূর্ণ। পুরনো ছবি মুছে আবার চেষ্টা করুন।");
  }
  return data;
}

export function clearSubmission(courseId: string, storyId: string) {
  localStorage.removeItem(key(courseId, storyId));
}
