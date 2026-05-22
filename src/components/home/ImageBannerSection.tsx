import type { ImageBannerConfig } from "@/lib/page-builder/types";

export function ImageBannerSection({ config }: { config: ImageBannerConfig }) {
  if (!config.imageUrl) return null;
  const img = (
    <img
      src={config.imageUrl}
      alt={config.caption || "banner"}
      loading="lazy"
      className={`w-full object-cover ${config.fullWidth ? "" : "rounded-lg"}`}
    />
  );
  return (
    <section className="py-8">
      <div className={config.fullWidth ? "" : "container"}>
        {config.link ? (
          <a href={config.link} target="_blank" rel="noreferrer" className="block">
            {img}
          </a>
        ) : (
          img
        )}
        {config.caption && (
          <p className="mt-3 text-center text-sm text-muted-foreground">{config.caption}</p>
        )}
      </div>
    </section>
  );
}
