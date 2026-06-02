import { supabase } from "@/lib/supabase";

const BUCKET = "course-media";

/**
 * Upload a file to the course-media bucket and return its public URL.
 * @param file   the File to upload
 * @param folder logical sub-folder, e.g. "thumbnails" | "resources"
 */
export async function uploadCourseMedia(
  file: File,
  folder: "thumbnails" | "resources"
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
