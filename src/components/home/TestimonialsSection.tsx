import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/strings";
import type { TestimonialsConfig } from "@/lib/page-builder/types";

export function TestimonialsSection({ config }: { config: TestimonialsConfig }) {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelectedIndex(embla.selectedScrollSnap());
    setSnaps(embla.scrollSnapList());
    embla.on("select", onSelect);
    onSelect();
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  useEffect(() => {
    if (!embla || !config.autoSlide) return;
    const ms = Math.max(2, config.intervalSeconds || 5) * 1000;
    const id = window.setInterval(() => {
      if (embla.canScrollNext()) embla.scrollNext();
      else embla.scrollTo(0);
    }, ms);
    return () => window.clearInterval(id);
  }, [embla, config.autoSlide, config.intervalSeconds]);

  const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

  if (!config.items?.length) return null;

  return (
    <section className="py-14 sm:py-20">
      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {config.heading}
          </h2>
          <div className="hidden gap-2 sm:flex">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              aria-label={t.home.prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              aria-label={t.home.next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {config.items.map((it, i) => (
              <div
                key={i}
                className="min-w-0 shrink-0 grow-0 basis-full px-2 sm:basis-1/2 lg:basis-1/3"
              >
                <article className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
                  <div className="flex gap-1 text-accent">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-4 w-4 ${j < it.rating ? "fill-current" : "opacity-30"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 font-body italic text-foreground">
                    “{it.quote}”
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {it.avatar && <AvatarImage src={it.avatar} alt={it.name} />}
                      <AvatarFallback>{it.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{it.name}</div>
                      <div className="text-xs text-muted-foreground">{it.course}</div>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
        {snaps.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {snaps.map((_, i) => (
              <button
                key={i}
                onClick={() => embla?.scrollTo(i)}
                aria-label={`slide-${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === selectedIndex ? "w-6 bg-accent" : "w-2 bg-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
