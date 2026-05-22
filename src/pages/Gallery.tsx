import { Link } from "react-router-dom";

const IMAGES = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  src: `https://picsum.photos/seed/ican${i + 1}/600/400`,
  alt: `গ্যালারি ছবি ${i + 1}`,
}));

const ROWS = Array.from({ length: 5 }, (_, i) => IMAGES.slice(i * 4, i * 4 + 4));

function MarqueeRow({
  images,
  reverse,
  duration,
}: {
  images: typeof IMAGES;
  reverse: boolean;
  duration: number;
}) {
  // Duplicate images for seamless infinite loop
  const track = [...images, ...images];

  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: `${reverse ? "marquee-right" : "marquee-left"} ${duration}s linear infinite`,
        }}
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
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      {/* Page header */}
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="container py-10 sm:py-14">
          <nav aria-label="breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <Link to="/" className="hover:text-foreground">
                  হোম
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li className="text-foreground">গ্যালারি</li>
            </ol>
          </nav>
          <h1 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            গ্যালারি
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            iCANBD-এর কার্যক্রম ও মুহূর্তগুলোর ছবি
          </p>
        </div>
      </section>

      {/* Marquee rows */}
      <section className="py-10 sm:py-14 space-y-4 overflow-hidden">
        {ROWS.map((row, i) => (
          <MarqueeRow
            key={i}
            images={row}
            reverse={i % 2 !== 0}
            duration={18 + i * 2}
          />
        ))}
      </section>
    </>
  );
}
