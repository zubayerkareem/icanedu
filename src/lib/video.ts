// Convert a YouTube/Vimeo watch URL into an embeddable URL. Returns null if unrecognized.
export function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube: youtube.com/watch?v=ID or youtu.be/ID
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    // Vimeo: vimeo.com/ID
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    // invalid URL
  }
  return null;
}
