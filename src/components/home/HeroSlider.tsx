import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    image: "/hero-3.jpg",
    badge: "ISSB প্রস্তুতি",
    heading: "সশস্ত্র বাহিনীতে\nযোগ দেওয়ার স্বপ্ন?",
    sub: "বাংলাদেশের সবচেয়ে কার্যকর ISSB প্রস্তুতি প্ল্যাটফর্মে স্বাগতম।",
    cta: { label: "ISSB কোর্স দেখুন", to: "/courses" },
    cta2: { label: "বিনামূল্যে শুরু করুন", to: "/register" },
    align: "left" as const,
  },
  {
    image: "/hero-1.jpg",
    badge: "ক্যাডেট কলেজ",
    heading: "ক্যাডেট কলেজে\nভর্তির সেরা গাইড",
    sub: "অভিজ্ঞ শিক্ষক, মডেল টেস্ট ও লাইভ ক্লাস — সবকিছু এক জায়গায়।",
    cta: { label: "ক্যাডেট কোর্স দেখুন", to: "/courses" },
    cta2: { label: "আরও জানুন", to: "/about" },
    align: "center" as const,
  },
  {
    image: "/hero-2.jpg",
    badge: "iCANBD",
    heading: "Dream It.\nPrepare It. Achieve It.",
    sub: "IQ Practice, WAT, IST, PPDT ও আরও অনেক কিছু — সম্পূর্ণ অনলাইনে।",
    cta: { label: "এখনই শুরু করুন", to: "/register" },
    cta2: { label: "কোর্সসমূহ", to: "/courses" },
    align: "right" as const,
  },
];

const AUTO_INTERVAL = 5000;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prev = () => { go(current - 1); resetTimer(); };
  const next = () => { go(current + 1); resetTimer(); };

  const onPointerDown = (e: React.PointerEvent) => { dragStart.current = e.clientX; setDragging(true); };
  const onPointerUp   = (e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - dragStart.current;
    if (Math.abs(delta) > 40) { delta < 0 ? next() : prev(); }
    setDragging(false);
  };

  const slide = SLIDES[current];

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      style={{ minHeight: "clamp(380px, 60vw, 620px)" }}
    >
      {/* Slide images */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setDragging(false)}
      >
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className="relative w-full shrink-0"
            style={{ minHeight: "clamp(380px, 60vw, 620px)" }}
          >
            <img
              src={s.image}
              alt={`Slide ${i + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
          </div>
        ))}
      </div>

      {/* Content overlay — animates on slide change */}
      <div
        key={current}
        className={[
          "absolute inset-0 flex flex-col justify-end pb-14 sm:pb-16 px-5 sm:px-10 lg:px-16",
          "animate-fade-in",
          slide.align === "center" ? "items-center text-center"
            : slide.align === "right" ? "items-end text-right"
            : "items-start text-left",
        ].join(" ")}
      >
        {/* Badge */}
        <span className="mb-3 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
          {slide.badge}
        </span>

        {/* Heading */}
        <h1 className="font-heading text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl xl:text-6xl whitespace-pre-line">
          {slide.heading}
        </h1>

        {/* Sub */}
        <p className="mt-3 max-w-lg text-sm text-white/85 drop-shadow sm:text-base lg:text-lg">
          {slide.sub}
        </p>

        {/* CTAs */}
        <div className={["mt-5 flex flex-wrap gap-3", slide.align === "center" ? "justify-center" : slide.align === "right" ? "justify-end" : ""].join(" ")}>
          <Link
            to={slide.cta.to}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:brightness-110 active:scale-95"
          >
            {slide.cta.label}
          </Link>
          <Link
            to={slide.cta2.to}
            className="rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
          >
            {slide.cta2.label}
          </Link>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { go(i); resetTimer(); }}
            aria-label={`Slide ${i + 1}`}
            className={[
              "rounded-full transition-all duration-300",
              i === current
                ? "h-2.5 w-8 bg-white"
                : "h-2.5 w-2.5 bg-white/40 hover:bg-white/70",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}
