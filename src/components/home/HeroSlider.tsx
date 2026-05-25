import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg"];
const AUTO_INTERVAL = 4000;

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (idx: number) => setCurrent((idx + SLIDES.length) % SLIDES.length);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), AUTO_INTERVAL);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const prev = () => { go(current - 1); resetTimer(); };
  const next = () => { go(current + 1); resetTimer(); };

  // Touch / drag swipe
  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
    setDragging(true);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - dragStart.current;
    if (Math.abs(delta) > 40) { delta < 0 ? next() : prev(); }
    setDragging(false);
  };

  return (
    <section className="relative w-full overflow-hidden select-none">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setDragging(false)}
      >
        {SLIDES.map((src, i) => (
          <div key={i} className="w-full shrink-0">
            <img
              src={src}
              alt={`Slide ${i + 1}`}
              className="w-full object-cover max-h-[520px]"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { go(i); resetTimer(); }}
            aria-label={`Slide ${i + 1}`}
            className={[
              "h-2 rounded-full transition-all duration-300",
              i === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}
