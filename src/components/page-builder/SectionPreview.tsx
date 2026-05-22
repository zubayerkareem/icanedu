import { Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "./LucideIcon";
import type { AnySection } from "@/lib/page-builder/types";

// Lightweight read-only renderer for the right-panel preview.
// The public homepage will reuse the same components in Phase 3.

function youtubeEmbed(url: string): string | null {
  if (!url) return null;
  const m =
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/youtube\.com\/watch\?v=([\w-]{6,})/) ||
    url.match(/youtube\.com\/embed\/([\w-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function SectionPreview({ section }: { section: AnySection }) {
  switch (section.type) {
    case "hero": {
      const c = section.config;
      const align = c.textAlign === "left" ? "text-left items-start" : c.textAlign === "right" ? "text-right items-end" : "text-center items-center";
      const bg =
        c.backgroundType === "image" && c.backgroundImage
          ? { backgroundImage: `url(${c.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : c.backgroundType === "gradient"
            ? { background: `linear-gradient(135deg, ${c.backgroundColor}, hsl(var(--accent)))` }
            : { backgroundColor: c.backgroundColor };
      return (
        <section className="relative overflow-hidden" style={bg}>
          {c.backgroundType === "image" && (
            <div className="absolute inset-0 bg-black" style={{ opacity: c.overlayOpacity / 100 }} />
          )}
          <div className={`container relative flex min-h-[320px] flex-col justify-center gap-4 py-16 text-white ${align}`}>
            <h1 className="font-heading text-3xl font-bold sm:text-5xl">{c.heading || "—"}</h1>
            <p className="max-w-2xl text-sm sm:text-base opacity-90">{c.subheading}</p>
            {c.buttonText && (
              <Button asChild size="lg" className="mt-2 w-fit">
                <a href={c.buttonLink || "#"}>{c.buttonText}</a>
              </Button>
            )}
          </div>
        </section>
      );
    }

    case "stats": {
      const c = section.config;
      return (
        <section className="py-12" style={{ backgroundColor: c.backgroundColor }}>
          <div className="container grid grid-cols-2 gap-6 md:grid-cols-4">
            {c.items.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <LucideIcon name={s.icon} className="h-6 w-6" />
                </div>
                <div className="mt-3 font-heading text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "featured_courses":
    case "featured_products": {
      const c = section.config;
      const isCourse = section.type === "featured_courses";
      return (
        <section className="py-12">
          <div className="container">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-heading text-2xl font-bold text-foreground">{c.heading}</h2>
              {c.showSeeAll && (
                <Button variant="outline" size="sm" asChild>
                  <a href={isCourse ? "/courses" : "/products"}>সব দেখুন</a>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: c.count }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <div className="aspect-video w-full rounded-md bg-muted" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">প্রিভিউ — প্রকৃত ডেটা পরবর্তী ফেজে আসবে।</p>
          </div>
        </section>
      );
    }

    case "how_it_works": {
      const c = section.config;
      return (
        <section className="py-12">
          <div className="container">
            <h2 className="mb-8 text-center font-heading text-2xl font-bold text-foreground">{c.heading}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
              {c.steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <LucideIcon name={s.icon} className="h-6 w-6" />
                  </div>
                  <div className="mt-3 font-medium text-foreground">{s.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "testimonials": {
      const c = section.config;
      return (
        <section className="bg-muted/40 py-12">
          <div className="container">
            <h2 className="mb-8 text-center font-heading text-2xl font-bold text-foreground">{c.heading}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {c.items.map((it, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < it.rating ? "fill-current" : "opacity-30"}`} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-foreground">“{it.quote}”</p>
                  <div className="mt-4 text-sm font-medium text-foreground">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.course}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "cta_banner": {
      const c = section.config;
      const bg =
        c.backgroundType === "gradient"
          ? { background: `linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo})` }
          : { backgroundColor: c.backgroundColor };
      return (
        <section style={bg} className="text-white">
          <div className="container flex flex-col items-center gap-4 py-12 text-center">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">{c.heading}</h2>
            <p className="max-w-xl opacity-90">{c.subheading}</p>
            {c.buttonText && (
              <Button asChild variant="secondary" size="lg">
                <a href={c.buttonLink || "#"}>{c.buttonText}</a>
              </Button>
            )}
          </div>
        </section>
      );
    }

    case "text_block": {
      const c = section.config;
      return (
        <section className={c.background === "muted" ? "bg-muted/40 py-10" : "bg-background py-10"}>
          <div className="container max-w-3xl whitespace-pre-wrap text-foreground">{c.content}</div>
        </section>
      );
    }

    case "image_banner": {
      const c = section.config;
      const img = (
        <img
          src={c.imageUrl || "/placeholder.svg"}
          alt={c.caption || "banner"}
          className={`w-full object-cover ${c.fullWidth ? "" : "rounded-lg"}`}
        />
      );
      return (
        <section className="py-8">
          <div className={c.fullWidth ? "" : "container"}>
            {c.link ? (
              <a href={c.link} target="_blank" rel="noreferrer">
                {img}
              </a>
            ) : (
              img
            )}
            {c.caption && <p className="mt-2 text-center text-sm text-muted-foreground">{c.caption}</p>}
          </div>
        </section>
      );
    }

    case "video_embed": {
      const c = section.config;
      const src = youtubeEmbed(c.videoUrl);
      return (
        <section className="py-12">
          <div className="container max-w-3xl">
            {c.heading && (
              <h2 className="mb-4 text-center font-heading text-2xl font-bold text-foreground">{c.heading}</h2>
            )}
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
              {src ? (
                <iframe
                  className="h-full w-full"
                  src={src}
                  title={c.heading || "video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  ভিডিও URL দিন
                </div>
              )}
            </div>
            {c.description && <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>}
          </div>
        </section>
      );
    }

    case "faq": {
      const c = section.config;
      return (
        <section className="py-12">
          <div className="container max-w-3xl">
            <h2 className="mb-6 text-center font-heading text-2xl font-bold text-foreground">{c.heading}</h2>
            <Accordion type="single" collapsible className="w-full">
              {c.items.map((it, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-right">{it.question}</AccordionTrigger>
                  <AccordionContent>{it.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      );
    }

    case "notice_preview": {
      const c = section.config;
      return (
        <section className="py-12">
          <div className="container max-w-3xl">
            <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">{c.heading}</h2>
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {Array.from({ length: c.count }).map((_, i) => (
                <li key={i} className="flex items-center justify-between p-4">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">প্রিভিউ — প্রকৃত নোটিশ পরবর্তী ফেজে।</p>
          </div>
        </section>
      );
    }
  }
}
