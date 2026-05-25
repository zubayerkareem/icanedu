import { Link } from "react-router-dom";

const IMAGES = [
  { id: 1,  src: "/gallery/g1.jpg",  alt: "iCAN Academy গ্যালারি ১" },
  { id: 2,  src: "/gallery/g2.jpg",  alt: "iCAN Academy গ্যালারি ২" },
  { id: 3,  src: "/gallery/g3.jpg",  alt: "iCAN Academy গ্যালারি ৩" },
  { id: 4,  src: "/gallery/g4.jpg",  alt: "iCAN Academy গ্যালারি ৪" },
  { id: 5,  src: "/gallery/g5.jpg",  alt: "iCAN Academy গ্যালারি ৫" },
  { id: 6,  src: "/gallery/g6.jpg",  alt: "iCAN Academy গ্যালারি ৬" },
  { id: 7,  src: "/gallery/g7.jpg",  alt: "iCAN Academy গ্যালারি ৭" },
  { id: 8,  src: "/gallery/g8.jpg",  alt: "iCAN Academy গ্যালারি ৮" },
  { id: 9,  src: "/gallery/g9.jpg",  alt: "iCAN Academy গ্যালারি ৯" },
  { id: 10, src: "/gallery/g10.jpg", alt: "iCAN Academy গ্যালারি ১০" },
];

// Each row uses all images; odd rows are reversed for variety
const ROWS = [
  { images: IMAGES,                          reverse: false, duration: 28 },
  { images: [...IMAGES].reverse(),           reverse: true,  duration: 32 },
  { images: IMAGES.slice(3).concat(IMAGES.slice(0, 3)), reverse: false, duration: 25 },
];

function MarqueeRow({ images, reverse, duration }: { images: typeof IMAGES; reverse: boolean; duration: number }) {
  // Triple-duplicate so there's always content in view at any translate position
  const track = [...images, ...images, ...images];

  return (
    <div className="overflow-hidden">
      <div
        className={reverse ? "animate-marquee-right flex gap-4" : "animate-marquee-left flex gap-4"}
        style={{ width: "max-content", "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {track.map((img, idx) => (
          <div
            key={`${img.id}-${idx}`}
            className="w-64 h-44 shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-sm"
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Gallery() {
  return (
    <>
      {/* Page header */}
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container py-10 sm:py-14">
          <nav aria-label="breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li><Link to="/" className="hover:text-foreground">হোম</Link></li>
              <li aria-hidden>›</li>
              <li className="text-foreground">গ্যালারি</li>
            </ol>
          </nav>
          <h1 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">গ্যালারি</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            iCANBD-এর কার্যক্রম ও মুহূর্তগুলোর ছবি
          </p>
        </div>
      </section>

      {/* Marquee rows */}
      <section className="py-10 sm:py-14 space-y-4 overflow-hidden">
        {ROWS.map((row, i) => (
          <MarqueeRow key={i} images={row.images} reverse={row.reverse} duration={row.duration} />
        ))}
      </section>
    </>
  );
}
