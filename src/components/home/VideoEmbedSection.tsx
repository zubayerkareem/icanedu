import { toEmbedUrl } from "@/lib/page-builder/embeds";
import type { VideoEmbedConfig } from "@/lib/page-builder/types";

export function VideoEmbedSection({ config }: { config: VideoEmbedConfig }) {
  const src = toEmbedUrl(config.videoUrl);
  return (
    <section className="py-12 sm:py-16">
      <div className="container max-w-3xl">
        {config.heading && (
          <h2 className="mb-6 text-center font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {config.heading}
          </h2>
        )}
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted shadow-sm">
          {src ? (
            <iframe
              className="h-full w-full"
              src={src}
              title={config.heading || "video"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              ভিডিও পাওয়া যায়নি
            </div>
          )}
        </div>
        {config.description && (
          <p className="mt-4 text-center text-sm text-muted-foreground">{config.description}</p>
        )}
      </div>
    </section>
  );
}
