// Convert a YouTube/Vimeo URL to an embeddable iframe src.
export function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  const yt =
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/youtube\.com\/watch\?v=([\w-]{6,})/) ||
    url.match(/youtube\.com\/embed\/([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}
