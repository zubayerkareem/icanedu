import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function FounderSection() {
  const tr = useTranslation();
  const f = tr.home.founder;

  return (
    <section className="relative overflow-hidden bg-[#07091a] py-16 sm:py-24">
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/2 rounded-full bg-pink-700/15 blur-[100px]" />
      </div>

      <div className="container relative">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-10">

          {/* ── LEFT: framed photo ── */}
          <div className="flex justify-center lg:justify-start">
            <div className="overflow-hidden rounded-[1.5rem]" style={{ width: "clamp(300px, 46vw, 580px)" }}>
              <img
                src="/chairman.png"
                alt="Founder & Chairman — iCAN Academy Bangladesh"
                className="w-full object-cover object-top"
                style={{ aspectRatio: "4/3" }}
              />
            </div>
          </div>

          {/* ── RIGHT: content ── */}
          <div className="flex flex-col gap-6">
            <h2 className="font-heading text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {f.heading}{" "}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                {f.headingHighlight}
              </span>
            </h2>
            <div className="h-[2px] w-28 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full -mt-2" />

            <div className="space-y-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              <p>{f.body1}</p>
              <p>{f.body2}</p>
            </div>

            <div className="pt-1">
              <Button
                asChild
                size="lg"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:from-violet-700 hover:to-pink-600 border-0 px-8 shadow-lg shadow-violet-900/40"
              >
                <Link to="/about">{f.cta}</Link>
              </Button>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
    </section>
  );
}
